import React, { useState } from 'react';
import { 
  Truck, Plus, Search, BatteryCharging, 
  MapPin, X, Trash2
} from 'lucide-react';
import { Vehicle } from '../types';
import { createVehicle, deleteVehicle } from '../api';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plate_number: '',
    model: '',
    category: 'Heavy EV Hauler',
    capacity_kg: 10000,
    volume_m3: 35,
    fuel_type: 'Electric',
    range_km: 600,
    battery_fuel_pct: 100,
    odometer_km: 12000,
    status: 'Available',
    current_location_lat: 37.7749,
    current_location_lng: -122.4194,
    current_address: 'SF Pier 48 Central Depot',
    maintenance_due_km: 30000,
    inspection_score: 98,
    features: ['EV Fleet Master', 'Dual-Beacon GPS']
  });

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createVehicle(formData);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to add vehicle: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Decommission vehicle ${id}?`)) {
      try {
        await deleteVehicle(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.model.toLowerCase().includes(search.toLowerCase()) ||
                          v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
                          v.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Truck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              VEHICLE ASSET REGISTRY // FLEET INVENTORY
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time telemetry, powertrain diagnostics, inspection ratings, and autonomous readiness.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Commission New Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by model, plate, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['', 'Available', 'In Transit', 'Maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st || 'All Vehicles'}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => {
          const isAvailable = v.status === 'Available';
          const isTransit = v.status === 'In Transit';

          return (
            <div 
              key={v.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {v.plate_number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{v.model}</h3>
                    <p className="text-xs text-slate-500">{v.category} • {v.fuel_type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isAvailable 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold' 
                      : isTransit
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {v.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> State of Charge:
                    </span>
                    <span className="text-slate-900 font-bold">{v.battery_fuel_pct}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${v.battery_fuel_pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400">Payload Cap:</span>
                      <p className="text-slate-800 font-bold">{v.capacity_kg.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Inspection:</span>
                      <p className="text-emerald-700 font-bold">{v.inspection_score}/100</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate pt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{v.current_address}</span>
                  </div>
                </div>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {v.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>ID: {v.id}</span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title="Decommission vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Commission Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                COMMISSION NEW FLEET VEHICLE
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Model Name</label>
                  <input
                    required
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Apex HyperCarrier V9"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Plate Number</label>
                  <input
                    required
                    type="text"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    placeholder="e.g. CA-NX-991"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  >
                    <option value="Heavy EV Hauler">Heavy EV Hauler</option>
                    <option value="Refrigerated Sprinter">Refrigerated Sprinter</option>
                    <option value="Hydrogen Long-Haul">Hydrogen Long-Haul</option>
                    <option value="Urban Cargo Van">Urban Cargo Van</option>
                    <option value="Armored Secure Transport">Armored Secure Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Powertrain</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  >
                    <option value="Electric">Electric (Battery EV)</option>
                    <option value="Hydrogen">Hydrogen Fuel Cell</option>
                    <option value="Hybrid">Hybrid Powertrain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.capacity_kg}
                    onChange={(e) => setFormData({ ...formData, capacity_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Max Range (km)</label>
                  <input
                    type="number"
                    value={formData.range_km}
                    onChange={(e) => setFormData({ ...formData, range_km: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 font-mono">Depot Address</label>
                <input
                  type="text"
                  value={formData.current_address}
                  onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
