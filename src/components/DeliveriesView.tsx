import React, { useState } from 'react';
import { 
  Package, Plus, Search, Sparkles, MapPin, 
  ArrowRight, Clock, AlertCircle, X, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Delivery } from '../types';
import { createDelivery } from '../api';

interface DeliveriesViewProps {
  deliveries: Delivery[];
  onRefresh: () => Promise<void> | void;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialFormState: Partial<Delivery> = {
    title: 'High-Purity Silicon Wafer Consignment #77',
    origin_address: 'San Francisco Pier 48 High-Tech Depot',
    origin_lat: 37.7749,
    origin_lng: -122.4194,
    destination_address: 'Stanford Semiconductor Lab, Palo Alto',
    destination_lat: 37.4419,
    destination_lng: -122.1430,
    cargo_type: 'High Value Escort',
    weight_kg: 1200,
    volume_m3: 4.5,
    required_certifications: ['High Value Escort'],
    priority: 'Urgent',
    time_window_start: new Date().toISOString(),
    time_window_end: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    estimated_distance_km: 44.0,
    sla_penalty_rate_hr: 250.0,
    status: 'Pending'
  };

  const [formData, setFormData] = useState<Partial<Delivery>>(initialFormState);

  const handleCargoTypeChange = (type: string) => {
    let certs: string[] = [];
    if (type === 'Cold Chain') certs = ['Cold Chain', 'Medical Express'];
    else if (type === 'High Value Escort') certs = ['High Value Escort'];
    else if (type === 'Hazmat') certs = ['Hazmat', 'Heavy Cargo'];
    else if (type === 'Heavy Cargo') certs = ['Heavy Cargo'];
    else if (type === 'Medical Express') certs = ['Medical Express', 'Cold Chain'];

    setFormData({
      ...formData,
      cargo_type: type,
      required_certifications: certs
    });
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setSuccessMessage(null);
    try {
      const created = await createDelivery(formData);
      setIsModalOpen(false);
      setFormData({
        ...initialFormState,
        title: `Consignment #${Math.floor(1000 + Math.random() * 9000)}`
      });
      await onRefresh();
      setSuccessMessage(`Consignment "${created.title}" successfully commissioned & saved!`);
      setTimeout(() => setSuccessMessage(null), 5000);
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              DELIVERIES MANIFEST // CARGO DISPATCH
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time cargo tracking, SLA time-windows, strict certifications, and instant AI Smart Match dispatch.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              ...initialFormState,
              title: `Urgent Consignment #${Math.floor(1000 + Math.random() * 9000)}`
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Commission New Cargo</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, cargo type, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['', 'Pending', 'Assigned', 'In Transit', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st || 'All Consignments'}
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
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {deliv.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isUrgent 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {deliv.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{deliv.title}</h3>
                    <p className="text-xs text-slate-500">{deliv.cargo_type} • {deliv.weight_kg.toLocaleString()} kg ({deliv.volume_m3} m³)</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPending 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {deliv.status}
                  </span>
                </div>

                {/* Route Waypoint Points */}
                <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs">
                  <div className="flex items-start space-x-2 text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Origin Hub</span>
                      <span className="text-xs text-slate-800">{deliv.origin_address}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Destination Hub</span>
                      <span className="text-xs text-slate-800">{deliv.destination_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                    <span>Est. Distance: <strong className="text-slate-800">{deliv.estimated_distance_km} km</strong></span>
                    <span>SLA Penalty: <strong className="text-rose-600">${deliv.sla_penalty_rate_hr}/hr</strong></span>
                  </div>
                </div>

                {/* Required Endorsements */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {deliv.required_certifications.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Required: {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Window: {new Date(deliv.time_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isPending && (
                  <button
                    onClick={() => onOpenSmartMatch(deliv)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                COMMISSION NEW CARGO CONSIGNMENT
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 font-mono">Consignment Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cryogenic Biologics Shipment #88"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Cargo Type</label>
                  <select
                    value={formData.cargo_type}
                    onChange={(e) => handleCargoTypeChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  >
                    <option value="Cold Chain">Cold Chain (Pharma / Cryo)</option>
                    <option value="High Value Escort">High Value Escort</option>
                    <option value="Hazmat">Hazmat / Hazardous Chemical</option>
                    <option value="Heavy Cargo">Heavy Industrial Cargo</option>
                    <option value="Medical Express">Medical Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
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
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Est Distance (km)</label>
                  <input
                    type="number"
                    value={formData.estimated_distance_km}
                    onChange={(e) => setFormData({ ...formData, estimated_distance_km: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 font-mono">Origin Address</label>
                <input
                  type="text"
                  value={formData.origin_address}
                  onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 font-mono">Destination Address</label>
                <input
                  type="text"
                  value={formData.destination_address}
                  onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
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
                  {creating ? 'Saving to Database...' : 'Commission Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
