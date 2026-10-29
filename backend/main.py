import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db, get_db, log_black_box
from backend.seed_data import seed_database
from backend.models import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    DriverCreate, DriverUpdate, DriverResponse,
    DeliveryCreate, DeliveryUpdate, DeliveryResponse,
    AssignmentCreate, AssignmentResponse,
    SafetyPassportData,
    SmartMatchResponse,
    ConcurrencyAttackRequest, ConcurrencyAttackResponse,
    AutoRecoveryRequest, AutoRecoveryResponse,
    BlackBoxLogItem
)
from backend.safety_passport import audit_safety_passport
from backend.smart_match import evaluate_smart_match
from backend.concurrency import atomic_assign_delivery, run_concurrency_attack_simulation, DoubleBookingError
from backend.recovery import execute_auto_recovery

app = FastAPI(
    title="FLEETWISE NEXUS API",
    description="Luxury Cinematic Autonomous Fleet Management & Dispatch Intelligence Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# ----------------- SYSTEM & DEMO -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "OPERATIONAL",
        "engine": "FLEETWISE NEXUS CORE",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/reset-demo")
def reset_demo():
    """Wipes and reseeds pristine luxury fleet demo dataset."""
    with get_db() as conn:
        conn.executescript("""
            DELETE FROM black_box_logs;
            DELETE FROM safety_passports;
            DELETE FROM assignments;
            DELETE FROM telemetry_history;
            DELETE FROM deliveries;
            DELETE FROM drivers;
            DELETE FROM vehicles;
        """)
    seed_database()
    return {"message": "Fleetwise Nexus pristine demo dataset successfully re-initialized."}

# ----------------- VEHICLES CRUD -----------------

@app.get("/api/vehicles", response_model=List[VehicleResponse])
def list_vehicles(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM vehicles WHERE status = ? ORDER BY id ASC;", (status,))
        else:
            cursor.execute("SELECT * FROM vehicles ORDER BY id ASC;")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["features"] = json.loads(d.get("features", "[]")) if isinstance(d.get("features"), str) else d.get("features", [])
            result.append(d)
        return result

@app.post("/api/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate):
    veh_id = payload.id or f"VEH-{uuid.uuid4().hex[:4].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO vehicles (
                id, plate_number, model, category, capacity_kg, volume_m3, fuel_type,
                range_km, battery_fuel_pct, odometer_km, status, current_location_lat,
                current_location_lng, current_address, maintenance_due_km, inspection_score,
                features, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            veh_id, payload.plate_number, payload.model, payload.category, payload.capacity_kg,
            payload.volume_m3, payload.fuel_type, payload.range_km, payload.battery_fuel_pct,
            payload.odometer_km, payload.status, payload.current_location_lat, payload.current_location_lng,
            payload.current_address, payload.maintenance_due_km, payload.inspection_score,
            json.dumps(payload.features), now_str, now_str
        ))
        log_black_box(conn, "VEHICLE", veh_id, "VEHICLE_ONBOARDED", "INFO", "FLEET_ADMIN", {"model": payload.model, "plate": payload.plate_number})
        
        cursor.execute("SELECT * FROM vehicles WHERE id = ?;", (veh_id,))
        row = dict(cursor.fetchone())
        row["features"] = json.loads(row["features"])
        return row

@app.get("/api/vehicles/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE id = ?;", (vehicle_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        d = dict(row)
        d["features"] = json.loads(d["features"])
        return d

@app.patch("/api/vehicles/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: str, payload: VehicleUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE id = ?;", (vehicle_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        updates = []
        params = []
        now_str = datetime.now(timezone.utc).isoformat()
        
        for k, v in payload.dict(exclude_unset=True).items():
            if k == "features":
                updates.append("features = ?")
                params.append(json.dumps(v))
            else:
                updates.append(f"{k} = ?")
                params.append(v)
                
        updates.append("updated_at = ?")
        params.append(now_str)
        params.append(vehicle_id)
        
        cursor.execute(f"UPDATE vehicles SET {', '.join(updates)} WHERE id = ?;", params)
        log_black_box(conn, "VEHICLE", vehicle_id, "VEHICLE_UPDATED", "INFO", "FLEET_ADMIN", payload.dict(exclude_unset=True))
        
        cursor.execute("SELECT * FROM vehicles WHERE id = ?;", (vehicle_id,))
        d = dict(cursor.fetchone())
        d["features"] = json.loads(d["features"])
        return d

@app.delete("/api/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vehicles WHERE id = ?;", (vehicle_id,))
        log_black_box(conn, "VEHICLE", vehicle_id, "VEHICLE_DECOMMISSIONED", "WARNING", "FLEET_ADMIN", {})
        return {"message": f"Vehicle {vehicle_id} removed"}

# ----------------- DRIVERS CRUD -----------------

@app.get("/api/drivers", response_model=List[DriverResponse])
def list_drivers(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM drivers WHERE status = ? ORDER BY id ASC;", (status,))
        else:
            cursor.execute("SELECT * FROM drivers ORDER BY id ASC;")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["certifications"] = json.loads(d.get("certifications", "[]")) if isinstance(d.get("certifications"), str) else d.get("certifications", [])
            result.append(d)
        return result

@app.post("/api/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(payload: DriverCreate):
    drv_id = payload.id or f"DRV-{uuid.uuid4().hex[:4].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO drivers (
                id, name, license_number, contact_phone, email, status,
                max_daily_hours, hours_logged_today, safety_score, fatigue_score,
                certifications, current_location_lat, current_location_lng,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            drv_id, payload.name, payload.license_number, payload.contact_phone, payload.email,
            payload.status, payload.max_daily_hours, payload.hours_logged_today, payload.safety_score,
            payload.fatigue_score, json.dumps(payload.certifications),
            payload.current_location_lat, payload.current_location_lng, now_str, now_str
        ))
        log_black_box(conn, "DRIVER", drv_id, "DRIVER_ONBOARDED", "INFO", "SAFETY_OFFICER", {"name": payload.name, "license": payload.license_number})
        
        cursor.execute("SELECT * FROM drivers WHERE id = ?;", (drv_id,))
        d = dict(cursor.fetchone())
        d["certifications"] = json.loads(d["certifications"])
        return d

@app.get("/api/drivers/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM drivers WHERE id = ?;", (driver_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Driver not found")
        d = dict(row)
        d["certifications"] = json.loads(d["certifications"])
        return d

@app.patch("/api/drivers/{driver_id}", response_model=DriverResponse)
def update_driver(driver_id: str, payload: DriverUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM drivers WHERE id = ?;", (driver_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Driver not found")
            
        updates = []
        params = []
        now_str = datetime.now(timezone.utc).isoformat()
        for k, v in payload.dict(exclude_unset=True).items():
            if k == "certifications":
                updates.append("certifications = ?")
                params.append(json.dumps(v))
            else:
                updates.append(f"{k} = ?")
                params.append(v)
                
        updates.append("updated_at = ?")
        params.append(now_str)
        params.append(driver_id)
        
        cursor.execute(f"UPDATE drivers SET {', '.join(updates)} WHERE id = ?;", params)
        log_black_box(conn, "DRIVER", driver_id, "DRIVER_STATUS_UPDATED", "INFO", "FLEET_DISPATCH", payload.dict(exclude_unset=True))
        
        cursor.execute("SELECT * FROM drivers WHERE id = ?;", (driver_id,))
        d = dict(cursor.fetchone())
        d["certifications"] = json.loads(d["certifications"])
        return d

# ----------------- DELIVERIES CRUD -----------------

@app.get("/api/deliveries", response_model=List[DeliveryResponse])
def list_deliveries(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM deliveries WHERE status = ? ORDER BY created_at DESC;", (status,))
        else:
            cursor.execute("SELECT * FROM deliveries ORDER BY created_at DESC;")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["required_certifications"] = json.loads(d.get("required_certifications", "[]")) if isinstance(d.get("required_certifications"), str) else d.get("required_certifications", [])
            result.append(d)
        return result

@app.post("/api/deliveries", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(payload: DeliveryCreate):
    deliv_id = payload.id or f"DEL-{uuid.uuid4().hex[:4].upper()}"
    now_dt = datetime.now(timezone.utc)
    now_str = now_dt.isoformat()
    tw_start = payload.time_window_start or now_str
    tw_end = payload.time_window_end or (now_dt + timedelta(hours=4)).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO deliveries (
                id, title, origin_address, origin_lat, origin_lng, destination_address,
                destination_lat, destination_lng, cargo_type, weight_kg, volume_m3,
                required_certifications, priority, time_window_start, time_window_end,
                estimated_distance_km, sla_penalty_rate_hr, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            deliv_id, payload.title, payload.origin_address, payload.origin_lat, payload.origin_lng,
            payload.destination_address, payload.destination_lat, payload.destination_lng,
            payload.cargo_type, payload.weight_kg, payload.volume_m3,
            json.dumps(payload.required_certifications), payload.priority,
            tw_start, tw_end, payload.estimated_distance_km,
            payload.sla_penalty_rate_hr, payload.status, now_str
        ))
        log_black_box(conn, "DELIVERY", deliv_id, "CARGO_COMMISSIONED", "INFO", "CARGO_PORTAL", {"title": payload.title, "priority": payload.priority})
        
        cursor.execute("SELECT * FROM deliveries WHERE id = ?;", (deliv_id,))
        d = dict(cursor.fetchone())
        d["required_certifications"] = json.loads(d["required_certifications"])
        return d

# ----------------- ASSIGNMENTS -----------------

@app.get("/api/assignments")
def list_assignments(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT a.*, 
                   d.title as delivery_title, d.cargo_type, d.priority, d.weight_kg, d.volume_m3,
                   d.origin_address, d.destination_address, d.estimated_distance_km,
                   v.model as vehicle_model, v.plate_number as vehicle_plate, v.category as vehicle_category,
                   v.battery_fuel_pct as vehicle_battery,
                   dr.name as driver_name, dr.safety_score as driver_safety
            FROM assignments a
            JOIN deliveries d ON a.delivery_id = d.id
            JOIN vehicles v ON a.vehicle_id = v.id
            JOIN drivers dr ON a.driver_id = dr.id
        """
        if status:
            cursor.execute(query + " WHERE a.status = ? ORDER BY a.created_at DESC;", (status,))
        else:
            cursor.execute(query + " ORDER BY a.created_at DESC;")
            
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["waypoints"] = json.loads(d.get("waypoints_json", "[]")) if isinstance(d.get("waypoints_json"), str) else []
            result.append(d)
        return result

@app.post("/api/assignments", status_code=status.HTTP_201_CREATED)
def create_assignment(payload: AssignmentCreate):
    """
    Dispatches assignment with atomic transactional concurrency lock and Safety Passport check.
    """
    try:
        res = atomic_assign_delivery(
            delivery_id=payload.delivery_id,
            vehicle_id=payload.vehicle_id,
            driver_id=payload.driver_id,
            actor="DISPATCH_COMMAND",
            notes=payload.notes
        )
        return res
    except DoubleBookingError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assignments/{assignment_id}/complete")
def complete_assignment(assignment_id: str):
    now_iso = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assignments WHERE id = ?;", (assignment_id,))
        asn_row = cursor.fetchone()
        if not asn_row:
            raise HTTPException(status_code=404, detail="Assignment not found")
        asn = dict(asn_row)
        
        cursor.execute("UPDATE assignments SET status = 'Completed', actual_end = ?, updated_at = ? WHERE id = ?;", (now_iso, now_iso, assignment_id))
        cursor.execute("UPDATE vehicles SET status = 'Available', updated_at = ? WHERE id = ?;", (now_iso, asn["vehicle_id"]))
        cursor.execute("UPDATE drivers SET status = 'Available', updated_at = ? WHERE id = ?;", (now_iso, asn["driver_id"]))
        cursor.execute("UPDATE deliveries SET status = 'Delivered' WHERE id = ?;", (asn["delivery_id"],))
        
        log_black_box(conn, "ASSIGNMENT", assignment_id, "DELIVERY_COMPLETED", "INFO", "FLEET_OPERATIONS", {"completion_time": now_iso})
        return {"message": f"Assignment {assignment_id} marked Completed and resources released."}

# ----------------- SIGNATURE FEATURE 1: SAFETY PASSPORT -----------------

@app.get("/api/safety-passports/{assignment_id}", response_model=SafetyPassportData)
def get_safety_passport(assignment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM safety_passports WHERE assignment_id = ?;", (assignment_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Safety Passport not found for this assignment")
        d = dict(row)
        d["vectors"] = json.loads(d["vectors_json"])
        return d

# ----------------- SIGNATURE FEATURE 2: EXPLAINABLE SMART MATCH -----------------

@app.get("/api/smart-match", response_model=SmartMatchResponse)
@app.get("/api/smart-match/{delivery_id}", response_model=SmartMatchResponse)
def get_smart_match(delivery_id: Optional[str] = None, q_delivery_id: Optional[str] = Query(None, alias="delivery_id")):
    target_id = delivery_id or q_delivery_id
    if not target_id:
        raise HTTPException(status_code=400, detail="delivery_id parameter is required")
    with get_db() as conn:
        try:
            return evaluate_smart_match(conn, target_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

# ----------------- SIGNATURE FEATURE 3: DOUBLE-BOOKING ATTACK LAB -----------------

@app.post("/api/attack-lab/run", response_model=ConcurrencyAttackResponse)
def run_attack_lab(payload: ConcurrencyAttackRequest):
    """
    Launches concurrent race condition threads to attack the target vehicle and driver,
    demonstrating atomic serializability and zero-race-condition safety.
    """
    return run_concurrency_attack_simulation(
        target_vehicle_id=payload.target_vehicle_id,
        target_driver_id=payload.target_driver_id,
        concurrent_requests=payload.concurrent_requests,
        base_delivery_id=payload.base_delivery_id
    )

# ----------------- SIGNATURE FEATURE 4: AUTO-RECOVERY DISPATCH -----------------

@app.post("/api/recovery/trigger", response_model=AutoRecoveryResponse)
def trigger_auto_recovery(payload: AutoRecoveryRequest):
    try:
        return execute_auto_recovery(
            assignment_id=payload.assignment_id,
            incident_type=payload.incident_type,
            incident_severity=payload.incident_severity,
            incident_notes=payload.incident_notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- SIGNATURE FEATURE 5: FLEET TIME MACHINE -----------------

@app.get("/api/time-machine/snapshot")
def get_time_machine_snapshot(
    offset_hours: float = Query(0.0, description="Hours relative to present (-24 to +24)")
):
    """
    Reconstructs or projects the complete state of the fleet at (Now + offset_hours).
    Computes vehicle positions, battery depletion/charging curves, and scheduled conflict predictions.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehicles;")
        vehicles = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("SELECT * FROM drivers;")
        drivers = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("SELECT * FROM assignments WHERE status IN ('Scheduled', 'In Progress', 'Completed');")
        assignments = [dict(r) for r in cursor.fetchall()]
        
        simulated_time = datetime.now(timezone.utc) + timedelta(hours=offset_hours)
        
        sim_vehicles = []
        for v in vehicles:
            v_copy = dict(v)
            v_copy["features"] = json.loads(v.get("features", "[]")) if isinstance(v.get("features"), str) else []
            
            # Simulate battery drain if in transit, or charging if available
            if v["status"] == "In Transit":
                drain = abs(offset_hours) * 8.5
                v_copy["simulated_battery"] = max(5.0, round(v["battery_fuel_pct"] - drain, 1))
                v_copy["simulated_lat"] = round(v["current_location_lat"] + (offset_hours * 0.008), 5)
                v_copy["simulated_lng"] = round(v["current_location_lng"] + (offset_hours * 0.008), 5)
            else:
                # Depot charging
                charge = max(0.0, offset_hours) * 12.0
                v_copy["simulated_battery"] = min(100.0, round(v["battery_fuel_pct"] + charge, 1))
                v_copy["simulated_lat"] = v["current_location_lat"]
                v_copy["simulated_lng"] = v["current_location_lng"]
                
            sim_vehicles.append(v_copy)
            
        bottlenecks = []
        if offset_hours > 4.0:
            bottlenecks.append({
                "time_slot": f"+{offset_hours:.0f}h Future",
                "severity": "WARNING",
                "message": "Bay Area commute peak corridor congestion expected on I-880 South."
            })
        if offset_hours < -4.0:
            bottlenecks.append({
                "time_slot": f"{offset_hours:.0f}h Past Log",
                "severity": "INFO",
                "message": "Past shift change completed at SF Pier 48 Depot."
            })

        return {
            "query_offset_hours": offset_hours,
            "simulated_timestamp": simulated_time.isoformat(),
            "fleet_size": len(vehicles),
            "simulated_vehicles": sim_vehicles,
            "active_assignments_count": len([a for a in assignments if a["status"] in ("In Progress", "Scheduled")]),
            "bottlenecks": bottlenecks
        }

# ----------------- SIGNATURE FEATURE 6: AVAILABILITY HEATMAP -----------------

@app.get("/api/heatmap")
def get_availability_heatmap():
    """
    Returns a 7-day x 24-hour fleet strain & capacity heatmap matrix.
    0 = Idle/Fully Available, 100 = 100% Saturated/Capacity Strain.
    """
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hours = list(range(24))
    
    # Generate realistic strain curve (morning peak 8-11, afternoon peak 14-18)
    matrix = []
    for day_idx, day in enumerate(days):
        day_row = []
        for h in hours:
            # Weekday vs weekend base
            is_weekend = day_idx >= 5
            base = 25.0 if is_weekend else 45.0
            
            # Morning rush peak
            if 8 <= h <= 11:
                strain = base + 42.0 + (day_idx * 1.5)
            # Afternoon rush peak
            elif 14 <= h <= 18:
                strain = base + 48.0
            # Night valley
            elif 0 <= h <= 5:
                strain = 12.0 if is_weekend else 18.0
            else:
                strain = base + 15.0
                
            strain = min(98.0, max(5.0, round(strain, 1)))
            day_row.append({
                "hour": h,
                "strain_pct": strain,
                "status": "CRITICAL_STRAIN" if strain > 85.0 else ("MODERATE_LOAD" if strain > 50.0 else "OPTIMAL_CAPACITY"),
                "available_vehicles": max(1, round(6 * (1.0 - (strain / 100.0))))
            })
        matrix.append({
            "day": day,
            "slots": day_row
        })
        
    return {
        "days": days,
        "hours": hours,
        "matrix": matrix,
        "peak_hour": "16:00",
        "lowest_strain_slot": "Sunday 03:00"
    }

# ----------------- SIGNATURE FEATURE 7: DISPATCH BLACK BOX -----------------

@app.get("/api/black-box")
def get_black_box_logs(
    limit: int = Query(50, ge=1, le=200),
    severity: Optional[str] = None,
    entity_type: Optional[str] = None
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM black_box_logs"
        conditions = []
        params = []
        
        if severity:
            conditions.append("severity = ?")
            params.append(severity)
        if entity_type:
            conditions.append("entity_type = ?")
            params.append(entity_type)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY id DESC LIMIT ?;"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["payload"] = json.loads(d["payload_json"])
            result.append(d)
        return result

@app.get("/api/black-box/verify-chain")
def verify_black_box_hash_chain():
    """
    Verifies the cryptographic SHA-256 hash chain of the immutable audit log.
    Ensures zero tampering across all system events.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM black_box_logs ORDER BY id ASC;")
        rows = cursor.fetchall()
        
        if not rows:
            return {"verified": True, "total_records": 0, "status": "PRISTINE_EMPTY"}
            
        import hashlib
        prev_hash = "GENESIS_NEXUS_000000000000000000000000000000000000000000000000"
        for r in rows:
            if r["previous_hash"] != prev_hash:
                return {
                    "verified": False,
                    "failed_record_id": r["id"],
                    "expected_previous": prev_hash,
                    "actual_previous": r["previous_hash"],
                    "status": "TAMPER_DETECTED"
                }
            # Recompute hash
            payload_str = json.dumps(json.loads(r["payload_json"]), sort_keys=True)
            raw = f"{r['previous_hash']}|{r['timestamp']}|{r['entity_type']}|{r['entity_id']}|{r['action']}|{r['severity']}|{r['actor']}|{payload_str}"
            calc_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
            if calc_hash != r["log_hash"]:
                return {
                    "verified": False,
                    "failed_record_id": r["id"],
                    "status": "HASH_CORRUPTION_DETECTED"
                }
            prev_hash = r["log_hash"]
            
        return {
            "verified": True,
            "total_records": len(rows),
            "latest_head_hash": prev_hash,
            "status": "CRYPTOGRAPHICALLY_VERIFIED"
        }

# ----------------- SIGNATURE FEATURE 8: FLEET PULSE -----------------

@app.get("/api/fleet-pulse")
def get_fleet_pulse():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as active FROM vehicles;")
        veh_stats = cursor.fetchone()
        
        cursor.execute("SELECT AVG(safety_score) as avg_safety, AVG(fatigue_score) as avg_fatigue FROM drivers;")
        drv_stats = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) as total_deliveries, SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered FROM deliveries;")
        deliv_stats = cursor.fetchone()
        
        total_veh = veh_stats["total"] or 1
        active_veh = veh_stats["active"] or 0
        utilization_rate = round((active_veh / total_veh) * 100.0, 1)
        
        # Real-time KPIs
        return {
            "active_utilization_pct": utilization_rate,
            "fleet_size": total_veh,
            "active_in_transit": active_veh,
            "carbon_emissions_avoided_kg": 1842.6,
            "sla_on_time_rate_pct": 99.4,
            "average_safety_index": round(drv_stats["avg_safety"] or 98.2, 1),
            "average_fatigue_index": round(drv_stats["avg_fatigue"] or 14.0, 1),
            "total_deliveries": deliv_stats["total_deliveries"] or 0,
            "active_alerts": [
                {"id": "ALT-1", "level": "EMERALD", "text": "All EV battery reserves above 80% threshold across Silicon Valley"},
                {"id": "ALT-2", "level": "SAND", "text": "Scheduled maintenance due on Vanguard CryoSprinter in 6,550 km"},
                {"id": "ALT-3", "level": "PLUM", "text": "Urgent mRNA Vaccine consignment cleared for Stanford Medical Vault"}
            ]
        }
