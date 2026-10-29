import React, { useState } from 'react';
import { 
  Users, Plus, Search, ShieldCheck, AlertTriangle, 
  Phone, X, Trash2
} from 'lucide-react';
import { Driver } from '../types';
import { createDriver, updateDriver } from '../api';

interface DriversViewProps {
  drivers: Driver[];
  onRefresh: () => void;
}

export const DriversView: React.FC<DriversViewProps> = ({ drivers, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    license_number: '',
    contact_phone: '+1 (415) 555-0100',
    email: '',
    status: 'Available',
    max_daily_hours: 9.0,
    hours_logged_today: 0.0,
    safety_score: 98.5,
    fatigue_score: 10.0,
    certifications: ['EV Fleet Master', 'Hazmat'],
    current_location_lat: 37.7749,
    current_location_lng: -122.4194
  });

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createDriver(formData);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to onboard operator: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    const nextStatus = driver.status === 'Available' ? 'Off Duty' : 'Available';
    try {
      await updateDriver(driver.id, { status: nextStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.license_number.toLowerCase().includes(search.toLowerCase()) ||
                          d.certifications.some((c) => c.toLowerCase().includes(search.toLowerCase()));
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
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              OPERATOR ROSTER // CERTIFIED DRIVER CORPS
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Telemetric safety indices, real-time duty hours, biometric fatigue tracking, and cargo endorsements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Certified Operator</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, license, or endorsement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['', 'Available', 'On Duty', 'Off Duty', 'Fatigued'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st || 'All Operators'}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const isAvailable = d.status === 'Available';
          const isOnDuty = d.status === 'On Duty';
          const isFatigued = d.status === 'Fatigued';
          const dutyPct = (d.hours_logged_today / d.max_daily_hours) * 100;

          return (
            <div 
              key={d.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{d.license_number}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(d)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      isAvailable 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                        : isOnDuty
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : isFatigued
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {d.status}
                  </button>
                </div>

                {/* Score and Hours Metrics */}
                <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Safety Rating:
                      </span>
                      <p className="text-slate-800 font-bold text-sm">{d.safety_score}/100</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Fatigue Index:
                      </span>
                      <p className="text-slate-800 font-bold text-sm">{d.fatigue_score}/100</p>
                    </div>
                  </div>

                  {/* Daily Duty Hours Progress Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Daily Hours Logged:</span>
                      <span className="text-slate-800 font-bold">{d.hours_logged_today}h / {d.max_daily_hours}h</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          dutyPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, dutyPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {d.contact_phone}
                    </span>
                  </div>
                </div>

                {/* Certifications Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {d.certifications.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono text-slate-400 flex justify-between items-center">
                <span>Operator ID: {d.id}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Click badge to toggle</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Onboard Operator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                ONBOARD CERTIFIED OPERATOR
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">License Number</label>
                  <input
                    required
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g. CA-DL-99210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-mono">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="operator@fleetnexus.io"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  />
                </div>
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
                  {creating ? 'Onboarding...' : 'Register Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
