import sqlite3
import os
import json
import hashlib
from datetime import datetime, timezone
from contextlib import contextmanager
from typing import Generator, Optional, Dict, Any, List

DB_PATH = os.environ.get("FLEETWISE_DB_PATH", os.path.join(os.path.dirname(__file__), "fleetwise.db"))

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

@contextmanager
def get_atomic_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Acquires an immediate lock (BEGIN IMMEDIATE) to guarantee zero race-conditions
    under concurrent read-modify-write assignment operations.
    """
    conn = get_connection()
    conn.isolation_level = None  # Autocommit disabled for explicit transaction control
    try:
        conn.execute("BEGIN IMMEDIATE;")
        yield conn
        conn.execute("COMMIT;")
    except Exception:
        conn.execute("ROLLBACK;")
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id TEXT PRIMARY KEY,
            plate_number TEXT UNIQUE NOT NULL,
            model TEXT NOT NULL,
            category TEXT NOT NULL,
            capacity_kg REAL NOT NULL,
            volume_m3 REAL NOT NULL,
            fuel_type TEXT NOT NULL,
            range_km REAL NOT NULL,
            battery_fuel_pct REAL NOT NULL,
            odometer_km REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Available',
            current_location_lat REAL NOT NULL,
            current_location_lng REAL NOT NULL,
            current_address TEXT NOT NULL,
            maintenance_due_km REAL NOT NULL,
            inspection_score REAL NOT NULL,
            features TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS drivers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            license_number TEXT UNIQUE NOT NULL,
            contact_phone TEXT NOT NULL,
            email TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Available',
            max_daily_hours REAL NOT NULL DEFAULT 9.0,
            hours_logged_today REAL NOT NULL DEFAULT 0.0,
            safety_score REAL NOT NULL,
            fatigue_score REAL NOT NULL DEFAULT 0.0,
            certifications TEXT NOT NULL DEFAULT '[]',
            current_location_lat REAL NOT NULL,
            current_location_lng REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            origin_address TEXT NOT NULL,
            origin_lat REAL NOT NULL,
            origin_lng REAL NOT NULL,
            destination_address TEXT NOT NULL,
            destination_lat REAL NOT NULL,
            destination_lng REAL NOT NULL,
            cargo_type TEXT NOT NULL,
            weight_kg REAL NOT NULL,
            volume_m3 REAL NOT NULL,
            required_certifications TEXT NOT NULL DEFAULT '[]',
            priority TEXT NOT NULL DEFAULT 'Normal',
            time_window_start TEXT NOT NULL,
            time_window_end TEXT NOT NULL,
            estimated_distance_km REAL NOT NULL,
            sla_penalty_rate_hr REAL NOT NULL DEFAULT 50.0,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assignments (
            id TEXT PRIMARY KEY,
            delivery_id TEXT NOT NULL,
            vehicle_id TEXT NOT NULL,
            driver_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Scheduled',
            scheduled_start TEXT NOT NULL,
            scheduled_end TEXT NOT NULL,
            actual_start TEXT,
            actual_end TEXT,
            passport_hash TEXT,
            passport_score REAL DEFAULT 100.0,
            risk_score REAL DEFAULT 0.0,
            carbon_kg_est REAL DEFAULT 0.0,
            waypoints_json TEXT NOT NULL DEFAULT '[]',
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
            FOREIGN KEY (driver_id) REFERENCES drivers(id)
        );

        CREATE TABLE IF NOT EXISTS safety_passports (
            id TEXT PRIMARY KEY,
            assignment_id TEXT NOT NULL UNIQUE,
            hash TEXT UNIQUE NOT NULL,
            verdict TEXT NOT NULL,
            overall_score REAL NOT NULL,
            vectors_json TEXT NOT NULL,
            digital_signature TEXT NOT NULL,
            qr_data TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        );

        CREATE TABLE IF NOT EXISTS black_box_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_hash TEXT UNIQUE NOT NULL,
            previous_hash TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            severity TEXT NOT NULL,
            actor TEXT NOT NULL,
            payload_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS telemetry_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            speed_kmh REAL NOT NULL,
            battery_fuel_pct REAL NOT NULL,
            tire_pressure_psi REAL NOT NULL,
            engine_temp_c REAL NOT NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
        );

        CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
        CREATE INDEX IF NOT EXISTS idx_assignments_vehicle ON assignments(vehicle_id);
        CREATE INDEX IF NOT EXISTS idx_assignments_driver ON assignments(driver_id);
        CREATE INDEX IF NOT EXISTS idx_blackbox_time ON black_box_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_telemetry_veh_time ON telemetry_history(vehicle_id, timestamp);
        """)

def log_black_box(
    conn: sqlite3.Connection,
    entity_type: str,
    entity_id: str,
    action: str,
    severity: str,
    actor: str,
    payload: Dict[str, Any]
) -> str:
    """
    Appends an immutable log entry with a cryptographically chained SHA-256 hash.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT log_hash FROM black_box_logs ORDER BY id DESC LIMIT 1;")
    row = cursor.fetchone()
    previous_hash = row["log_hash"] if row else "GENESIS_NEXUS_000000000000000000000000000000000000000000000000"
    
    timestamp = datetime.now(timezone.utc).isoformat()
    payload_str = json.dumps(payload, sort_keys=True)
    
    raw_content = f"{previous_hash}|{timestamp}|{entity_type}|{entity_id}|{action}|{severity}|{actor}|{payload_str}"
    log_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
    
    cursor.execute("""
        INSERT INTO black_box_logs (
            log_hash, previous_hash, timestamp, entity_type, entity_id, action, severity, actor, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_hash, previous_hash, timestamp, entity_type, entity_id, action, severity, actor, payload_str))
    
    return log_hash
