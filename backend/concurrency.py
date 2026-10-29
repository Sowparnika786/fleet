import time
import uuid
import json
import concurrent.futures
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import sqlite3

from backend.database import get_atomic_db, get_db, log_black_box
from backend.safety_passport import audit_safety_passport, save_safety_passport

class DoubleBookingError(Exception):
    def __init__(self, message: str, status_code: int = 409):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def atomic_assign_delivery(
    delivery_id: str,
    vehicle_id: str,
    driver_id: str,
    actor: str = "DISPATCH_AI",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes an atomic, concurrency-safe dispatch assignment using SQLite BEGIN IMMEDIATE.
    Guarantees absolute atomicity: if another thread is attempting to book the same vehicle
    or driver concurrently, SQLite serializes the transaction; the first transaction
    flips status to 'In Transit'/'On Duty', causing all subsequent colliding transactions
    to fail immediately with a DoubleBookingError (409 Conflict).
    """
    assignment_id = f"ASN-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    with get_atomic_db() as conn:
        cursor = conn.cursor()
        
        # 1. Inspect Vehicle state under immediate lock
        cursor.execute("SELECT * FROM vehicles WHERE id = ?;", (vehicle_id,))
        veh_row = cursor.fetchone()
        if not veh_row:
            raise DoubleBookingError(f"Vehicle {vehicle_id} does not exist", status_code=404)
        vehicle = dict(veh_row)
        if vehicle["status"] != "Available":
            # Prevent double booking!
            log_black_box(
                conn, "VEHICLE", vehicle_id, "DOUBLE_BOOKING_PREVENTED", "WARNING", actor,
                {"error": f"Vehicle is {vehicle['status']}, cannot book", "attempted_delivery": delivery_id}
            )
            raise DoubleBookingError(f"Collision blocked: Vehicle {vehicle_id} ({vehicle['model']}) is currently {vehicle['status']}.")

        # 2. Inspect Driver state under immediate lock
        cursor.execute("SELECT * FROM drivers WHERE id = ?;", (driver_id,))
        drv_row = cursor.fetchone()
        if not drv_row:
            raise DoubleBookingError(f"Driver {driver_id} does not exist", status_code=404)
        driver = dict(drv_row)
        if driver["status"] != "Available":
            # Prevent double booking!
            log_black_box(
                conn, "DRIVER", driver_id, "DOUBLE_BOOKING_PREVENTED", "WARNING", actor,
                {"error": f"Driver is {driver['status']}, cannot book", "attempted_delivery": delivery_id}
            )
            raise DoubleBookingError(f"Collision blocked: Driver {driver_id} ({driver['name']}) is currently {driver['status']}.")

        # 3. Inspect Delivery state
        cursor.execute("SELECT * FROM deliveries WHERE id = ?;", (delivery_id,))
        deliv_row = cursor.fetchone()
        if not deliv_row:
            raise DoubleBookingError(f"Delivery {delivery_id} does not exist", status_code=404)
        delivery = dict(deliv_row)
        if delivery["status"] != "Pending":
            raise DoubleBookingError(f"Delivery {delivery_id} is already in state '{delivery['status']}'.")

        # 4. Check for active overlapping assignments table level
        cursor.execute("""
            SELECT COUNT(*) as count FROM assignments 
            WHERE (vehicle_id = ? OR driver_id = ?) 
            AND status IN ('Scheduled', 'In Progress');
        """, (vehicle_id, driver_id))
        if cursor.fetchone()["count"] > 0:
            raise DoubleBookingError("Race condition detected: Resource has an active uncompleted assignment.")

        # 5. Run Safety Passport audit
        passport = audit_safety_passport(conn, assignment_id, vehicle, driver, delivery)
        if passport["verdict"] == "REJECTED":
            log_black_box(
                conn, "ASSIGNMENT", assignment_id, "SAFETY_PASSPORT_REJECTED", "CRITICAL", actor,
                {"warnings": passport["warnings"]}
            )
            raise DoubleBookingError(f"Safety Passport compliance violation: {'; '.join(passport['warnings'])}", status_code=422)

        # 6. Generate synthetic route waypoints
        waypoints = [
            {"name": "Origin Hub", "lat": delivery["origin_lat"], "lng": delivery["origin_lng"], "status": "COMPLETED"},
            {"name": "Midpoint Checkpoint", "lat": (delivery["origin_lat"] + delivery["destination_lat"]) / 2, "lng": (delivery["origin_lng"] + delivery["destination_lng"]) / 2, "status": "PENDING"},
            {"name": "Destination Vault", "lat": delivery["destination_lat"], "lng": delivery["destination_lng"], "status": "PENDING"}
        ]

        # 7. Atomically insert assignment & mutate entity statuses
        cursor.execute("""
            INSERT INTO assignments (
                id, delivery_id, vehicle_id, driver_id, status, scheduled_start,
                scheduled_end, passport_hash, passport_score, risk_score,
                carbon_kg_est, waypoints_json, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assignment_id, delivery_id, vehicle_id, driver_id, "Scheduled",
            delivery["time_window_start"], delivery["time_window_end"],
            passport["hash"], passport["overall_score"], round(100.0 - passport["overall_score"], 1),
            round(delivery["estimated_distance_km"] * 0.04, 2),
            json.dumps(waypoints), notes or "Dispatched with Nexus Safety Clearance",
            now_iso, now_iso
        ))

        # Save Safety Passport now that assignment exists in DB
        save_safety_passport(conn, passport)

        cursor.execute("UPDATE vehicles SET status = 'In Transit', updated_at = ? WHERE id = ?;", (now_iso, vehicle_id))
        cursor.execute("UPDATE drivers SET status = 'On Duty', updated_at = ? WHERE id = ?;", (now_iso, driver_id))
        cursor.execute("UPDATE deliveries SET status = 'Assigned' WHERE id = ?;", (delivery_id,))

        # 8. Append to Black Box
        blackbox_hash = log_black_box(
            conn, "ASSIGNMENT", assignment_id, "DISPATCH_AUTHORIZED", "INFO", actor,
            {
                "vehicle_id": vehicle_id,
                "driver_id": driver_id,
                "delivery_id": delivery_id,
                "passport_hash": passport["hash"],
                "score": passport["overall_score"]
            }
        )

    return {
        "assignment_id": assignment_id,
        "delivery_id": delivery_id,
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "status": "Scheduled",
        "passport": passport,
        "blackbox_hash": blackbox_hash,
        "created_at": now_iso
    }

