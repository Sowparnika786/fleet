import json
from datetime import datetime, timezone, timedelta
from backend.database import get_db, log_black_box

VEHICLES_SEED = [
    {
        "id": "VEH-101",
        "plate_number": "NX-882-EV",
        "model": "Apex CyberHauler Alpha",
        "category": "Heavy EV Hauler",
        "capacity_kg": 12000.0,
        "volume_m3": 45.0,
        "fuel_type": "Electric",
        "range_km": 650.0,
        "battery_fuel_pct": 88.5,
        "odometer_km": 34210.0,
        "status": "Available",
        "current_location_lat": 37.7749,
        "current_location_lng": -122.4194,
        "current_address": "SF Bay Logistics Depot, Pier 48",
        "maintenance_due_km": 40000.0,
        "inspection_score": 98.2,
        "features": ["Hazmat Certified", "Dual-Beacon GPS", "Pneumatic Suspension", "Solar Roof"]
    },
    {
        "id": "VEH-102",
        "plate_number": "CR-404-NX",
        "model": "Vanguard CryoSprinter 500",
        "category": "Refrigerated Sprinter",
        "capacity_kg": 3200.0,
        "volume_m3": 16.0,
        "fuel_type": "Electric",
        "range_km": 420.0,
        "battery_fuel_pct": 92.0,
        "odometer_km": 18450.0,
        "status": "Available",
        "current_location_lat": 37.4419,
        "current_location_lng": -122.1430,
        "current_address": "Palo Alto Biotech Campus Hub",
        "maintenance_due_km": 25000.0,
        "inspection_score": 99.4,
        "features": ["Cold Chain -80C", "Medical Express", "Biometric Cargo Vault", "Continuous Temp Telemetry"]
    },
    {
        "id": "VEH-103",
        "plate_number": "HG-911-H2",
        "model": "AeroGlide H2 Long-Haul",
        "category": "Hydrogen Long-Haul",
        "capacity_kg": 18000.0,
        "volume_m3": 65.0,
        "fuel_type": "Hydrogen",
        "range_km": 1100.0,
        "battery_fuel_pct": 76.4,
        "odometer_km": 52100.0,
        "status": "Available",
        "current_location_lat": 37.8044,
        "current_location_lng": -122.2712,
        "current_address": "Port of Oakland Hydrogen Hub",
        "maintenance_due_km": 60000.0,
        "inspection_score": 96.8,
        "features": ["Heavy Cargo", "Hazmat Certified", "Autonomous Lane Assist", "Zero Carbon"]
    },
    {
        "id": "VEH-104",
        "plate_number": "ZP-202-EV",
        "model": "Zephyr Urban Stealth Van",
        "category": "Urban Cargo Van",
        "capacity_kg": 1800.0,
        "volume_m3": 9.5,
        "fuel_type": "Electric",
        "range_km": 340.0,
        "battery_fuel_pct": 95.0,
        "odometer_km": 11200.0,
        "status": "Available",
        "current_location_lat": 37.3382,
        "current_location_lng": -121.8863,
        "current_address": "San Jose Central Hub, Terminal 3",
        "maintenance_due_km": 20000.0,
        "inspection_score": 97.5,
        "features": ["Ultra-Agile Urban", "Smart Tailgate", "Low-Clearance Access", "EV Fleet Master"]
    },
    {
        "id": "VEH-105",
        "plate_number": "AR-777-TT",
        "model": "Titan Armored Carrier 8X",
        "category": "Armored Secure Transport",
        "capacity_kg": 8500.0,
        "volume_m3": 28.0,
        "fuel_type": "Hybrid",
        "range_km": 720.0,
        "battery_fuel_pct": 84.0,
        "odometer_km": 29800.0,
        "status": "Available",
        "current_location_lat": 37.6213,
        "current_location_lng": -122.3790,
        "current_address": "SFO International Secure Vault Gateway",
        "maintenance_due_km": 35000.0,
        "inspection_score": 99.8,
        "features": ["Ballistic Armor B6", "Satellite Failover", "Dual Escort Interface", "High Value Escort"]
    },
    {
        "id": "VEH-106",
        "plate_number": "SL-303-EV",
        "model": "Solaria Solar-Assisted Semi",
        "category": "Heavy EV Hauler",
        "capacity_kg": 14000.0,
        "volume_m3": 52.0,
        "fuel_type": "Electric",
        "range_km": 580.0,
        "battery_fuel_pct": 81.2,
        "odometer_km": 41200.0,
        "status": "Available",
        "current_location_lat": 37.5485,
        "current_location_lng": -121.9886,
        "current_address": "Fremont Megafactory Outpost",
        "maintenance_due_km": 50000.0,
        "inspection_score": 95.0,
        "features": ["Heavy Cargo", "Solar Regeneration", "Dynamic Route AI", "Hazmat Certified"]
    }
]

