import React from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  MapPin, Truck, User, ArrowRight, ExternalLink, RefreshCw
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
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              ACTIVE MISSIONS & ASSIGNMENT DISPATCHES
            </h2>
          </div>
          <p className="text-xs text-[#a3bdab]">
            Cryptographically audited missions with live Safety Passports, real-time waypoint progression, and failover safeguards.
          </p>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-xs text-[#a3bdab]">
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
                className="glass-panel-elevated rounded-2xl p-5 border border-[#e8dfd5]/10 hover:border-[#10b981]/30 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#e8dfd5]/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#161b22] text-[#34d399] border border-[#10b981]/30">
                      {asn.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {asn.delivery_title || `Delivery ${asn.delivery_id}`}
                      </h3>
                      <p className="text-xs text-[#7d9f88] font-mono">
                        {asn.cargo_type} • {asn.weight_kg}kg • Est. Carbon: {asn.carbon_kg_est}kg CO2
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isCompleted 
                        ? 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40' 
                        : isRecovered
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                        : 'bg-[#4a2545]/40 text-[#f4eaf4] border-[#c48fc4]/40'
                    }`}>
                      {asn.status}
                    </span>

                    {/* Passport Badge */}
                    <button
                      onClick={() => onViewPassport(asn.id)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 hover:bg-[#10b981]/25 text-xs font-mono transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Passport: {asn.passport_score}/100</span>
                    </button>
                  </div>
                </div>

                {/* Resource Allocation Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  
                  <div className="p-3 rounded-xl bg-[#0b0e14]/60 border border-[#e8dfd5]/5">
                    <span className="text-[10px] text-[#7d9f88] flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#10b981]" /> Assigned Vehicle:
                    </span>
                    <p className="text-white font-bold mt-0.5 truncate">
                      {asn.vehicle_model || asn.vehicle_id}
                    </p>
                    <span className="text-[10px] text-[#a3bdab]">{asn.vehicle_plate}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0e14]/60 border border-[#e8dfd5]/5">
                    <span className="text-[10px] text-[#7d9f88] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#dbb7db]" /> Operator in Command:
                    </span>
                    <p className="text-white font-bold mt-0.5 truncate">
                      {asn.driver_name || asn.driver_id}
                    </p>
                    <span className="text-[10px] text-[#a3bdab]">Safety Index: {asn.driver_safety}/100</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0e14]/60 border border-[#e8dfd5]/5">
                    <span className="text-[10px] text-[#7d9f88] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#d6c6b4]" /> Scheduled Departure:
                    </span>
                    <p className="text-white font-bold mt-0.5 truncate">
                      {new Date(asn.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-[10px] text-[#a3bdab]">Window End: {new Date(asn.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0e14]/60 border border-[#e8dfd5]/5">
                    <span className="text-[10px] text-[#7d9f88]">Cryptographic Seal:</span>
                    <p className="text-[#34d399] font-bold mt-0.5 truncate">
                      {asn.passport_hash ? asn.passport_hash.slice(0, 16) + '...' : 'VERIFIED'}
                    </p>
                    <span className="text-[10px] text-[#7d9f88]">SHA-256 Validated</span>
                  </div>

                </div>

                {/* Waypoints progression */}
                {asn.waypoints && asn.waypoints.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-[#a3bdab] uppercase tracking-wider block mb-2">
                      Mission Waypoint Progression:
                    </span>
                    <div className="flex items-center space-x-2 overflow-x-auto text-xs font-mono">
                      {asn.waypoints.map((wp, idx) => (
                        <React.Fragment key={idx}>
                          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border whitespace-nowrap ${
                            wp.status === 'COMPLETED'
                              ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30'
                              : wp.status === 'IN_PROGRESS'
                              ? 'bg-[#4a2545]/40 text-[#f4eaf4] border-[#c48fc4]/40'
                              : 'bg-[#161b22] text-[#7d9f88] border-[#e8dfd5]/5'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{wp.name}</span>
                          </div>
                          {idx < asn.waypoints!.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#34433a] shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes (if any) */}
                {asn.notes && (
                  <p className="text-[11px] text-[#a3bdab] italic">
                    Note: {asn.notes}
                  </p>
                )}

                {/* Actions Row */}
                {isInProgress && (
                  <div className="pt-3 border-t border-[#e8dfd5]/5 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      onClick={() => onOpenRecovery(asn)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Simulate Auto-Recovery</span>
                    </button>

                    <button
                      onClick={() => handleComplete(asn.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#0b0e14] text-xs font-bold transition-all cursor-pointer"
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
