import React, { useState } from 'react';
import { 
  Package, Plus, Search, Sparkles, MapPin, 
  ArrowRight, Clock, AlertCircle, X, ShieldCheck
} from 'lucide-react';
import { Delivery } from '../types';
import { createDelivery } from '../api';

interface DeliveriesViewProps {
  deliveries: Delivery[];
  onRefresh: () => void;
  onOpenSmartMatch: (delivery: Delivery) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  deliveries,
  onRefresh,
  onOpenSmartMatch
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Delivery>>({
    title: '',
    origin_address: 'San Francisco Tech Pier 48 Depot',
    origin_lat: 37.7749,
    origin_lng: -122.4194,
    destination_address: 'Silicon Valley Innovation Hub, Palo Alto',
    destination_lat: 37.4419,
    destination_lng: -122.1430,
    cargo_type: 'High Value Escort',
    weight_kg: 1500,
    volume_m3: 6.5,
    required_certifications: ['High Value Escort'],
    priority: 'Urgent',
    time_window_start: new Date().toISOString(),
    time_window_end: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    estimated_distance_km: 42.0,
    sla_penalty_rate_hr: 200.0,
    status: 'Pending'
  });

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createDelivery(formData);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to commission delivery: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
                          d.cargo_type.toLowerCase().includes(search.toLowerCase()) ||
                          d.origin_address.toLowerCase().includes(search.toLowerCase()) ||
                          d.destination_address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              DELIVERIES MANIFEST // CARGO CONSIGNMENTS
            </h2>
          </div>
          <p className="text-xs text-[#a3bdab]">
            Real-time cargo tracking, SLA time-windows, strict cold-chain requirements, and instant AI dispatching.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white text-xs font-bold shadow-lg shadow-[#10b981]/20 border border-[#10b981]/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Commission New Cargo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-[#e8dfd5]/8 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7d9f88] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, cargo type, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#e8dfd5]/12 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#7d9f88] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['', 'Pending', 'Assigned', 'In Transit', 'Delivered'].map((st) => (
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

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((deliv) => {
          const isPending = deliv.status === 'Pending';
          const isUrgent = deliv.priority === 'Urgent';

          return (
            <div 
              key={deliv.id}
              className="glass-panel rounded-2xl p-5 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#161b22] text-[#a3bdab]">
                        {deliv.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isUrgent 
                          ? 'bg-red-950/60 text-red-400 border-red-500/40' 
                          : 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30'
                      }`}>
                        {deliv.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{deliv.title}</h3>
                    <p className="text-xs text-[#7d9f88]">{deliv.cargo_type} • {deliv.weight_kg.toLocaleString()} kg ({deliv.volume_m3} m³)</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPending 
                      ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/40' 
                      : 'bg-[#4a2545]/40 text-[#f4eaf4] border-[#c48fc4]/40'
                  }`}>
                    {deliv.status}
                  </span>
                </div>

                {/* Route Waypoint Points */}
                <div className="space-y-2 py-3 border-t border-b border-[#e8dfd5]/5 text-xs">
                  <div className="flex items-start space-x-2 text-[#e8dfd5]">
                    <div className="w-2 h-2 rounded-full bg-[#10b981] mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono text-[#7d9f88] uppercase block">Origin Depot</span>
                      <span className="text-xs">{deliv.origin_address}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-[#e8dfd5]">
                    <div className="w-2 h-2 rounded-full bg-[#dbb7db] mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono text-[#7d9f88] uppercase block">Destination Hub</span>
                      <span className="text-xs">{deliv.destination_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#a3bdab] pt-2 border-t border-[#e8dfd5]/5">
                    <span>Est. Distance: <strong className="text-white">{deliv.estimated_distance_km} km</strong></span>
                    <span>SLA Penalty: <strong className="text-red-400">${deliv.sla_penalty_rate_hr}/hr</strong></span>
                  </div>
                </div>

                {/* Required Endorsements */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {deliv.required_certifications.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-[#34d399] border border-[#10b981]/20">
                      Required: {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#e8dfd5]/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#7d9f88]">
                  Window: {new Date(deliv.time_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isPending && (
                  <button
                    onClick={() => onOpenSmartMatch(deliv)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white text-xs font-bold shadow-md shadow-[#10b981]/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Smart Match Dispatch</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Commission Cargo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl border border-[#10b981]/40 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8dfd5]/10">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Package className="w-4 h-4 text-[#10b981]" />
                COMMISSION NEW CARGO CONSIGNMENT
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3bdab] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a3bdab] mb-1 font-mono">Consignment Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cryogenic Biologics Shipment #88"
                  className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Cargo Type</label>
                  <select
                    value={formData.cargo_type}
                    onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="Cold Chain">Cold Chain (Pharma / Cryo)</option>
                    <option value="High Value Escort">High Value Escort</option>
                    <option value="Hazmat">Hazmat / Hazardous Chemical</option>
                    <option value="Heavy Cargo">Heavy Industrial Cargo</option>
                    <option value="Medical Express">Medical Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="Urgent">Urgent (SLA Critical)</option>
                    <option value="High">High Priority</option>
                    <option value="Normal">Normal</option>
                    <option value="Eco">Eco Green</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Est Distance (km)</label>
                  <input
                    type="number"
                    value={formData.estimated_distance_km}
                    onChange={(e) => setFormData({ ...formData, estimated_distance_km: parseFloat(e.target.value) })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a3bdab] mb-1 font-mono">Origin Address</label>
                <input
                  type="text"
                  value={formData.origin_address}
                  onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                  className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[#a3bdab] mb-1 font-mono">Destination Address</label>
                <input
                  type="text"
                  value={formData.destination_address}
                  onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
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
                  {creating ? 'Commissioning...' : 'Commission Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