DRIVERS_SEED = [
    {
        "id": "DRV-501",
        "name": "Elena Rostova",
        "license_number": "CA-DL-882910",
        "contact_phone": "+1 (415) 555-0142",
        "email": "elena.rostova@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 9.0,
        "hours_logged_today": 2.2,
        "safety_score": 99.2,
        "fatigue_score": 11.5,
        "certifications": ["Hazmat", "Cold Chain", "EV Fleet Master", "High Value Escort"],
        "current_location_lat": 37.7749,
        "current_location_lng": -122.4194
    },
    {
        "id": "DRV-502",
        "name": "Marcus Vance",
        "license_number": "CA-DL-419201",
        "contact_phone": "+1 (415) 555-0189",
        "email": "marcus.vance@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 9.0,
        "hours_logged_today": 3.0,
        "safety_score": 98.7,
        "fatigue_score": 18.0,
        "certifications": ["High Value Escort", "Heavy Cargo", "EV Fleet Master"],
        "current_location_lat": 37.6213,
        "current_location_lng": -122.3790
    },
    {
        "id": "DRV-503",
        "name": "Dr. Kenji Sato",
        "license_number": "CA-DL-773412",
        "contact_phone": "+1 (650) 555-0199",
        "email": "kenji.sato@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 8.0,
        "hours_logged_today": 1.5,
        "safety_score": 99.8,
        "fatigue_score": 8.0,
        "certifications": ["Cold Chain", "Medical Express", "Hazmat"],
        "current_location_lat": 37.4419,
        "current_location_lng": -122.1430
    },
    {
        "id": "DRV-504",
        "name": "Aria Sterling",
        "license_number": "CA-DL-552194",
        "contact_phone": "+1 (408) 555-0163",
        "email": "aria.sterling@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 9.0,
        "hours_logged_today": 2.8,
        "safety_score": 97.9,
        "fatigue_score": 21.0,
        "certifications": ["EV Fleet Master", "Urban Rapid Express"],
        "current_location_lat": 37.3382,
        "current_location_lng": -121.8863
    },
    {
        "id": "DRV-505",
        "name": "Dante Thorne",
        "license_number": "CA-DL-994320",
        "contact_phone": "+1 (510) 555-0122",
        "email": "dante.thorne@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 9.0,
        "hours_logged_today": 1.0,
        "safety_score": 99.1,
        "fatigue_score": 12.0,
        "certifications": ["Heavy Cargo", "Hazmat", "Hydrogen Long-Haul"],
        "current_location_lat": 37.8044,
        "current_location_lng": -122.2712
    },
    {
        "id": "DRV-506",
        "name": "Samira Patel",
        "license_number": "CA-DL-661208",
        "contact_phone": "+1 (510) 555-0177",
        "email": "samira.patel@fleetnexus.io",
        "status": "Available",
        "max_daily_hours": 9.0,
        "hours_logged_today": 3.5,
        "safety_score": 98.4,
        "fatigue_score": 24.5,
        "certifications": ["Heavy Cargo", "EV Fleet Master", "High Value Escort"],
        "current_location_lat": 37.5485,
        "current_location_lng": -121.9886
    }
]

