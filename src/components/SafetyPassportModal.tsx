import React from 'react';
import { 
  ShieldCheck, X, QrCode, CheckCircle2, AlertTriangle, 
  XCircle, Award, Hash, Key, Printer
} from 'lucide-react';
import { SafetyPassport } from '../types';

interface SafetyPassportModalProps {
  passport: SafetyPassport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyPassportModal: React.FC<SafetyPassportModalProps> = ({
  passport,
  isOpen,
  onClose
}) => {
  if (!isOpen || !passport) return null;

  const isPassed = passport.verdict === 'PASSED';
  const isConditional = passport.verdict === 'CONDITIONAL_APPROVAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Passport Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                  ASSIGNMENT SAFETY PASSPORT // OFFICIAL AUDIT
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isPassed 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : isConditional
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}>
                  {passport.verdict}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Passport ID: <span className="text-slate-900 font-bold">{passport.id}</span> • Mission: <span className="text-emerald-700 font-bold">{passport.assignment_id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Print Passport"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Top Score Banner & Cryptographic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Score */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-white flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold font-mono text-slate-900">{passport.overall_score}</span>
                <span className="text-[8px] font-mono text-slate-400 font-bold">SCORE</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Compliance Index</span>
                <p className="text-xs text-slate-900 font-bold mt-0.5">8-Vector Composite</p>
                <p className="text-[10px] text-emerald-700 font-medium mt-1">Pre-dispatch certified</p>
              </div>
            </div>

            {/* SHA-256 Hash Seal */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Hash className="w-3 h-3 text-emerald-600" /> SHA-256 Integrity Hash
                </span>
                <p className="text-[11px] font-mono text-slate-800 break-all mt-1 bg-white p-1.5 rounded border border-slate-200">
                  {passport.hash}
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1">Issued: {new Date(passport.issued_at).toLocaleString()}</span>
            </div>

            {/* Digital Signature */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3 text-emerald-600" /> RSA-4096 Signature Seal
                </span>
                <p className="text-[11px] font-mono text-slate-800 break-all mt-1 bg-white p-1.5 rounded border border-slate-200">
                  {passport.digital_signature}
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 font-medium mt-1">Verified by Nexus Authority</span>
            </div>

          </div>

          {/* Warnings (if any) */}
          {passport.warnings && passport.warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Operational Advisories:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                {passport.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 8-Vector Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              EVALUATED SAFETY VECTORS // 8-POINT VERIFICATION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passport.vectors.map((vec) => {
                const isVecPass = vec.status === 'PASS';
                const isVecCond = vec.status === 'CONDITIONAL';

                return (
                  <div 
                    key={vec.code}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isVecPass ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isVecCond ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        <span className="text-xs font-bold text-slate-900">{vec.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isVecPass 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isVecCond 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {vec.score.toFixed(0)}/100
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          isVecPass ? 'bg-emerald-500' : (isVecCond ? 'bg-amber-400' : 'bg-rose-500')
                        }`}
                        style={{ width: `${vec.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {vec.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QR Code Payload Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-emerald-600">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">QR Code Token</span>
                <p className="text-[11px] font-mono text-slate-800 mt-0.5 font-bold">{passport.qr_data}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider hidden sm:inline">
              ENCRYPTED
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Close Passport
          </button>
        </div>

      </div>
    </div>
  );
};
