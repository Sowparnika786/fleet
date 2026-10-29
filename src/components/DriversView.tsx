import React, { useState } from 'react';
import { 
  Users, Plus, Search, ShieldCheck, AlertTriangle, 
  Clock, Award, Phone, Mail, X, Check, Trash2
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
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#4a2545]/40 border border-[#c48fc4]/30 text-[#dbb7db]">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              OPERATOR ROSTER // CERTIFIED DRIVER CORPS
            </h2>
          </div>
          <p className="text-xs text-[#a3bdab]">
            Telemetric safety indices, real-time duty hours, biometric fatigue tracking, and cargo endorsements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4a2545] to-[#733c73] hover:from-[#5c2f5c] hover:to-[#8c4b8c] text-white text-xs font-bold shadow-lg shadow-[#4a2545]/30 border border-[#c48fc4]/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Certified Operator</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-[#e8dfd5]/8 flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7d9f88] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, license, or endorsement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#e8dfd5]/12 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#7d9f88] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['', 'Available', 'On Duty', 'Off Duty', 'Fatigued'].map((st) => (
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
              className="glass-panel rounded-2xl p-5 border border-[#e8dfd5]/8 hover:border-[#10b981]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{d.name}</h3>
                    <p className="text-xs font-mono text-[#a3bdab]">{d.license_number}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(d)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      isAvailable 
                        ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/40 hover:bg-[#10b981]/30' 
                        : isOnDuty
                        ? 'bg-[#4a2545]/40 text-[#f4eaf4] border-[#c48fc4]/40 hover:bg-[#4a2545]/60'
                        : isFatigued
                        ? 'bg-red-950/40 text-red-400 border-red-500/40'
                        : 'bg-[#1c222c] text-[#a3bdab] border-[#e8dfd5]/10'
                    }`}
                  >
                    {d.status}
                  </button>
                </div>

                {/* Score and Hours Metrics */}
                <div className="space-y-2 py-3 border-t border-b border-[#e8dfd5]/5 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#7d9f88] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#10b981]" /> Safety Rating:
                      </span>
                      <p className="text-white font-bold text-sm">{d.safety_score}/100</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7d9f88] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#dbb7db]" /> Fatigue Index:
                      </span>
                      <p className="text-[#dbb7db] font-bold text-sm">{d.fatigue_score}/100</p>
                    </div>
                  </div>

                  {/* Daily Duty Hours Progress Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-[#a3bdab] mb-1">
                      <span>Daily Hours Logged:</span>
                      <span className="text-white font-bold">{d.hours_logged_today}h / {d.max_daily_hours}h</span>
                    </div>
                    <div className="w-full bg-[#1c222c] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          dutyPct > 85 ? 'bg-amber-400' : 'bg-[#10b981]'
                        }`}
                        style={{ width: `${Math.min(100, dutyPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-[#7d9f88] flex items-center gap-2 pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {d.contact_phone}
                    </span>
                  </div>
                </div>

                {/* Certifications Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {d.certifications.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-[#34d399] border border-[#10b981]/20">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#e8dfd5]/5 text-xs font-mono text-[#7d9f88] flex justify-between items-center">
                <span>Operator ID: {d.id}</span>
                <span className="text-[10px] text-[#a3bdab]">Click status to toggle</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Onboard Operator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated w-full max-w-lg rounded-2xl border border-[#4a2545]/60 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8dfd5]/10">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-[#dbb7db]" />
                ONBOARD CERTIFIED OPERATOR
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3bdab] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">License Number</label>
                  <input
                    required
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g. CA-DL-99210"
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[#a3bdab] mb-1 font-mono">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="operator@fleetnexus.io"
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#4a2545] to-[#733c73] hover:from-[#5c2f5c] hover:to-[#8c4b8c] text-white font-bold"
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
