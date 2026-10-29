import React, { useState } from 'react';
import { 
  Flame, ShieldCheck, AlertOctagon, CheckCircle2, 
  RefreshCw, Lock, Zap
} from 'lucide-react';
import { runAttackLab } from '../api';
import { Vehicle, Driver, ConcurrencyAttackResponse } from '../types';

interface AttackLabProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

export const AttackLab: React.FC<AttackLabProps> = ({ vehicles, drivers }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || 'VEH-101');
  const [selectedDriver, setSelectedDriver] = useState<string>(drivers[0]?.id || 'DRV-501');
  const [threadsCount, setThreadsCount] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [attackResult, setAttackResult] = useState<ConcurrencyAttackResponse | null>(null);

  const handleLaunchAttack = async () => {
    setLoading(true);
    setAttackResult(null);
    try {
      const res = await runAttackLab({
        target_vehicle_id: selectedVehicle,
        target_driver_id: selectedDriver,
        concurrent_requests: threadsCount
      });
      setAttackResult(res);
    } catch (err: any) {
      alert(`Attack Lab execution error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <Flame className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              DOUBLE-BOOKING ATTACK LAB // CONCURRENCY STRESS PROBE
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Fires simultaneous race condition dispatch requests against the exact same vehicle and driver at the identical millisecond. Demonstrates SQLite <code className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 font-mono">BEGIN IMMEDIATE</code> serialization and row-level atomicity.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-mono font-bold text-emerald-800">WAL SERIALIZABLE</span>
        </div>
      </div>

      {/* Attack Configuration Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Target Vehicle Selector */}
        <div>
          <label className="block text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
            Target Vehicle Asset
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.model} ({v.plate_number})
              </option>
            ))}
          </select>
        </div>

        {/* Target Driver Selector */}
        <div>
          <label className="block text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
            Target Driver Resource
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} — {d.name} ({d.status})
              </option>
            ))}
          </select>
        </div>

        {/* Concurrent Threads Slider */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
            <span>Race Threads</span>
            <span className="text-emerald-700 font-bold">{threadsCount} threads</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={threadsCount}
            onChange={(e) => setThreadsCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Launch Button */}
        <div className="flex items-end">
          <button
            onClick={handleLaunchAttack}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Swarm...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Launch Stress Probe</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Results Dashboard */}
      {attackResult && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Total Threads</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{attackResult.total_requests}</p>
              <span className="text-[10px] text-slate-400">Simultaneous Calls</span>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-mono text-emerald-800 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized Dispatch
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{attackResult.successful_dispatches}</p>
              <span className="text-[10px] text-emerald-700 font-medium">Exactly 1 Mission Succeeded</span>
            </div>

            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-[11px] font-mono text-rose-800 uppercase font-bold flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Blocked Collisions
              </span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{attackResult.blocked_collisions}</p>
              <span className="text-[10px] text-rose-700 font-medium">Deterministic 409 Conflicts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Mean Latency</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{attackResult.mean_latency_ms} ms</p>
              <span className="text-[10px] text-slate-400">Instantaneous Lock</span>
            </div>

          </div>

          {/* Granular Attempt Stream Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">
                CONCURRENCY EXECUTION STREAM // AUDIT VERIFICATION
              </h3>
              <span className="text-xs font-mono text-emerald-800 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 font-bold">
                {attackResult.isolation_guarantee}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Thread #</th>
                    <th className="px-4 py-3">Delivery ID</th>
                    <th className="px-4 py-3">HTTP Status</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Result / Serialization Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {attackResult.attempts.map((att) => (
                    <tr key={att.request_index} className={att.success ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        #{att.request_index}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {att.delivery_id}
                      </td>
                      <td className="px-4 py-3">
                        {att.success ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            200 OK — AUTHORIZED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {att.status_code} CONFLICT
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-bold">
                        {att.latency_ms}ms
                      </td>
                      <td className="px-4 py-3 text-[11px] font-sans">
                        {att.success ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Assignment {att.assignment_id} granted. Resource locked.
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {att.error_message}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