def run_concurrency_attack_simulation(
    target_vehicle_id: str,
    target_driver_id: str,
    concurrent_requests: int = 15,
    base_delivery_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Simulates a high-intensity race condition attack where N concurrent threads
    attempt to book the same vehicle & driver at the exact same millisecond.
    Demonstrates zero-race condition SQLite atomicity and returns granular analytics.
    """
    total_reqs = max(2, min(50, concurrent_requests))
    
    # Create temporary synthetic test deliveries for the race
    temp_delivery_ids: List[str] = []
    with get_db() as conn:
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        for i in range(total_reqs):
            temp_id = f"DEL-ATTACK-{uuid.uuid4().hex[:6].upper()}"
            temp_delivery_ids.append(temp_id)
            cursor.execute("""
                INSERT INTO deliveries (
                    id, title, origin_address, origin_lat, origin_lng, destination_address,
                    destination_lat, destination_lng, cargo_type, weight_kg, volume_m3,
                    required_certifications, priority, time_window_start, time_window_end,
                    estimated_distance_km, sla_penalty_rate_hr, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                temp_id, f"Race Condition Stress Probe #{i+1}",
                "SF Pier 48 Terminal", 37.7749, -122.4194,
                "Oakland Hub Gate 4", 37.8044, -122.2712,
                "Standard Cargo", 500.0, 2.5, "[]", "Urgent",
                now_str, now_str, 20.0, 50.0, "Pending", now_str
            ))

    results: List[Dict[str, Any]] = []

    def dispatch_worker(index: int, deliv_id: str):
        t0 = time.time()
        attempt_time = datetime.now(timezone.utc).isoformat()
        try:
            res = atomic_assign_delivery(
                delivery_id=deliv_id,
                vehicle_id=target_vehicle_id,
                driver_id=target_driver_id,
                actor="DOUBLE_BOOKING_ATTACK_LAB",
                notes=f"Concurrent thread #{index+1} race test"
            )
            lat = round((time.time() - t0) * 1000.0, 2)
            return {
                "request_index": index + 1,
                "delivery_id": deliv_id,
                "success": True,
                "status_code": 200,
                "latency_ms": lat,
                "assignment_id": res["assignment_id"],
                "error_message": None,
                "timestamp": attempt_time
            }
        except DoubleBookingError as e:
            lat = round((time.time() - t0) * 1000.0, 2)
            return {
                "request_index": index + 1,
                "delivery_id": deliv_id,
                "success": False,
                "status_code": e.status_code,
                "latency_ms": lat,
                "assignment_id": None,
                "error_message": e.message,
                "timestamp": attempt_time
            }
        except Exception as e:
            lat = round((time.time() - t0) * 1000.0, 2)
            return {
                "request_index": index + 1,
                "delivery_id": deliv_id,
                "success": False,
                "status_code": 500,
                "latency_ms": lat,
                "assignment_id": None,
                "error_message": str(e),
                "timestamp": attempt_time
            }

    # Execute concurrent dispatch attempts simultaneously
    with concurrent.futures.ThreadPoolExecutor(max_workers=total_reqs) as executor:
        futures = [executor.submit(dispatch_worker, idx, did) for idx, did in enumerate(temp_delivery_ids)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())

    # Sort results by request_index
    results.sort(key=lambda x: x["request_index"])

    successes = sum(1 for r in results if r["success"])
    blocked = sum(1 for r in results if not r["success"])
    mean_lat = round(sum(r["latency_ms"] for r in results) / len(results), 2) if results else 0.0

    # Log overall attack outcome to black box
    with get_db() as conn:
        log_black_box(
            conn, "ATTACK_LAB", f"SIM-{uuid.uuid4().hex[:6].upper()}", "ATTACK_LAB_EXECUTED",
            "SECURITY_ALERT", "ATTACK_LAB_ENGINE",
            {
                "target_vehicle": target_vehicle_id,
                "target_driver": target_driver_id,
                "total_threads": total_reqs,
                "successful_dispatches": successes,
                "blocked_collisions": blocked,
                "mean_latency_ms": mean_lat
            }
        )

    return {
        "total_requests": total_reqs,
        "successful_dispatches": successes,
        "blocked_collisions": blocked,
        "mean_latency_ms": mean_lat,
        "isolation_guarantee": "BEGIN IMMEDIATE (Serializable Atomic Row Lock)",
        "attempts": results
    }
