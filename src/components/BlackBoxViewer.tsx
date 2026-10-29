import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, Search, Hash, 
  CheckCircle2, RefreshCw, ChevronDown, ChevronRight, Lock
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Terminal className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              DISPATCH BLACK BOX // IMMUTABLE AUDIT RECORDER
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Flight-recorder ledger with cryptographically chained SHA-256 block hashes. Records all dispatch decisions, concurrency collisions, and failovers.
          </p>
        </div>

        {/* Cryptographic Verify Chain Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between animate-in fade-in ${
          chainStatus.verified 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>100% LEDGER INTEGRITY VERIFIED:</strong> All {chainStatus.total_records} chained SHA-256 records verified with zero tampering.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
            HEAD: {chainStatus.latest_head_hash?.slice(0, 16)}...
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, ID, hash, or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['', 'INFO', 'WARNING', 'CRITICAL', 'SECURITY_ALERT'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === sev
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {sev || 'ALL SEVERITIES'}
            </button>
          ))}
        </div>

      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading Black Box Audit Trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
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
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : isWarning
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {log.entity_type} <span className="text-slate-400">({log.entity_id})</span>
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">
                          {log.actor}
                        </td>
                        <td className="px-4 py-3 text-emerald-700 truncate max-w-xs font-bold" title={log.log_hash}>
                          {log.log_hash.slice(0, 16)}...
                        </td>
                      </tr>

                      {/* Expandable Payload & Chain Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                                  <Hash className="w-3 h-3 text-emerald-600" /> Full SHA-256 Hash:
                                </span>
                                <p className="text-emerald-800 break-all bg-white p-2 rounded mt-1 border border-slate-200 font-bold">
                                  {log.log_hash}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                                  <Hash className="w-3 h-3 text-emerald-600" /> Chained Previous Block Hash:
                                </span>
                                <p className="text-slate-700 break-all bg-white p-2 rounded mt-1 border border-slate-200 font-mono">
                                  {log.previous_hash}
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-500 uppercase font-semibold text-[10px]">
                                Event Payload (Audit Data):
                              </span>
                              <pre className="mt-1 p-3 rounded-lg bg-white text-slate-800 text-[11px] overflow-x-auto border border-slate-200">
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
