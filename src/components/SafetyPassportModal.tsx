import React from 'react';
import { 
  ShieldCheck, X, QrCode, CheckCircle2, AlertTriangle, 
  XCircle, Award, Hash, Key, ExternalLink, Printer
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-panel-elevated w-full max-w-3xl rounded-2xl border border-[#10b981]/40 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#10b981]/15 via-[#4a2545]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Passport Header */}
        <div className="px-6 py-4 border-b border-[#e8dfd5]/12 bg-[#0a0d13]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] via-[#047857] to-[#4a2545] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#10b981]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wider font-mono">
                  ASSIGNMENT SAFETY PASSPORT // OFFICIAL AUDIT
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isPassed 
                    ? 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40' 
                    : isConditional
                    ? 'bg-amber-900/30 text-amber-300 border-amber-500/40'
                    : 'bg-red-950/60 text-red-400 border-red-500/30'
                }`}>
                  {passport.verdict}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#a3bdab]">
                Passport ID: <span className="text-white">{passport.id}</span> • Mission: <span className="text-[#34d399]">{passport.assignment_id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-[#a3bdab] hover:text-white hover:bg-[#1c222c] transition-all cursor-pointer"
              title="Print Passport"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a3bdab] hover:text-white hover:bg-[#1c222c] transition-all cursor-pointer"
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
            <div className="p-4 rounded-xl bg-[#0b0e14]/80 border border-[#e8dfd5]/10 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#10b981] flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold font-mono text-white">{passport.overall_score}</span>
                <span className="text-[8px] font-mono text-[#7d9f88]">SCORE</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#a3bdab] uppercase tracking-wider">Compliance Index</span>
                <p className="text-xs text-white font-semibold mt-0.5">8-Vector Composite</p>
                <p className="text-[10px] text-[#7d9f88] mt-1">Pre-dispatch certified</p>
              </div>
            </div>

            {/* SHA-256 Hash Seal */}
            <div className="p-4 rounded-xl bg-[#0b0e14]/80 border border-[#e8dfd5]/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#a3bdab] uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#10b981]" /> SHA-256 Integrity Hash
                </span>
                <p className="text-[11px] font-mono text-[#34d399] break-all mt-1 bg-[#161b22] p-1.5 rounded border border-[#e8dfd5]/5">
                  {passport.hash}
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#7d9f88]">Issued: {new Date(passport.issued_at).toLocaleString()}</span>
            </div>

            {/* Digital Signature */}
            <div className="p-4 rounded-xl bg-[#0b0e14]/80 border border-[#e8dfd5]/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#a3bdab] uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#dbb7db]" /> RSA-4096 Signature Seal
                </span>
                <p className="text-[11px] font-mono text-[#dbb7db] break-all mt-1 bg-[#161b22] p-1.5 rounded border border-[#e8dfd5]/5">
                  {passport.digital_signature}
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#a867a8]">Verified by Nexus Root Authority</span>
            </div>

          </div>

          {/* Warnings (if any) */}
          {passport.warnings && passport.warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Operational Advisories:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200">
                {passport.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 8-Vector Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#10b981]" />
              EVALUATED SAFETY VECTORS // 8-POINT VERIFICATION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passport.vectors.map((vec) => {
                const isVecPass = vec.status === 'PASS';
                const isVecCond = vec.status === 'CONDITIONAL';

                return (
                  <div 
                    key={vec.code}
                    className="p-3 rounded-xl bg-[#0b0e14]/60 border border-[#e8dfd5]/8 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isVecPass ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        ) : isVecCond ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs font-semibold text-white">{vec.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isVecPass 
                          ? 'bg-[#10b981]/20 text-[#34d399]' 
                          : isVecCond 
                          ? 'bg-amber-900/30 text-amber-300' 
                          : 'bg-red-950/60 text-red-400'
                      }`}>
                        {vec.score.toFixed(0)}/100
                      </span>
                    </div>

                    <div className="w-full bg-[#1c222c] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          isVecPass ? 'bg-[#10b981]' : (isVecCond ? 'bg-amber-400' : 'bg-red-400')
                        }`}
                        style={{ width: `${vec.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#a3bdab] leading-snug">
                      {vec.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QR Code Payload Box */}
          <div className="p-4 rounded-xl bg-[#0b0e14]/70 border border-[#e8dfd5]/8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-[#161b22] text-[#10b981]">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#a3bdab] uppercase">QR Code Machine-Readable Payload</span>
                <p className="text-[11px] font-mono text-white mt-0.5">{passport.qr_data}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#7d9f88] uppercase tracking-widest hidden sm:inline">
              ENCRYPTED TOKEN
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e8dfd5]/10 bg-[#0a0d13]/90 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#161b22] border border-[#e8dfd5]/15 text-xs text-white hover:bg-[#1c222c] transition-all cursor-pointer"
          >
            Close Passport
          </button>
        </div>

      </div>
    </div>
  );
};
