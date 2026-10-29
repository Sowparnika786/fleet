import React, { useState, useEffect } from 'react';
import { 
  Sparkles, X, CheckCircle2, ChevronRight, Award, 
  Leaf, Clock, Navigation, Shield, RefreshCw, Zap, Truck, User
} from 'lucide-react';
import { fetchSmartMatch, createAssignment } from '../api';
import { Delivery, SmartMatchResponse, SmartMatchCandidate } from '../types';

interface SmartMatchModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

export const SmartMatchModal: React.FC<SmartMatchModalProps> = ({
  delivery,
  isOpen,
  onClose,
  onAssignmentCreated
}) => {
  const [matchData, setMatchData] = useState<SmartMatchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<SmartMatchCandidate | null>(null);
  const [dispatching, setDispatching] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && delivery) {
      loadMatch(delivery.id);
    }
  }, [isOpen, delivery]);

  const loadMatch = async (deliveryId: string) => {
    setLoading(true);
    setMatchData(null);
    setSelectedCandidate(null);
    try {
      const data = await fetchSmartMatch(deliveryId);
      setMatchData(data);
      if (data.top_recommendation) {
        setSelectedCandidate(data.top_recommendation);
      }
    } catch (err: any) {
      alert(`Smart Match error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeDispatch = async () => {
    if (!delivery || !selectedCandidate) return;
    setDispatching(true);
    try {
      await createAssignment({
        delivery_id: delivery.id,
        vehicle_id: selectedCandidate.vehicle_id,
        driver_id: selectedCandidate.driver_id,
        notes: `Smart Match Rank #${selectedCandidate.rank} (${selectedCandidate.total_score} score)`
      });
      onAssignmentCreated();
      onClose();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-panel-elevated w-full max-w-4xl rounded-2xl border border-[#10b981]/40 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#10b981]/15 via-[#4a2545]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e8dfd5]/12 bg-[#0a0d13]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] via-[#047857] to-[#4a2545] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#10b981]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wider font-mono">
                  EXPLAINABLE SMART MATCH // DISPATCH REASONING
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                  {matchData ? `${matchData.analysis_time_ms}ms AI INFERENCE` : 'ANALYZING...'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#a3bdab]">
                Cargo: <span className="text-white font-semibold">{delivery.title}</span> ({delivery.cargo_type} • {delivery.weight_kg}kg)
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#a3bdab]">
                Evaluating fleet proximity, battery curves, cargo certifications, and SLA margins...
              </p>
            </div>
          ) : !matchData || matchData.candidates.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#a3bdab]">
              No available fleet resources meet all mandatory constraints for this delivery.
            </div>
          ) : (
            <>
              {/* Selected Candidate Detailed Breakdown */}
              {selectedCandidate && (
                <div className="p-5 rounded-2xl bg-[#0b0e14]/90 border border-[#10b981]/30 space-y-5">
                  
                  {/* Top Match Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e8dfd5]/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl font-bold font-mono text-[#34d399]">{selectedCandidate.total_score}</span>
                        <span className="text-[9px] font-mono text-[#7d9f88]">SCORE</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10b981]/20 text-[#34d399]">
                            RANK #{selectedCandidate.rank} OPTIMAL
                          </span>
                          <span className="text-xs text-[#a3bdab] font-mono">
                            Est: {selectedCandidate.estimated_duration_min} min • {selectedCandidate.estimated_carbon_kg}kg CO2
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">
                          {selectedCandidate.vehicle_model} + {selectedCandidate.driver_name}
                        </h4>
                        <p className="text-xs text-[#7d9f88]">
                          {selectedCandidate.vehicle_category} ({selectedCandidate.vehicle_plate}) • Driver Safety {selectedCandidate.driver_safety_score}/100
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAuthorizeDispatch}
                      disabled={dispatching}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] hover:from-[#34d399] hover:to-[#10b981] text-white text-xs font-bold shadow-lg shadow-[#10b981]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {dispatching ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Issuing Passport...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Authorize & Issue Passport</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 5-Factor Radar Score Metrics */}
                  <div>
                    <h5 className="text-[11px] font-mono text-[#a3bdab] uppercase tracking-wider mb-2">
                      Multi-Factor Evaluation Criteria:
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      
                      <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#e8dfd5]/8">
                        <span className="text-[10px] text-[#a3bdab] flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#10b981]" /> Proximity (30%)
                        </span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {selectedCandidate.breakdown.proximity_score}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#e8dfd5]/8">
                        <span className="text-[10px] text-[#a3bdab] flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#d6c6b4]" /> Capacity (20%)
                        </span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {selectedCandidate.breakdown.capacity_score}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#e8dfd5]/8">
                        <span className="text-[10px] text-[#a3bdab] flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#10b981]" /> Safety (20%)
                        </span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {selectedCandidate.breakdown.safety_score}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#e8dfd5]/8">
                        <span className="text-[10px] text-[#a3bdab] flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-[#34d399]" /> Carbon (15%)
                        </span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {selectedCandidate.breakdown.carbon_efficiency_score}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#e8dfd5]/8">
                        <span className="text-[10px] text-[#a3bdab] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#dbb7db]" /> SLA (15%)
                        </span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {selectedCandidate.breakdown.sla_compatibility_score}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Explainability Rationale & Tradeoffs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#10b981]/5 border border-[#10b981]/20">
                      <span className="text-[11px] font-mono font-bold text-[#34d399] uppercase tracking-wider block mb-2">
                        Why This Resource Was Chosen:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#e8dfd5]">
                        {selectedCandidate.rationale.map((r, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#4a2545]/20 border border-[#c48fc4]/20">
                      <span className="text-[11px] font-mono font-bold text-[#dbb7db] uppercase tracking-wider block mb-2">
                        Operational Considerations & Tradeoffs:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#e8dfd5]">
                        {selectedCandidate.tradeoffs.map((t, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dbb7db] shrink-0 mt-1.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}

              {/* Runner-Up Alternatives List */}
              {matchData.candidates.length > 1 && (
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#a3bdab] uppercase tracking-wider mb-3">
                    Alternative Qualified Dispatch Pairings:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchData.candidates.slice(1).map((c) => {
                      const isSelected = selectedCandidate?.vehicle_id === c.vehicle_id && selectedCandidate?.driver_id === c.driver_id;
                      return (
                        <div
                          key={`${c.vehicle_id}-${c.driver_id}`}
                          onClick={() => setSelectedCandidate(c)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#161b22] border-[#10b981] shadow-md'
                              : 'bg-[#0b0e14]/60 border-[#e8dfd5]/8 hover:border-[#e8dfd5]/25'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1c222c] text-[#a3bdab]">
                              RANK #{c.rank}
                            </span>
                            <span className="text-sm font-bold font-mono text-white">
                              {c.total_score} <span className="text-[10px] text-[#7d9f88]">pts</span>
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white">
                            {c.vehicle_model}
                          </p>
                          <p className="text-[11px] text-[#a3bdab] mb-2">
                            Driver: {c.driver_name} (Safety {c.driver_safety_score})
                          </p>
                          <p className="text-[10px] text-[#7d9f88] truncate">
                            {c.tradeoffs[0] || c.rationale[0]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e8dfd5]/10 bg-[#0a0d13]/90 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/15 text-xs text-white hover:bg-[#1c222c] transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
