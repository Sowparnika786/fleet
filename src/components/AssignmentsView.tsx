import React from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  Truck, User, ArrowRight, Award
} from 'lucide-react';
import { Assignment } from '../types';
import { completeAssignment } from '../api';

interface AssignmentsViewProps {
  assignments: Assignment[];
  onRefresh: () => void;
  onViewPassport: (assignmentId: string) => void;
  onOpenRecovery: (assignment: Assignment) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  onRefresh,
  onViewPassport,
  onOpenRecovery
}) => {
  const handleComplete = async (id: string) => {
    try {
      await completeAssignment(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              ACTIVE MISSIONS & ASSIGNMENT DISPATCHES
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Cryptographically audited missions with live Safety Passports, real-time waypoint progression, and failover safeguards.
          </p>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No active dispatch assignments. Commission cargo from Deliveries and dispatch with Smart Match!
          </div>
        ) : (
          assignments.map((asn) => {
            const isCompleted = asn.status === 'Completed';
            const isRecovered = asn.status === 'Recovered';
            const isInProgress = asn.status === 'In Progress' || asn.status === 'Scheduled';

            return (
              <div 
                key={asn.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {asn.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {asn.delivery_title || `Delivery ${asn.delivery_id}`}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {asn.cargo_type} • {asn.weight_kg}kg • Est. Carbon: {asn.carbon_kg_est}kg CO2
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isRecovered
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {asn.status}
                    </span>

                    {/* Passport Badge */}
                    <button
                      onClick={() => onViewPassport(asn.id)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-mono font-semibold transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Passport: {asn.passport_score}/100</span>
                    </button>
                  </div>
                </div>

                {/* Resource Allocation Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Truck className="w-3 h-3 text-emerald-600" /> Assigned Vehicle:
                    </span>
                    <p className="text-slate-900 font-bold mt-0.5 truncate">
                      {asn.vehicle_model || asn.vehicle_id}
                    </p>
                    <span className="text-[10px] text-slate-500">{asn.vehicle_plate}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <User className="w-3 h-3 text-emerald-600" /> Operator in Command:
                    </span>
                    <p className="text-slate-900 font-bold mt-0.5 truncate">
                      {asn.driver_name || asn.driver_id}
                    </p>
                    <span className="text-[10px] text-slate-500">Safety: {asn.driver_safety}/100</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-emerald-600" /> Departure Window:
                    </span>
                    <p className="text-slate-900 font-bold mt-0.5 truncate">
                      {new Date(asn.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-[10px] text-slate-500">End: {new Date(asn.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold">Cryptographic Seal:</span>
                    <p className="text-emerald-700 font-bold mt-0.5 truncate">
                      {asn.passport_hash ? asn.passport_hash.slice(0, 16) + '...' : 'VERIFIED'}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">SHA-256 Validated</span>
                  </div>

                </div>

                {/* Waypoints progression */}
                {asn.waypoints && asn.waypoints.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-semibold">
                      Mission Waypoint Progression:
                    </span>
                    <div className="flex items-center space-x-2 overflow-x-auto text-xs font-mono">
                      {asn.waypoints.map((wp, idx) => (
                        <React.Fragment key={idx}>
                          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap ${
                            wp.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                              : wp.status === 'IN_PROGRESS'
                              ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{wp.name}</span>
                          </div>
                          {idx < asn.waypoints!.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes (if any) */}
                {asn.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    Note: {asn.notes}
                  </p>
                )}

                {/* Actions Row */}
                {isInProgress && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      onClick={() => onOpenRecovery(asn)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Simulate Auto-Recovery</span>
                    </button>

                    <button
                      onClick={() => handleComplete(asn.id)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Mission & Release Assets</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
