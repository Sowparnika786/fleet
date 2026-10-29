import React, { useState } from 'react';
import { 
  Flame, ShieldCheck, AlertOctagon, CheckCircle2, 
  Play, RefreshCw, Cpu, Layers, Lock, Zap
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
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#4a2545]/30 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400">
                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide font-mono">
                DOUBLE-BOOKING ATTACK LAB // CONCURRENCY STRESS PROBE
              </h2>
            </div>
            <p className="text-xs text-[#a3bdab] max-w-2xl leading-relaxed">
              Fires simultaneous high-concurrency race condition dispatch requests against the exact same vehicle and driver at the identical millisecond. Demonstrates SQLite <code className="text-[#34d399] font-mono">BEGIN IMMEDIATE</code> serialization and row-level atomicity.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0b0e14] px-4 py-2 rounded-xl border border-[#e8dfd5]/10">
            <Lock className="w-4 h-4 text-[#10b981]" />
            <span className="text-xs font-mono font-semibold text-[#f4efea]">WAL SERIALIZABLE</span>
          </div>
        </div>

        {/* Attack Configuration Controls */}
        <div className="mt-6 pt-6 border-t border-[#e8dfd5]/10 grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Target Vehicle Selector */}
          <div>
            <label className="block text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-1.5">
              Target Vehicle Asset
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
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
            <label className="block text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-1.5">
              Target Driver Resource
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
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
            <div className="flex justify-between text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-1.5">
              <span>Concurrent Race Threads</span>
              <span className="text-[#34d399] font-bold">{threadsCount} threads</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={threadsCount}
              onChange={(e) => setThreadsCount(parseInt(e.target.value))}
              className="w-full h-2 bg-[#1c222c] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
            />
          </div>

          {/* Launch Button */}
          <div className="flex items-end">
            <button
              onClick={handleLaunchAttack}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 via-[#4a2545] to-[#733c73] hover:from-red-500 hover:to-[#8c4b8c] text-white text-xs font-bold shadow-lg shadow-red-950/40 border border-red-400/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Swarm...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Launch Stress Probe</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Results Dashboard */}
      {attackResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="glass-panel p-4 rounded-xl border border-[#e8dfd5]/10">
              <span className="text-[11px] font-mono text-[#a3bdab] uppercase">Total Threads</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{attackResult.total_requests}</p>
              <span className="text-[10px] text-[#7d9f88]">Simultaneous Dispatch Calls</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-[#10b981]/30 bg-[#10b981]/5">
              <span className="text-[11px] font-mono text-[#34d399] uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> Successful Dispatch
              </span>
              <p className="text-2xl font-bold font-mono text-[#34d399] mt-1">{attackResult.successful_dispatches}</p>
              <span className="text-[10px] text-[#34d399]">Exactly 1 Authorized Mission</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-950/20">
              <span className="text-[11px] font-mono text-red-400 uppercase flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" /> Blocked Collisions
              </span>
              <p className="text-2xl font-bold font-mono text-red-400 mt-1">{attackResult.blocked_collisions}</p>
              <span className="text-[10px] text-red-300">Deterministic 409 Conflict Rejections</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-[#e8dfd5]/10">
              <span className="text-[11px] font-mono text-[#a3bdab] uppercase">Mean Probe Latency</span>
              <p className="text-2xl font-bold font-mono text-[#f4efea] mt-1">{attackResult.mean_latency_ms} ms</p>
              <span className="text-[10px] text-[#7d9f88]">Instantaneous Serialization</span>
            </div>

          </div>

          {/* Granular Attempt Stream Table */}
          <div className="glass-panel-elevated rounded-2xl border border-[#e8dfd5]/12 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8dfd5]/10 bg-[#0a0d13]/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  CONCURRENCY EXECUTION STREAM // AUDIT VERIFICATION
                </h3>
              </div>
              <span className="text-xs font-mono text-[#34d399] px-2 py-0.5 rounded bg-[#10b981]/15 border border-[#10b981]/30">
                {attackResult.isolation_guarantee}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161b22]/80 text-[#a3bdab] uppercase font-mono text-[10px] border-b border-[#e8dfd5]/10">
                  <tr>
                    <th className="px-4 py-3">Thread #</th>
                    <th className="px-4 py-3">Delivery ID</th>
                    <th className="px-4 py-3">HTTP Status</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Result / Serialization Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8dfd5]/5 font-mono">
                  {attackResult.attempts.map((att) => {
                    return (
                      <tr key={att.request_index} className={att.success ? 'bg-[#10b981]/10' : 'hover:bg-[#161b22]/40'}>
                        <td className="px-4 py-2.5 font-bold text-white">
                          #{att.request_index}
                        </td>
                        <td className="px-4 py-2.5 text-[#a3bdab]">
                          {att.delivery_id}
                        </td>
                        <td className="px-4 py-2.5">
                          {att.success ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40">
                              200 OK — AUTHORIZED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-500/30">
                              {att.status_code} CONFLICT
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#f4efea]">{att.latency_ms}ms</span>
                            <div className="w-16 bg-[#1c222c] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${att.success ? 'bg-[#10b981]' : 'bg-red-400'}`}
                                style={{ width: `${Math.min(100, att.latency_ms * 10)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] font-sans">
                          {att.success ? (
                            <span className="text-[#34d399] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                              Assignment {att.assignment_id} granted. Resource locked.
                            </span>
                          ) : (
                            <span className="text-red-300">
                              {att.error_message}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
