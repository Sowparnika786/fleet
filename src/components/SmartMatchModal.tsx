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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                  EXPLAINABLE SMART MATCH // AI DISPATCH REASONING
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {matchData ? `${matchData.analysis_time_ms}ms INFERENCE` : 'ANALYZING...'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Cargo: <span className="text-slate-900 font-bold">{delivery.title}</span> ({delivery.cargo_type} • {delivery.weight_kg}kg)
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500">
                Evaluating fleet proximity, battery curves, cargo certifications, and SLA margins...
              </p>
            </div>
          ) : !matchData || matchData.candidates.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              No available fleet resources meet all mandatory constraints for this delivery.
            </div>
          ) : (
            <>
              {/* Selected Candidate Detailed Breakdown */}
              {selectedCandidate && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                  
                  {/* Top Match Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl font-bold font-mono text-emerald-700">{selectedCandidate.total_score}</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">SCORE</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            RANK #{selectedCandidate.rank} OPTIMAL
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Est: {selectedCandidate.estimated_duration_min} min • {selectedCandidate.estimated_carbon_kg}kg CO2
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {selectedCandidate.vehicle_model} + {selectedCandidate.driver_name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {selectedCandidate.vehicle_category} ({selectedCandidate.vehicle_plate}) • Driver Safety {selectedCandidate.driver_safety_score}/100
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAuthorizeDispatch}
                      disabled={dispatching}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
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
                    <h5 className="text-[11px] font-mono text-slate-500 uppercase font-semibold mb-2">
                      Multi-Factor Evaluation Criteria:
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Navigation className="w-3 h-3 text-emerald-600" /> Proximity (30%)
                        </span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {selectedCandidate.breakdown.proximity_score}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Truck className="w-3 h-3 text-emerald-600" /> Capacity (20%)
                        </span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {selectedCandidate.breakdown.capacity_score}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Shield className="w-3 h-3 text-emerald-600" /> Safety (20%)
                        </span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {selectedCandidate.breakdown.safety_score}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Leaf className="w-3 h-3 text-emerald-600" /> Carbon (15%)
                        </span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {selectedCandidate.breakdown.carbon_efficiency_score}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-emerald-600" /> SLA (15%)
                        </span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {selectedCandidate.breakdown.sla_compatibility_score}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Explainability Rationale & Tradeoffs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                        Why This Resource Was Chosen:
                      </span>
                      <ul className="space-y-1.5 text-xs text-emerald-900">
                        {selectedCandidate.rationale.map((r, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Operational Considerations & Tradeoffs:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {selectedCandidate.tradeoffs.map((t, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
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
                  <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">
                    Alternative Qualified Dispatch Pairings:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchData.candidates.slice(1).map((c) => {
                      const isSelected = selectedCandidate?.vehicle_id === c.vehicle_id && selectedCandidate?.driver_id === c.driver_id;
                      return (
                        <div
                          key={`${c.vehicle_id}-${c.driver_id}`}
                          onClick={() => setSelectedCandidate(c)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/50 border-emerald-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              RANK #{c.rank}
                            </span>
                            <span className="text-sm font-bold font-mono text-slate-900">
                              {c.total_score} <span className="text-[10px] text-slate-400">pts</span>
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">
                            {c.vehicle_model}
                          </p>
                          <p className="text-[11px] text-slate-500 mb-1">
                            Driver: {c.driver_name} (Safety {c.driver_safety_score})
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
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
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
