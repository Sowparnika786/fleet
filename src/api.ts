import {
  Vehicle, Driver, Delivery, Assignment, SafetyPassport,
  SmartMatchResponse, ConcurrencyAttackResponse, AutoRecoveryResponse,
  BlackBoxLogItem, FleetPulseData, AvailabilityHeatmapData
} from './types';

const API_BASE = '/api';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || errorBody.message || `API error: ${res.status}`);
  }
  
  return res.json();
}

// System
export const fetchFleetPulse = () => apiRequest<FleetPulseData>('/fleet-pulse');
export const resetDemo = () => apiRequest<{ message: string }>('/reset-demo', { method: 'POST' });

// Vehicles
export const fetchVehicles = (status?: string) => 
  apiRequest<Vehicle[]>(status ? `/vehicles?status=${encodeURIComponent(status)}` : '/vehicles');
export const createVehicle = (data: Partial<Vehicle>) => 
  apiRequest<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) });
export const updateVehicle = (id: string, data: Partial<Vehicle>) => 
  apiRequest<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteVehicle = (id: string) => 
  apiRequest<{ message: string }>(`/vehicles/${id}`, { method: 'DELETE' });

// Drivers
export const fetchDrivers = (status?: string) => 
  apiRequest<Driver[]>(status ? `/drivers?status=${encodeURIComponent(status)}` : '/drivers');
export const createDriver = (data: Partial<Driver>) => 
  apiRequest<Driver>('/drivers', { method: 'POST', body: JSON.stringify(data) });
export const updateDriver = (id: string, data: Partial<Driver>) => 
  apiRequest<Driver>(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Deliveries
export const fetchDeliveries = (status?: string) => 
  apiRequest<Delivery[]>(status ? `/deliveries?status=${encodeURIComponent(status)}` : '/deliveries');
export const createDelivery = (data: Partial<Delivery>) => 
  apiRequest<Delivery>('/deliveries', { method: 'POST', body: JSON.stringify(data) });

// Assignments
export const fetchAssignments = (status?: string) => 
  apiRequest<Assignment[]>(status ? `/assignments?status=${encodeURIComponent(status)}` : '/assignments');
export const createAssignment = (data: { delivery_id: string; vehicle_id: string; driver_id: string; notes?: string }) => 
  apiRequest<{ assignment_id: string; passport: SafetyPassport; blackbox_hash: string }>('/assignments', { method: 'POST', body: JSON.stringify(data) });
export const completeAssignment = (id: string) => 
  apiRequest<{ message: string }>(`/assignments/${id}/complete`, { method: 'POST' });

// Signature Features
export const fetchSafetyPassport = (assignmentId: string) => 
  apiRequest<SafetyPassport>(`/safety-passports/${assignmentId}`);
export const fetchSmartMatch = (deliveryId: string) => 
  apiRequest<SmartMatchResponse>(`/smart-match/${deliveryId}`);
export const runAttackLab = (payload: { target_vehicle_id: string; target_driver_id: string; concurrent_requests: number }) => 
  apiRequest<ConcurrencyAttackResponse>('/attack-lab/run', { method: 'POST', body: JSON.stringify(payload) });
export const triggerAutoRecovery = (payload: { assignment_id: string; incident_type: string; incident_severity?: string; incident_notes?: string }) => 
  apiRequest<AutoRecoveryResponse>('/recovery/trigger', { method: 'POST', body: JSON.stringify(payload) });
export const fetchTimeMachineSnapshot = (offsetHours: number) => 
  apiRequest<{
    query_offset_hours: number;
    simulated_timestamp: string;
    fleet_size: number;
    simulated_vehicles: Vehicle[];
    active_assignments_count: number;
    bottlenecks: Array<{ time_slot: string; severity: string; message: string }>;
  }>(`/time-machine/snapshot?offset_hours=${offsetHours}`);
export const fetchHeatmap = () => 
  apiRequest<AvailabilityHeatmapData>('/heatmap');
export const fetchBlackBoxLogs = (limit = 40, severity?: string, entity_type?: string) => {
  let url = `/black-box?limit=${limit}`;
  if (severity) url += `&severity=${encodeURIComponent(severity)}`;
  if (entity_type) url += `&entity_type=${encodeURIComponent(entity_type)}`;
  return apiRequest<BlackBoxLogItem[]>(url);
};
export const verifyBlackBoxChain = () => 
  apiRequest<{ verified: boolean; total_records: number; latest_head_hash?: string; status: string }>('/black-box/verify-chain');
