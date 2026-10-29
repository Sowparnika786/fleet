import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Filter, BatteryCharging, 
  Gauge, ShieldCheck, MapPin, X, Check, Trash2, Edit2
} from 'lucide-react';
import { Vehicle } from '../types';
import { createVehicle, updateVehicle, deleteVehicle } from '../api';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New vehicle form state
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
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]">
              <Truck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              VEHICLE ASSET REGISTRY // FLEET INVENTORY
            </h2>
          </div>
          <p className="text-xs text-[#a3bdab]">
            Real-time telemetry, powertrain diagnostics, inspection ratings, and autonomous readiness.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white text-xs font-bold shadow-lg shadow-[#10b981]/20 border border-[#10b981]/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Commission New Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-[#e8dfd5]/8 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7d9f88] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by model, plate, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#e8dfd5]/12 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#7d9f88] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['', 'Available', 'In Transit', 'Maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 font-bold'
                  : 'bg-[#161b22] text-[#a3bdab] border border-[#e8dfd5]/5 hover:text-white'
              }`}
            >
              {st || 'All Statuses'}
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
              className="glass-panel rounded-2xl p-5 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#161b22] text-[#34d399] border border-[#10b981]/20">
                      {v.plate_number}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{v.model}</h3>
                    <p className="text-xs text-[#7d9f88]">{v.category} • {v.fuel_type}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAvailable 
                      ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/40' 
                      : isTransit
                      ? 'bg-[#4a2545]/40 text-[#f4eaf4] border-[#c48fc4]/40'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                  }`}>
                    {v.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2 py-3 border-t border-b border-[#e8dfd5]/5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[#a3bdab]">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#34d399]" /> State of Charge:
                    </span>
                    <span className="text-white font-bold">{v.battery_fuel_pct}%</span>
                  </div>

                  <div className="w-full bg-[#1c222c] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-full rounded-full"
                      style={{ width: `${v.battery_fuel_pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[#7d9f88]">Payload Cap:</span>
                      <p className="text-white font-bold">{v.capacity_kg.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <span className="text-[#7d9f88]">Inspection Score:</span>
                      <p className="text-[#34d399] font-bold">{v.inspection_score}/100</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#a3bdab] flex items-center gap-1 truncate pt-1">
                    <MapPin className="w-3 h-3 text-[#7d9f88] shrink-0" />
                    <span className="truncate">{v.current_address}</span>
                  </div>
                </div>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {v.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-[#d6c6b4] border border-[#e8dfd5]/5">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#e8dfd5]/5 flex items-center justify-between text-xs font-mono text-[#7d9f88]">
                <span>ID: {v.id}</span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl border border-[#10b981]/40 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8dfd5]/10">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#10b981]" />
                COMMISSION NEW FLEET VEHICLE
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3bdab] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Model Name</label>
                  <input
                    required
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Apex HyperCarrier V9"
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Plate Number</label>
                  <input
                    required
                    type="text"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    placeholder="e.g. CA-NX-991"
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="Heavy EV Hauler">Heavy EV Hauler</option>
                    <option value="Refrigerated Sprinter">Refrigerated Sprinter</option>
                    <option value="Hydrogen Long-Haul">Hydrogen Long-Haul</option>
                    <option value="Urban Cargo Van">Urban Cargo Van</option>
                    <option value="Armored Secure Transport">Armored Secure Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Powertrain</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="Electric">Electric (Battery EV)</option>
                    <option value="Hydrogen">Hydrogen Fuel Cell</option>
                    <option value="Hybrid">Hybrid Powertrain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.capacity_kg}
                    onChange={(e) => setFormData({ ...formData, capacity_kg: parseFloat(e.target.value) })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Max Range (km)</label>
                  <input
                    type="number"
                    value={formData.range_km}
                    onChange={(e) => setFormData({ ...formData, range_km: parseFloat(e.target.value) })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a3bdab] mb-1 font-mono">Depot Address</label>
                <input
                  type="text"
                  value={formData.current_address}
                  onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                  className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="pt-4 border-t border-[#e8dfd5]/10 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#161b22] text-[#a3bdab] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-[#0b0e14] font-bold"
                >
                  {creating ? 'Commissioning...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
