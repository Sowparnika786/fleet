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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                AUTO-RECOVERY DISPATCH // FAILOVER PROTOCOL
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Active Mission: <span className="text-slate-900 font-bold">{assignment.id}</span> • Delivery: <span className="text-emerald-700 font-bold">{assignment.delivery_title || assignment.delivery_id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
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
                <label className="block text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-2">
                  Select Incident Scenario to Simulate:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('VEHICLE_BREAKDOWN');
                      setNotes('Telemetry detected mechanical powertrain warning on I-880.');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'VEHICLE_BREAKDOWN'
                        ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-rose-600 mb-1" />
                    <p className="text-xs font-bold text-slate-900">Vehicle Breakdown</p>
                    <span className="text-[10px] text-slate-500">Motor / Battery issue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('DRIVER_FATIGUE');
                      setNotes('Biometric sensor flagged elevated fatigue threshold.');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'DRIVER_FATIGUE'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4 text-amber-600 mb-1" />
                    <p className="text-xs font-bold text-slate-900">Driver Fatigue</p>
                    <span className="text-[10px] text-slate-500">Duty threshold reached</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('ROUTE_BLOCKED');
                      setNotes('Severe traffic shutdown on San Mateo Bridge corridor.');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      incidentType === 'ROUTE_BLOCKED'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-slate-900">Route Obstructed</p>
                    <span className="text-[10px] text-slate-500">Unscheduled detour</span>
                  </button>

                </div>
              </div>

              {/* Severity & Incident Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
                    Incident Severity Level
                  </label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="CRITICAL">CRITICAL — Immediate Halting & Rescue Required</option>
                    <option value="HIGH">HIGH — Urgent Resource Re-assignment</option>
                    <option value="MODERATE">MODERATE — Precautionary Rerouting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider mb-1.5">
                    Operator Dispatch Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Executing recovery will automatically mark the compromised resource, re-route cargo using Smart Match algorithms, issue an amended Safety Passport, and record the rescue event in the immutable Dispatch Black Box.
                </span>
              </div>
            </>
          ) : (
            /* Recovery Success Dashboard */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Autonomous Failover Successfully Dispatched
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                    Mission transitioned seamlessly with zero disruption to customer delivery SLA.
                  </p>
                </div>
              </div>

              {/* Failover Transition Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Previous: <strong className="text-slate-900">{recoveryResult.original_assignment_id}</strong></span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  <span>Successor: <strong className="text-emerald-700 font-bold">{recoveryResult.new_assignment_id}</strong></span>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Replacement Vehicle</span>
                    <p className="text-slate-900 font-bold">{recoveryResult.recovered_vehicle_id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Replacement Driver</span>
                    <p className="text-slate-900 font-bold">{recoveryResult.recovered_driver_id}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 pt-1">
                  <strong>Rescue Strategy:</strong> {recoveryResult.rescue_strategy}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Passport Amended: {recoveryResult.passport_hash.slice(0, 16)}...
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" /> Black Box Logged
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            {recoveryResult ? 'Done' : 'Cancel'}
          </button>

          {!recoveryResult && (
            <button
              onClick={handleExecuteRecovery}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
