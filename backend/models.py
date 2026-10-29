from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class VehicleBase(BaseModel):
    plate_number: str
    model: str
    category: str
    capacity_kg: float
    volume_m3: float
    fuel_type: str
    range_km: float
    battery_fuel_pct: float = 100.0
    odometer_km: float = 0.0
    status: str = "Available"
    current_location_lat: float
    current_location_lng: float
    current_address: str
    maintenance_due_km: float
    inspection_score: float = 95.0
    features: List[str] = Field(default_factory=list)

class VehicleCreate(VehicleBase):
    id: Optional[str] = None

class VehicleUpdate(BaseModel):
    model: Optional[str] = None
    status: Optional[str] = None
    battery_fuel_pct: Optional[float] = None
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    current_address: Optional[str] = None
    inspection_score: Optional[float] = None
    features: Optional[List[str]] = None

class VehicleResponse(VehicleBase):
    id: str
    created_at: str
    updated_at: str


class DriverBase(BaseModel):
    name: str
    license_number: str
    contact_phone: str
    email: str
    status: str = "Available"
    max_daily_hours: float = 9.0
    hours_logged_today: float = 0.0
    safety_score: float = 98.0
    fatigue_score: float = 10.0
    certifications: List[str] = Field(default_factory=list)
    current_location_lat: float
    current_location_lng: float

class DriverCreate(DriverBase):
    id: Optional[str] = None

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    contact_phone: Optional[str] = None
    hours_logged_today: Optional[float] = None
    safety_score: Optional[float] = None
    fatigue_score: Optional[float] = None
    certifications: Optional[List[str]] = None
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None

class DriverResponse(DriverBase):
    id: str
    created_at: str
    updated_at: str


class DeliveryBase(BaseModel):
    title: str
    origin_address: str
    origin_lat: float
    origin_lng: float
    destination_address: str
    destination_lat: float
    destination_lng: float
    cargo_type: str
    weight_kg: float
    volume_m3: float
    required_certifications: List[str] = Field(default_factory=list)
    priority: str = "Normal"
    time_window_start: str
    time_window_end: str
    estimated_distance_km: float
    sla_penalty_rate_hr: float = 50.0
    status: str = "Pending"

class DeliveryCreate(DeliveryBase):
    id: Optional[str] = None

class DeliveryUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    destination_address: Optional[str] = None

class DeliveryResponse(DeliveryBase):
    id: str
    created_at: str


class AssignmentCreate(BaseModel):
    delivery_id: str
    vehicle_id: str
    driver_id: str
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    notes: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: str
    delivery_id: str
    vehicle_id: str
    driver_id: str
    status: str
    scheduled_start: str
    scheduled_end: str
    actual_start: Optional[str] = None
    actual_end: Optional[str] = None
    passport_hash: Optional[str] = None
    passport_score: float = 100.0
    risk_score: float = 0.0
    carbon_kg_est: float = 0.0
    waypoints: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    delivery: Optional[DeliveryResponse] = None
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None


class SafetyVectorItem(BaseModel):
    code: str
    name: str
    score: float
    weight: float
    status: str  # PASS, CONDITIONAL, FAIL
    details: str
    metrics: Dict[str, Any]

class SafetyPassportData(BaseModel):
    id: str
    assignment_id: str
    hash: str
    verdict: str  # PASSED, CONDITIONAL_APPROVAL, REJECTED
    overall_score: float
    vectors: List[SafetyVectorItem]
    digital_signature: str
    qr_data: str
    issued_at: str
    warnings: List[str] = Field(default_factory=list)


class SmartMatchScoreBreakdown(BaseModel):
    proximity_score: float
    capacity_score: float
    safety_score: float
    carbon_efficiency_score: float
    sla_compatibility_score: float

class SmartMatchCandidate(BaseModel):
    vehicle_id: str
    vehicle_model: str
    vehicle_plate: str
    vehicle_battery_fuel: float
    vehicle_category: str
    driver_id: str
    driver_name: str
    driver_safety_score: float
    driver_fatigue_score: float
    total_score: float
    breakdown: SmartMatchScoreBreakdown
    rank: int
    rationale: List[str]
    tradeoffs: List[str]
    estimated_duration_min: float
    estimated_carbon_kg: float

class SmartMatchResponse(BaseModel):
    delivery_id: str
    top_recommendation: Optional[SmartMatchCandidate] = None
    candidates: List[SmartMatchCandidate] = Field(default_factory=list)
    analysis_time_ms: float


class ConcurrencyAttackRequest(BaseModel):
    target_vehicle_id: str
    target_driver_id: str
    concurrent_requests: int = 15
    base_delivery_id: Optional[str] = None

class AttackAttemptResult(BaseModel):
    request_index: int
    delivery_id: str
    success: bool
    status_code: int
    latency_ms: float
    assignment_id: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: str

class ConcurrencyAttackResponse(BaseModel):
    total_requests: int
    successful_dispatches: int
    blocked_collisions: int
    mean_latency_ms: float
    isolation_guarantee: str
    attempts: List[AttackAttemptResult]


class AutoRecoveryRequest(BaseModel):
    assignment_id: str
    incident_type: str  # VEHICLE_BREAKDOWN, DRIVER_FATIGUE, ROUTE_BLOCKED
    incident_severity: str = "HIGH"
    incident_notes: Optional[str] = None

class AutoRecoveryResponse(BaseModel):
    original_assignment_id: str
    new_assignment_id: str
    incident_type: str
    recovered_vehicle_id: str
    recovered_driver_id: str
    sla_impact_minutes: float
    rescue_strategy: str
    passport_hash: str
    black_box_hash: str
    timestamp: str


class BlackBoxLogItem(BaseModel):
    id: int
    log_hash: str
    previous_hash: str
    timestamp: str
    entity_type: str
    entity_id: str
    action: str
    severity: str
    actor: str
    payload: Dict[str, Any]