DELIVERIES_SEED = [
    {
        "id": "DEL-9001",
        "title": "Cryogenic mRNA Vaccines Batch #44",
        "origin_address": "South San Francisco Biotech Gateway, 400 DNA Way",
        "origin_lat": 37.6547,
        "origin_lng": -122.4077,
        "destination_address": "Stanford Medical Center Research Cryo-Vault",
        "destination_lat": 37.4346,
        "destination_lng": -122.1754,
        "cargo_type": "Cold Chain",
        "weight_kg": 850.0,
        "volume_m3": 4.2,
        "required_certifications": ["Cold Chain", "Medical Express"],
        "priority": "Urgent",
        "time_window_start": "2026-10-29T18:00:00Z",
        "time_window_end": "2026-10-29T21:30:00Z",
        "estimated_distance_km": 38.5,
        "sla_penalty_rate_hr": 250.0,
        "status": "Pending"
    },
    {
        "id": "DEL-9002",
        "title": "ASML EUV Photolithography Laser Mirror Optics",
        "origin_address": "SFO Secure Cargo Air Terminal, Hangar 9",
        "origin_lat": 37.6213,
        "origin_lng": -122.3790,
        "destination_address": "Sunnyvale Semiconductor Fabrication Plant 1",
        "destination_lat": 37.3861,
        "destination_lng": -122.0322,
        "cargo_type": "High Value Escort",
        "weight_kg": 2400.0,
        "volume_m3": 12.0,
        "required_certifications": ["High Value Escort"],
        "priority": "Urgent",
        "time_window_start": "2026-10-29T19:00:00Z",
        "time_window_end": "2026-10-29T23:00:00Z",
        "estimated_distance_km": 44.2,
        "sla_penalty_rate_hr": 500.0,
        "status": "Pending"
    },
    {
        "id": "DEL-9003",
        "title": "High-Purity Lithium Electrolyte Stabilizer Vats",
        "origin_address": "Port of Oakland Heavy Chemical Terminal",
        "origin_lat": 37.8044,
        "origin_lng": -122.2712,
        "destination_address": "Tesla Fremont Gigafactory Energy Battery Line",
        "destination_lat": 37.4938,
        "destination_lng": -121.9442,
        "cargo_type": "Hazmat",
        "weight_kg": 7200.0,
        "volume_m3": 24.0,
        "required_certifications": ["Hazmat", "Heavy Cargo"],
        "priority": "High",
        "time_window_start": "2026-10-29T20:00:00Z",
        "time_window_end": "2026-10-30T02:00:00Z",
        "estimated_distance_km": 54.8,
        "sla_penalty_rate_hr": 150.0,
        "status": "Pending"
    },
    {
        "id": "DEL-9004",
        "title": "Subsea Telecom Fiber Optic Spools & Amplifiers",
        "origin_address": "San Francisco Pier 70 Cable Terminal",
        "origin_lat": 37.7600,
        "origin_lng": -122.3840,
        "destination_address": "San Jose Quantum Internet Interconnect Data Center",
        "destination_lat": 37.3382,
        "destination_lng": -121.8863,
        "cargo_type": "Heavy Cargo",
        "weight_kg": 5100.0,
        "volume_m3": 18.5,
        "required_certifications": ["Heavy Cargo"],
        "priority": "Normal",
        "time_window_start": "2026-10-30T08:00:00Z",
        "time_window_end": "2026-10-30T14:00:00Z",
        "estimated_distance_km": 72.0,
        "sla_penalty_rate_hr": 80.0,
        "status": "Pending"
    },
    {
        "id": "DEL-9005",
        "title": "Pediatric Critical Organ Perfusion Preserver",
        "origin_address": "UCSF Parnassus Medical Center Helipad",
        "origin_lat": 37.7631,
        "origin_lng": -122.4580,
        "destination_address": "Lucile Packard Children's Hospital Stanford",
        "destination_lat": 37.4370,
        "destination_lng": -122.1760,
        "cargo_type": "Medical Express",
        "weight_kg": 280.0,
        "volume_m3": 1.5,
        "required_certifications": ["Medical Express", "Cold Chain"],
        "priority": "Urgent",
        "time_window_start": "2026-10-29T18:15:00Z",
        "time_window_end": "2026-10-29T20:00:00Z",
        "estimated_distance_km": 49.0,
        "sla_penalty_rate_hr": 1000.0,
        "status": "Pending"
    }
]

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM vehicles;")
        if cursor.fetchone()["count"] > 0:
            return
        
        now_str = datetime.now(timezone.utc).isoformat()
        
        # Insert Vehicles
        for v in VEHICLES_SEED:
            cursor.execute("""
                INSERT INTO vehicles (
                    id, plate_number, model, category, capacity_kg, volume_m3, fuel_type,
                    range_km, battery_fuel_pct, odometer_km, status, current_location_lat,
                    current_location_lng, current_address, maintenance_due_km, inspection_score,
                    features, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                v["id"], v["plate_number"], v["model"], v["category"], v["capacity_kg"],
                v["volume_m3"], v["fuel_type"], v["range_km"], v["battery_fuel_pct"],
                v["odometer_km"], v["status"], v["current_location_lat"], v["current_location_lng"],
                v["current_address"], v["maintenance_due_km"], v["inspection_score"],
                json.dumps(v["features"]), now_str, now_str
            ))
            
            # Seed 5 telemetry history points for each vehicle
            for i in range(5):
                t_stamp = (datetime.now(timezone.utc) - timedelta(minutes=(5 - i) * 15)).isoformat()
                cursor.execute("""
                    INSERT INTO telemetry_history (
                        vehicle_id, timestamp, lat, lng, speed_kmh, battery_fuel_pct,
                        tire_pressure_psi, engine_temp_c
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    v["id"], t_stamp,
                    v["current_location_lat"] + (i * 0.001),
                    v["current_location_lng"] + (i * 0.001),
                    0.0 if i == 4 else 45.0 + (i * 5),
                    v["battery_fuel_pct"] - (5 - i) * 0.5,
                    36.0,
                    28.5
                ))
        
        # Insert Drivers
        for d in DRIVERS_SEED:
            cursor.execute("""
                INSERT INTO drivers (
                    id, name, license_number, contact_phone, email, status,
                    max_daily_hours, hours_logged_today, safety_score, fatigue_score,
                    certifications, current_location_lat, current_location_lng,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                d["id"], d["name"], d["license_number"], d["contact_phone"], d["email"],
                d["status"], d["max_daily_hours"], d["hours_logged_today"], d["safety_score"],
                d["fatigue_score"], json.dumps(d["certifications"]),
                d["current_location_lat"], d["current_location_lng"], now_str, now_str
            ))
        
        # Insert Deliveries
        for deliv in DELIVERIES_SEED:
            cursor.execute("""
                INSERT INTO deliveries (
                    id, title, origin_address, origin_lat, origin_lng, destination_address,
                    destination_lat, destination_lng, cargo_type, weight_kg, volume_m3,
                    required_certifications, priority, time_window_start, time_window_end,
                    estimated_distance_km, sla_penalty_rate_hr, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                deliv["id"], deliv["title"], deliv["origin_address"], deliv["origin_lat"], deliv["origin_lng"],
                deliv["destination_address"], deliv["destination_lat"], deliv["destination_lng"],
                deliv["cargo_type"], deliv["weight_kg"], deliv["volume_m3"],
                json.dumps(deliv["required_certifications"]), deliv["priority"],
                deliv["time_window_start"], deliv["time_window_end"], deliv["estimated_distance_km"],
                deliv["sla_penalty_rate_hr"], deliv["status"], now_str
            ))
        
        # Genesis Black Box Log
        log_black_box(
            conn,
            entity_type="SYSTEM",
            entity_id="NEXUS_CORE",
            action="INITIALIZE_FLEET",
            severity="INFO",
            actor="SYSTEM_BOOTSTRAP",
            payload={
                "message": "Fleetwise Nexus initialized with luxury cinematic fleet assets",
                "vehicles_count": len(VEHICLES_SEED),
                "drivers_count": len(DRIVERS_SEED),
                "deliveries_count": len(DELIVERIES_SEED)
            }
        )
