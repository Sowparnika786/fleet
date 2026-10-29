import os
import pytest
from backend.database import init_db, get_db
from backend.seed_data import seed_database
from backend.concurrency import run_concurrency_attack_simulation

def test_atomic_double_booking_concurrency_attack():
    init_db()
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
    
    # Target vehicle VEH-101 and driver DRV-501
    target_vehicle = "VEH-101"
    target_driver = "DRV-501"
    threads_count = 20
    
    result = run_concurrency_attack_simulation(
        target_vehicle_id=target_vehicle,
        target_driver_id=target_driver,
        concurrent_requests=threads_count
    )
    
    assert result["total_requests"] == threads_count
    assert result["successful_dispatches"] == 1, f"Expected exactly 1 successful dispatch, got {result['successful_dispatches']}"
    assert result["blocked_collisions"] == threads_count - 1, f"Expected {threads_count - 1} blocked collisions, got {result['blocked_collisions']}"
    
    # Verify that the blocked attempts received HTTP 409 Conflict status
    blocked_attempts = [a for a in result["attempts"] if not a["success"]]
    assert len(blocked_attempts) == threads_count - 1
    for a in blocked_attempts:
        assert a["status_code"] in [409, 422], f"Unexpected status code: {a['status_code']}"
        assert a["error_message"] is not None
        
    print(f"Concurrency Attack Test Passed! 1 winner, {threads_count - 1} serialized & blocked. Mean latency: {result['mean_latency_ms']}ms")

if __name__ == "__main__":
    test_atomic_double_booking_concurrency_attack()
