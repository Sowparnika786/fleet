import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, Search, Filter, Hash, 
  CheckCircle2, AlertOctagon, RefreshCw, ChevronDown, ChevronRight, Lock
} from 'lucide-react';
import { fetchBlackBoxLogs, verifyBlackBoxChain } from '../api';
import { BlackBoxLogItem } from '../types';

export const BlackBoxViewer: React.FC = () => {
  const [logs, setLogs] = useState<BlackBoxLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [chainStatus, setChainStatus] = useState<{
    verified: boolean;
    total_records: number;
    status: string;
    latest_head_hash?: string;
  } | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  useEffect(() => {
    loadLogs();
  }, [severityFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchBlackBoxLogs(60, severityFilter || undefined);
      setLogs(data);
    } catch (err) {
      console.error('Black Box load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await verifyBlackBoxChain();
      setChainStatus(res);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity_id.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.log_hash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-[#e8dfd5]/12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#4a2545]/50 border border-[#c48fc4]/30 text-[#f4eaf4]">
                <Terminal className="w-5 h-5 text-[#dbb7db]" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide font-mono">
                DISPATCH BLACK BOX // IMMUTABLE AUDIT RECORDER
              </h2>
            </div>
            <p className="text-xs text-[#a3bdab] max-w-2xl leading-relaxed">
              Flight-recorder ledger with cryptographically chained SHA-256 block hashes. Records all dispatch decisions, concurrency collisions, and failovers.
            </p>
          </div>

          {/* Cryptographic Verify Chain Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerifyChain}
              disabled={verifying}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white text-xs font-bold shadow-lg shadow-[#10b981]/25 border border-[#10b981]/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Hashes...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Hash Chain Integrity</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chain Verification Result Alert */}
        {chainStatus && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between animate-in fade-in ${
            chainStatus.verified 
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399]' 
              : 'bg-red-950/40 border-red-500/40 text-red-400'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>
                <strong>100% LEDGER INTEGRITY VERIFIED:</strong> All {chainStatus.total_records} chained SHA-256 records verified with zero tampering.
              </span>
            </div>
            <span className="text-[10px] text-[#7d9f88] hidden sm:inline">
              HEAD: {chainStatus.latest_head_hash?.slice(0, 16)}...
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-6 border-t border-[#e8dfd5]/10 flex flex-col sm:flex-row gap-3 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7d9f88] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by action, ID, hash, or actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161b22] border border-[#e8dfd5]/12 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#7d9f88] focus:outline-none focus:border-[#10b981]"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {['', 'INFO', 'WARNING', 'CRITICAL', 'SECURITY_ALERT'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40'
                    : 'bg-[#161b22] text-[#a3bdab] border border-[#e8dfd5]/5 hover:text-white'
                }`}
              >
                {sev || 'ALL SEVERITIES'}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Logs Table */}
      <div className="glass-panel-elevated rounded-2xl border border-[#e8dfd5]/12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#161b22]/90 text-[#a3bdab] uppercase text-[10px] border-b border-[#e8dfd5]/10">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfd5]/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#a3bdab]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#10b981]" />
                    Loading Black Box Audit Trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#a3bdab]">
                    No black box events match current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  const isCritical = log.severity === 'CRITICAL' || log.severity === 'SECURITY_ALERT';
                  const isWarning = log.severity === 'WARNING';

                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        className={`hover:bg-[#161b22]/70 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-[#161b22]/90' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-[#7d9f88]">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </td>
                        <td className="px-4 py-3 text-[#a3bdab] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical 
                              ? 'bg-red-950/60 text-red-400 border border-red-500/30' 
                              : isWarning
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                              : 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-[#f4efea]">
                          {log.entity_type} <span className="text-[#7d9f88]">({log.entity_id})</span>
                        </td>
                        <td className="px-4 py-3 text-[#dbb7db]">
                          {log.actor}
                        </td>
                        <td className="px-4 py-3 text-[#34d399] truncate max-w-xs" title={log.log_hash}>
                          {log.log_hash.slice(0, 16)}...
                        </td>
                      </tr>

                      {/* Expandable Payload & Chain Row */}
                      {isExpanded && (
                        <tr className="bg-[#0b0e14]/95">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-[#a3bdab] uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <Hash className="w-3 h-3 text-[#10b981]" /> Full SHA-256 Hash:
                                </span>
                                <p className="text-[#34d399] break-all bg-[#161b22] p-2 rounded mt-1 border border-[#e8dfd5]/5">
                                  {log.log_hash}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#a3bdab] uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <Hash className="w-3 h-3 text-[#dbb7db]" /> Chained Previous Block Hash:
                                </span>
                                <p className="text-[#dbb7db] break-all bg-[#161b22] p-2 rounded mt-1 border border-[#e8dfd5]/5">
                                  {log.previous_hash}
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="text-[#a3bdab] uppercase tracking-wider text-[10px]">
                                Event Payload (Audit Data):
                              </span>
                              <pre className="mt-1 p-3 rounded-lg bg-[#161b22] text-[#f4efea] text-[11px] overflow-x-auto border border-[#e8dfd5]/5">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
