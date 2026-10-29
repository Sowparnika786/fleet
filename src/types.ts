export interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  category: string;
  capacity_kg: number;
  volume_m3: number;
  fuel_type: 'Electric' | 'Hydrogen' | 'Diesel' | 'Hybrid' | string;
  range_km: number;
  battery_fuel_pct: number;
  odometer_km: number;
  status: 'Available' | 'In Transit' | 'Maintenance' | 'Out of Service' | string;
  current_location_lat: number;
  current_location_lng: number;
  current_address: string;
  maintenance_due_km: number;
  inspection_score: number;
  features: string[];
  created_at: string;
  updated_at: string;
  simulated_battery?: number;
  simulated_lat?: number;
  simulated_lng?: number;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  contact_phone: string;
  email: string;
  status: 'Available' | 'On Duty' | 'Off Duty' | 'Fatigued' | string;
  max_daily_hours: number;
  hours_logged_today: number;
  safety_score: number;
  fatigue_score: number;
  certifications: string[];
  current_location_lat: number;
  current_location_lng: number;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  title: string;
  origin_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  cargo_type: string;
  weight_kg: number;
  volume_m3: number;
  required_certifications: string[];
  priority: 'Urgent' | 'High' | 'Normal' | 'Eco' | string;
  time_window_start: string;
  time_window_end: string;
  estimated_distance_km: number;
  sla_penalty_rate_hr: number;
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Failed' | string;
  created_at: string;
}

export interface Assignment {
  id: string;
  delivery_id: string;
  vehicle_id: string;
  driver_id: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Aborted' | 'Recovered' | string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  passport_hash?: string;
  passport_score: number;
  risk_score: number;
  carbon_kg_est: number;
  waypoints?: Array<{ name: string; lat: number; lng: number; status: string }>;
  notes?: string;
  created_at: string;
  updated_at: string;
  delivery_title?: string;
  cargo_type?: string;
  priority?: string;
  weight_kg?: number;
  origin_address?: string;
  destination_address?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_battery?: number;
  driver_name?: string;
  driver_safety?: number;
}

export interface SafetyVector {
  code: string;
  name: string;
  score: number;
  weight: number;
  status: 'PASS' | 'CONDITIONAL' | 'FAIL' | string;
  details: string;
  metrics: Record<string, any>;
}

export interface SafetyPassport {
  id: string;
  assignment_id: string;
  hash: string;
  verdict: 'PASSED' | 'CONDITIONAL_APPROVAL' | 'REJECTED' | string;
  overall_score: number;
  vectors: SafetyVector[];
  digital_signature: string;
  qr_data: string;
  issued_at: string;
  warnings?: string[];
}

export interface SmartMatchCandidate {
  vehicle_id: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_battery_fuel: number;
  vehicle_category: string;
  driver_id: string;
  driver_name: string;
  driver_safety_score: number;
  driver_fatigue_score: number;
  total_score: number;
  breakdown: {
    proximity_score: number;
    capacity_score: number;
    safety_score: number;
    carbon_efficiency_score: number;
    sla_compatibility_score: number;
  };
  rank: number;
  rationale: string[];
  tradeoffs: string[];
  estimated_duration_min: number;
  estimated_carbon_kg: number;
}

export interface SmartMatchResponse {
  delivery_id: string;
  top_recommendation?: SmartMatchCandidate;
  candidates: SmartMatchCandidate[];
  analysis_time_ms: number;
}

export interface AttackAttemptResult {
  request_index: number;
  delivery_id: string;
  success: boolean;
  status_code: number;
  latency_ms: number;
  assignment_id?: string;
  error_message?: string;
  timestamp: string;
}

export interface ConcurrencyAttackResponse {
  total_requests: number;
  successful_dispatches: number;
  blocked_collisions: number;
  mean_latency_ms: number;
  isolation_guarantee: string;
  attempts: AttackAttemptResult[];
}

export interface AutoRecoveryResponse {
  original_assignment_id: string;
  new_assignment_id: string;
  incident_type: string;
  recovered_vehicle_id: string;
  recovered_driver_id: string;
  sla_impact_minutes: number;
  rescue_strategy: string;
  passport_hash: string;
  black_box_hash: string;
  timestamp: string;
}

export interface BlackBoxLogItem {
  id: number;
  log_hash: string;
  previous_hash: string;
  timestamp: string;
  entity_type: string;
  entity_id: string;
  action: string;
  severity: string;
  actor: string;
  payload: Record<string, any>;
}

export interface FleetPulseData {
  active_utilization_pct: number;
  fleet_size: number;
  active_in_transit: number;
  carbon_emissions_avoided_kg: number;
  sla_on_time_rate_pct: number;
  average_safety_index: number;
  average_fatigue_index: number;
  total_deliveries: number;
  active_alerts: Array<{ id: string; level: string; text: string }>;
}

export interface HeatmapSlot {
  hour: number;
  strain_pct: number;
  status: string;
  available_vehicles: number;
}

export interface HeatmapRow {
  day: string;
  slots: HeatmapSlot[];
}

export interface AvailabilityHeatmapData {
  days: string[];
  hours: number[];
  matrix: HeatmapRow[];
  peak_hour: string;
  lowest_strain_slot: string;
}
