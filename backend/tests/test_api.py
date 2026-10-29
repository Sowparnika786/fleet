import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.database import init_db, get_db
from backend.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
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

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"

def test_list_vehicles():
    response = client.get("/api/vehicles")
    assert response.status_code == 200
    vehicles = response.json()
    assert len(vehicles) >= 5
    assert any(v["id"] == "VEH-101" for v in vehicles)

def test_list_drivers():
    response = client.get("/api/drivers")
    assert response.status_code == 200
    drivers = response.json()
    assert len(drivers) >= 5
    assert any(d["name"] == "Elena Rostova" for d in drivers)

def test_list_deliveries():
    response = client.get("/api/deliveries")
    assert response.status_code == 200
    deliveries = response.json()
    assert len(deliveries) >= 5

def test_smart_match_scoring():
    response = client.get("/api/smart-match/DEL-9001")
    assert response.status_code == 200
    data = response.json()
    assert data["delivery_id"] == "DEL-9001"
    assert data["top_recommendation"] is not None
    top = data["top_recommendation"]
    assert top["total_score"] > 70.0
    assert "breakdown" in top
    assert len(top["rationale"]) > 0

def test_safety_passport_audit_and_dispatch():
    # Dispatch DEL-9002 with VEH-105 and DRV-502
    payload = {
        "delivery_id": "DEL-9002",
        "vehicle_id": "VEH-105",
        "driver_id": "DRV-502",
        "notes": "Test Dispatch"
    }
    response = client.post("/api/assignments", json=payload)
    assert response.status_code == 201
    asn = response.json()
    assert asn["assignment_id"].startswith("ASN-")
    assert asn["passport"]["verdict"] in ["PASSED", "CONDITIONAL_APPROVAL"]
    assert asn["passport"]["overall_score"] > 80.0
    
    # Verify Safety Passport endpoint directly
    passport_resp = client.get(f"/api/safety-passports/{asn['assignment_id']}")
    assert passport_resp.status_code == 200
    passport_data = passport_resp.json()
    assert len(passport_data["vectors"]) == 8
    assert passport_data["digital_signature"].startswith("SIG_RSA4096_")

def test_black_box_hash_chain_verification():
    response = client.get("/api/black-box/verify-chain")
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert data["status"] == "CRYPTOGRAPHICALLY_VERIFIED"

def test_auto_recovery_incident():
    # First create an assignment
    payload = {
        "delivery_id": "DEL-9003",
        "vehicle_id": "VEH-103",
        "driver_id": "DRV-505",
        "notes": "Pre-incident assignment"
    }
    asn_resp = client.post("/api/assignments", json=payload)
    assert asn_resp.status_code == 201
    asn_id = asn_resp.json()["assignment_id"]
    
    # Trigger auto recovery
    recovery_payload = {
        "assignment_id": asn_id,
        "incident_type": "VEHICLE_BREAKDOWN",
        "incident_severity": "CRITICAL",
        "incident_notes": "Tire blowout on Highway 880 North"
    }
    rec_resp = client.post("/api/recovery/trigger", json=recovery_payload)
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert rec_data["original_assignment_id"] == asn_id
    assert rec_data["new_assignment_id"].startswith("ASN-REC-")
    assert rec_data["recovered_vehicle_id"] != "VEH-103"
