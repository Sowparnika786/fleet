import React, { useState } from 'react';
import { 
  Zap, X, ChevronRight, ChevronLeft, ShieldCheck, Flame, 
  Clock, CheckCircle2, ArrowRight
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Autonomous Fleet Pulse & Telemetry",
      badge: "COMMAND CENTER",
      icon: Zap,
      tab: "overview",
      description: "Fleetwise Nexus delivers autonomous dispatch orchestration. The live Fleet Pulse aggregates active utilization rates, avoided carbon emissions (kg CO2e), guaranteed SLA compliance, and real-time sensor metrics.",
      highlight: "Notice the real-time sensor bar displaying live speed telemetry, state-of-charge, and tire pressure across active Bay Area routes.",
      actionLabel: "View Command Center"
    },
    {
      title: "2. Explainable Smart Match Engine",
      badge: "AI INTELLIGENCE",
      icon: ShieldCheck,
      tab: "deliveries",
      description: "Unlike black-box dispatch systems, Smart Match evaluates 5 distinct criteria (Proximity, Capacity Fit, Driver Safety Rating, Carbon Footprint, and SLA Fatigue Headroom) to compute an explainable score with clear operational tradeoffs.",
      highlight: "Head to the Deliveries manifest and click 'Smart Match Dispatch' on any urgent cargo consignment to see the real-time radar score.",
      actionLabel: "Explore Deliveries Manifest"
    },
    {
      title: "3. Assignment Safety Passport",
      badge: "CRYPTOGRAPHIC AUDIT",
      icon: ShieldCheck,
      tab: "assignments",
      description: "Every single mission is audited against 8 rigorous safety vectors before authorization: Driver Fatigue, Cargo Endorsements, Payload Tolerances, 125% Range Buffer, Mechanical Inspection, Operator Index, Security Match, and Environmental Hazard.",
      highlight: "Each passport is digitally signed with an immutable SHA-256 integrity hash and RSA credential seal.",
      actionLabel: "Inspect Safety Passports"
    },
    {
      title: "4. Double-Booking Attack Lab",
      badge: "ATOMIC CONCURRENCY",
      icon: Flame,
      tab: "attack-lab",
      description: "Stress-test the backend concurrency protection live! Launch 15 to 30 concurrent dispatch threads attacking the EXACT SAME vehicle and driver at the identical millisecond.",
      highlight: "Watch SQLite BEGIN IMMEDIATE serialize the race condition: exactly 1 thread wins while all colliding requests receive deterministic 409 Conflict errors.",
      actionLabel: "Open Attack Lab Now"
    },
    {
      title: "5. Auto-Recovery Dispatch",
      badge: "INCIDENT FAILOVER",
      icon: ShieldCheck,
      tab: "assignments",
      description: "Simulate a live vehicle breakdown, driver fatigue spike, or road hazard. The system immediately re-allocates cargo, routes the nearest qualified replacement, recalculates SLA impact, and amends the Safety Passport without service disruption.",
      highlight: "Click 'Auto-Recovery' on any active assignment to simulate an emergency rescue.",
      actionLabel: "View Active Missions"
    },
    {
      title: "6. Fleet Time Machine",
      badge: "TIME SCRUBBER",
      icon: Clock,
      tab: "time-machine",
      description: "Scrub seamlessly from -24 hours in the past to +24 hours into the future. Watch battery depletion trajectories, depot charging curves, driver shift rollovers, and predictive bottleneck advisories.",
      highlight: "Drag the 48-hour timeline slider or use presets like '+4h Evening Peak' to see simulated fleet positions.",
      actionLabel: "Launch Time Machine"
    },
    {
      title: "7. Dispatch Black Box & Hash Chain",
      badge: "FLIGHT RECORDER",
      icon: ShieldCheck,
      tab: "black-box",
      description: "Every state transition, dispatch decision, double-booking prevention, and failover is recorded in an immutable ledger chained with SHA-256 cryptographic hashes.",
      highlight: "Click 'Verify Cryptographic Chain' to mathematically prove 100% tamper-evident integrity across all system records.",
      actionLabel: "Verify Black Box Ledger"
    }
  ];

  const activeStepData = steps[currentStep];
  const StepIcon = activeStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToFeature = () => {
    setActiveTab(activeStepData.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight font-mono">
                FLEETWISE NEXUS // GUIDED TOUR
              </h3>
              <p className="text-[11px] text-slate-500">
                Step {currentStep + 1} of {steps.length} — Interactive Walkthrough
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

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {activeStepData.badge}
            </span>
            <div className="flex space-x-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? 'w-6 bg-emerald-600' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 mt-1">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {activeStepData.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {activeStepData.description}
              </p>
              
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{activeStepData.highlight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleJumpToFeature}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <span>{activeStepData.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
