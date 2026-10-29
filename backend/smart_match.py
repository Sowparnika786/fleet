import time
import json
import math
from typing import Dict, Any, List, Optional
import sqlite3
from backend.safety_passport import calculate_distance

def evaluate_smart_match(conn: sqlite3.Connection, delivery_id: str) -> Dict[str, Any]:
    start_time = time.time()
    cursor = conn.cursor()
    
    # 1. Fetch delivery details
    cursor.execute("SELECT * FROM deliveries WHERE id = ?;", (delivery_id,))
    delivery_row = cursor.fetchone()
    if not delivery_row:
        raise ValueError(f"Delivery {delivery_id} not found")
        
    delivery = dict(delivery_row)
    req_certs = json.loads(delivery.get("required_certifications", "[]")) if isinstance(delivery.get("required_certifications"), str) else delivery.get("required_certifications", [])
    
    # 2. Fetch available vehicles and drivers
    cursor.execute("SELECT * FROM vehicles WHERE status = 'Available';")
    vehicles = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM drivers WHERE status = 'Available';")
    drivers = [dict(r) for r in cursor.fetchall()]
    
    candidates: List[Dict[str, Any]] = []
    
    # Cross-evaluate viable pairs
    for v in vehicles:
        v_features = json.loads(v.get("features", "[]")) if isinstance(v.get("features"), str) else v.get("features", [])
        
        # Check basic vehicle feasibility
        if v["capacity_kg"] < delivery["weight_kg"] or v["volume_m3"] < delivery["volume_m3"]:
            continue
            
        # Distance from vehicle location to delivery origin
        veh_origin_dist = calculate_distance(v["current_location_lat"], v["current_location_lng"], delivery["origin_lat"], delivery["origin_lng"])
        
        # Proximity score (0-100)
        proximity_score = max(0.0, min(100.0, 100.0 - (veh_origin_dist * 2.0)))
        
        # Capacity utilization fit (higher score for optimal fit without massive wasted capacity)
        weight_ratio = delivery["weight_kg"] / v["capacity_kg"]
        vol_ratio = delivery["volume_m3"] / v["volume_m3"]
        avg_ratio = (weight_ratio + vol_ratio) / 2.0
        # Optimal ratio is between 30% and 85%
        capacity_score = 95.0 if 0.3 <= avg_ratio <= 0.85 else (80.0 if avg_ratio < 0.3 else 70.0)
        
        # Carbon efficiency score
        if v["fuel_type"] == "Hydrogen":
            carbon_score = 99.0
            carbon_rate_kg_per_km = 0.02
        elif v["fuel_type"] == "Electric":
            carbon_score = 96.0
            carbon_rate_kg_per_km = 0.04
        elif v["fuel_type"] == "Hybrid":
            carbon_score = 78.0
            carbon_rate_kg_per_km = 0.12
        else:
            carbon_score = 55.0
            carbon_rate_kg_per_km = 0.28
            
        total_trip_km = veh_origin_dist + delivery["estimated_distance_km"]
        carbon_est = round(total_trip_km * carbon_rate_kg_per_km, 2)
        
        for d in drivers:
            d_certs = json.loads(d.get("certifications", "[]")) if isinstance(d.get("certifications"), str) else d.get("certifications", [])
            
            # Check mandatory certs
            missing = [c for c in req_certs if c not in d_certs]
            if missing:
                continue
                
            # Check fatigue limit
            if d["hours_logged_today"] + (total_trip_km / 45.0) > d["max_daily_hours"]:
                continue
                
            # Driver safety & experience score
            base_safety = d["safety_score"]
            # Bonus for matching certifications
            matched_certs_bonus = min(5.0, len([c for c in req_certs if c in d_certs]) * 2.5)
            driver_score = min(100.0, base_safety + matched_certs_bonus)
            
            # SLA compatibility score
            est_minutes = round((total_trip_km / 45.0) * 60.0 + 15.0)
            fatigue_headroom = max(0.0, 100.0 - (d["fatigue_score"] * 1.5))
            sla_score = min(100.0, 0.7 * fatigue_headroom + 0.3 * (100.0 - min(50.0, veh_origin_dist)))
            
            # Multi-factor weights:
            # Proximity: 30%, Capacity: 20%, Safety: 20%, Carbon: 15%, SLA: 15%
            total_score = (
                (proximity_score * 0.30) +
                (capacity_score * 0.20) +
                (driver_score * 0.20) +
                (carbon_score * 0.15) +
                (sla_score * 0.15)
            )
            
            rationale: List[str] = []
            tradeoffs: List[str] = []
            
            if proximity_score > 85.0:
                rationale.append(f"Immediate proximity ({veh_origin_dist:.1f}km from origin depot)")
            if v["fuel_type"] in ["Electric", "Hydrogen"]:
                rationale.append(f"Zero-direct-emissions powertrain ({v['fuel_type']}) with {v['battery_fuel_pct']:.0f}% state-of-charge")
            if d["safety_score"] >= 98.0:
                rationale.append(f"Premier operator safety profile: {d['safety_score']:.1f}/100 with zero incident flags")
            if req_certs:
                rationale.append(f"All required endorsements verified ({', '.join(req_certs)})")
                
            if veh_origin_dist > 25.0:
                tradeoffs.append(f"Dispatched from secondary hub (+{round(veh_origin_dist / 45.0 * 60.0)}m staging transit)")
            if avg_ratio < 0.25:
                tradeoffs.append(f"Payload capacity headroom exceeds requirement ({v['capacity_kg']:.0f}kg capacity for {delivery['weight_kg']:.0f}kg cargo)")
            if not tradeoffs:
                tradeoffs.append("Optimal alignment across all constraints; zero operational concessions.")
                
            candidates.append({
                "vehicle_id": v["id"],
                "vehicle_model": v["model"],
                "vehicle_plate": v["plate_number"],
                "vehicle_battery_fuel": v["battery_fuel_pct"],
                "vehicle_category": v["category"],
                "driver_id": d["id"],
                "driver_name": d["name"],
                "driver_safety_score": d["safety_score"],
                "driver_fatigue_score": d["fatigue_score"],
                "total_score": round(total_score, 1),
                "breakdown": {
                    "proximity_score": round(proximity_score, 1),
                    "capacity_score": round(capacity_score, 1),
                    "safety_score": round(driver_score, 1),
                    "carbon_efficiency_score": round(carbon_score, 1),
                    "sla_compatibility_score": round(sla_score, 1)
                },
                "rank": 0,
                "rationale": rationale,
                "tradeoffs": tradeoffs,
                "estimated_duration_min": est_minutes,
                "estimated_carbon_kg": carbon_est
            })
            
    # Sort descending by total score
    candidates.sort(key=lambda x: x["total_score"], reverse=True)
    
    # Assign ranks
    for idx, c in enumerate(candidates):
        c["rank"] = idx + 1
        
    analysis_time = round((time.time() - start_time) * 1000.0, 2)
    top_recommendation = candidates[0] if candidates else None
    
    return {
        "delivery_id": delivery_id,
        "top_recommendation": top_recommendation,
        "candidates": candidates[:6],  # Return top 6 candidates
        "analysis_time_ms": analysis_time
    }
