import React, { useState } from 'react';
import { 
  AlertTriangle, X, RefreshCw, CheckCircle2, 
  Truck, User, ArrowRight, ShieldCheck, Terminal, Zap
} from 'lucide-react';
import { triggerAutoRecovery } from '../api';
import { Assignment, AutoRecoveryResponse } from '../types';

interface AutoRecoveryModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onRecoveryCompleted: () => void;
}

export const AutoRecoveryModal: React.FC<AutoRecoveryModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onRecoveryCompleted
}) => {
  const [incidentType, setIncidentType] = useState<string>('VEHICLE_BREAKDOWN');
  const [incidentSeverity, setIncidentSeverity] = useState<string>('CRITICAL');
  const [notes, setNotes] = useState<string>('Telematics detected sudden coolant drop on Highway 101.');
  const [loading, setLoading] = useState<boolean>(false);
  const [recoveryResult, setRecoveryResult] = useState<AutoRecoveryResponse | null>(null);

  if (!isOpen || !assignment) return null;

  const handleExecuteRecovery = async () => {
    setLoading(true);
    setRecoveryResult(null);
    try {
      const res = await triggerAutoRecovery({
        assignment_id: assignment.id,
        incident_type: incidentType,
        incident_severity: incidentSeverity,
        incident_notes: notes
      });
      setRecoveryResult(res);
      onRecoveryCompleted();
    } catch (err: any) {
      alert(`Auto-Recovery failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-red-500/40 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/15 via-[#4a2545]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e8dfd5]/12 bg-[#0a0d13]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider font-mono">
                AUTO-RECOVERY DISPATCH // FAILOVER PROTOCOL
              </h3>
              <p className="text-[11px] font-mono text-[#a3bdab]">
                Active Mission: <span className="text-white font-semibold">{assignment.id}</span> • Delivery: <span className="text-[#34d399]">{assignment.delivery_title || assignment.delivery_id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a3bdab] hover:text-white hover:bg-[#1c222c] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {!recoveryResult ? (
            <>
              {/* Incident Scenario Selector */}
              <div>
                <label className="block text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-2">
                  Select Incident Scenario to Simulate:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('VEHICLE_BREAKDOWN');
                      setNotes('Telemetry detected mechanical powertrain warning on I-880.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'VEHICLE_BREAKDOWN'
                        ? 'bg-red-950/40 border-red-500 text-white shadow-md'
                        : 'bg-[#0b0e14]/60 border-[#e8dfd5]/10 text-[#a3bdab] hover:border-[#e8dfd5]/30'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-red-400 mb-1" />
                    <p className="text-xs font-bold text-white">Vehicle Breakdown</p>
                    <span className="text-[10px] text-[#7d9f88]">Battery / Motor issue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('DRIVER_FATIGUE');
                      setNotes('Biometric sensor flagged elevated fatigue threshold.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'DRIVER_FATIGUE'
                        ? 'bg-[#4a2545]/60 border-[#c48fc4] text-white shadow-md'
                        : 'bg-[#0b0e14]/60 border-[#e8dfd5]/10 text-[#a3bdab] hover:border-[#e8dfd5]/30'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#dbb7db] mb-1" />
                    <p className="text-xs font-bold text-white">Driver Fatigue Spike</p>
                    <span className="text-[10px] text-[#7d9f88]">Duty threshold reached</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('ROUTE_BLOCKED');
                      setNotes('Severe traffic shutdown on San Mateo Bridge corridor.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'ROUTE_BLOCKED'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                        : 'bg-[#0b0e14]/60 border-[#e8dfd5]/10 text-[#a3bdab] hover:border-[#e8dfd5]/30'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
                    <p className="text-xs font-bold text-white">Route Obstructed</p>
                    <span className="text-[10px] text-[#7d9f88]">Unscheduled detour</span>
                  </button>

                </div>
              </div>

              {/* Severity & Incident Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-1.5">
                    Incident Severity Level
                  </label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400 font-mono"
                  >
                    <option value="CRITICAL">CRITICAL — Immediate Halting & Rescue Required</option>
                    <option value="HIGH">HIGH — Urgent Resource Re-assignment</option>
                    <option value="MODERATE">MODERATE — Precautionary Rerouting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-1.5">
                    Operator Dispatch Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#e8dfd5]/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Executing recovery will automatically mark the compromised resource, re-route cargo using Smart Match algorithms, issue an amended Safety Passport, and record the rescue event in the immutable Dispatch Black Box.
                </span>
              </div>
            </>
          ) : (
            /* Recovery Success Dashboard */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-[#10b981] shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Autonomous Failover Successfully Dispatched
                  </h4>
                  <p className="text-xs text-[#34d399] mt-0.5">
                    Mission transitioned seamlessly with zero disruption to customer delivery SLA.
                  </p>
                </div>
              </div>

              {/* Failover Transition Card */}
              <div className="p-4 rounded-xl bg-[#0b0e14]/80 border border-[#e8dfd5]/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#a3bdab]">
                  <span>Previous: <strong className="text-white">{recoveryResult.original_assignment_id}</strong></span>
                  <ArrowRight className="w-4 h-4 text-[#10b981]" />
                  <span>Successor: <strong className="text-[#34d399]">{recoveryResult.new_assignment_id}</strong></span>
                </div>

                <div className="pt-2 border-t border-[#e8dfd5]/5 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#7d9f88] uppercase">Replacement Vehicle</span>
                    <p className="text-white font-bold">{recoveryResult.recovered_vehicle_id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7d9f88] uppercase">Replacement Driver</span>
                    <p className="text-white font-bold">{recoveryResult.recovered_driver_id}</p>
                  </div>
                </div>

                <p className="text-xs text-[#e8dfd5] pt-1">
                  <strong>Rescue Strategy:</strong> {recoveryResult.rescue_strategy}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#a3bdab] pt-2 border-t border-[#e8dfd5]/5">
                  <span className="flex items-center gap-1 text-[#34d399]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Passport Amended: {recoveryResult.passport_hash.slice(0, 16)}...
                  </span>
                  <span className="flex items-center gap-1 text-[#dbb7db]">
                    <Terminal className="w-3.5 h-3.5" /> Black Box Logged
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e8dfd5]/10 bg-[#0a0d13]/90 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/15 text-xs text-white hover:bg-[#1c222c] transition-all cursor-pointer"
          >
            {recoveryResult ? 'Done' : 'Cancel'}
          </button>

          {!recoveryResult && (
            <button
              onClick={handleExecuteRecovery}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-[#733c73] hover:from-red-500 hover:to-[#8c4b8c] text-white text-xs font-bold shadow-md shadow-red-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Failover...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute Auto-Recovery</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
