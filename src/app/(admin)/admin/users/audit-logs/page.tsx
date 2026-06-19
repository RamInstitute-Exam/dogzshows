'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Search, X, RefreshCw, AlertTriangle, Eye, Calendar,
  Filter, ArrowLeftRight, Terminal, User, Laptop, Smartphone, Globe, Download
} from 'lucide-react';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function AuditLogsManagement() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, itemsPerPage, selectedEntity, selectedAction, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Build Query String
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
      });

      if (selectedEntity !== 'all') params.append('entity', selectedEntity);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/audit-logs?${params.toString()}`, { headers });
      const data = res;

      if (data.success) {
        setLogs(data.data);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleOpenDetail = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Log ID,User ID,User Email,Action,Entity,Entity ID,IP Address,Browser,Device,Timestamp"].join(",") + "\n"
      + logs.map(l => {
          const email = l.user?.email || 'System';
          return `"${l.id}","${l.userId || ''}","${email}","${l.action}","${l.entity}","${l.entityId || ''}","${l.ipAddress || ''}","${l.browser || ''}","${l.device || ''}","${l.createdAt}"`;
        }).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JuzDog_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derive common entities and actions for selectors
  const entities = ['USER', 'ROLE', 'PERMISSION', 'DOG', 'EVENT', 'CLUB', 'JUDGE', 'WINNER', 'PAYMENT', 'BANNER', 'CMS', 'FAQ', 'SUPPORT_TICKET'];
  const actions = ['LOGIN', 'REGISTER', 'SOCIAL_LOGIN', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_DOG', 'UPDATE_DOG', 'CREATE_EVENT', 'UPDATE_EVENT', 'PAYMENT_SUCCESS'];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Terminal className="w-8 h-8 text-foreground" /> System Audit Logs
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time tracking of administrative operations, state changes, login history, and device IPs.
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/80 border border-border text-foreground font-bold rounded-xl transition-all"
        >
          <Download className="w-5 h-5" /> Export Selected Logs
        </button>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by action, IP, browser, user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-border outline-none transition-all text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Limit Selector */}
            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Per Page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent text-foreground outline-none text-xs font-bold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-foreground hover:bg-foreground/95 text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Search
            </button>
            
            <button 
              type="button" 
              onClick={() => {
                setSearchTerm('');
                setSelectedEntity('all');
                setSelectedAction('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-accent hover:bg-accent/80 border border-border text-foreground font-semibold rounded-xl transition-all text-sm"
            >
              Clear Filters
            </button>
          </div>
        </form>

        {/* Dynamic Selector Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/60">
          {/* Entity Type Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Entity Layer</label>
            <select
              value={selectedEntity}
              onChange={(e) => { setSelectedEntity(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:border-border outline-none"
            >
              <option value="all">All Entities</option>
              {entities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Action Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Action Trigger</label>
            <select
              value={selectedAction}
              onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-semibold focus:border-border outline-none"
            >
              <option value="all">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Date range pickers */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs focus:border-border outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-foreground text-xs focus:border-border outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logs Table Layout */}
      <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-accent/30 border-b border-border">
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Operator User</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Action</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Entity Target</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">IP Address</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-center">Device</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Timestamp</th>
                <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">View Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-foreground  mb-3" />
                    <p className="text-muted-foreground font-semibold">Retrieving system operation logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground/60  mb-3" />
                    <h3 className="text-md font-bold text-foreground">No Audit Logs Found</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Adjust filter settings or search terms.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => {
                  const operatorName = log.user 
                    ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                    : 'System / Guest';

                  const email = log.user?.email || 'N/A';

                  return (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-accent/10 transition-colors"
                    >
                      {/* Operator User */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border text-muted-foreground">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{operatorName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4">
                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded-lg ${
                          log.action.includes('DELETE') 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : log.action.includes('CREATE')
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Entity Target */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground capitalize">{log.entity.toLowerCase().replace('_', ' ')}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{log.entityId || 'No ID'}</span>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="p-4 font-mono text-xs font-semibold text-muted-foreground">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      {/* Device Icon */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-accent border border-border text-xs rounded-xl font-bold text-muted-foreground">
                          {log.device?.toLowerCase() === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{log.device || 'Desktop'}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-xs font-bold text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleOpenDetail(log)}
                          className="p-2 bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-accent/20">
            <span className="text-xs font-semibold text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} logs
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-foreground hover:bg-accent disabled:opacity-45"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border ${
                    currentPage === idx + 1 
                      ? 'bg-foreground border-border text-white' 
                      : 'bg-card border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-foreground hover:bg-accent disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Difference comparison modal */}
      <AnimatePresence>
        {isModalOpen && selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full  rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-5 h-5 text-foreground" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Operation Payload Diff: {selectedLog.action}</h2>
                    <p className="text-xs text-muted-foreground font-semibold">Compare state changes before and after the operation.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-accent/25 border border-border rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Entity Target</span>
                    <p className="text-sm font-bold text-foreground">{selectedLog.entity}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Operator IP</span>
                    <p className="text-sm font-bold text-foreground">{selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Browser/Agent</span>
                    <p className="text-sm font-bold text-foreground truncate">{selectedLog.browser || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Timestamp</span>
                    <p className="text-sm font-bold text-foreground">
                      {new Date(selectedLog.createdAt).toLocaleDateString()} {new Date(selectedLog.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Diff Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-red-500/10 px-4 py-2 border border-red-500/20 rounded-xl">
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider">State Before (Old Value)</span>
                    </div>
                    <pre className="p-4 bg-background border border-border rounded-2xl text-xs overflow-auto font-mono text-red-400 max-h-[350px]">
                      {selectedLog.oldValue 
                        ? JSON.stringify(selectedLog.oldValue, null, 2)
                        : '// No previous state stored for this action.'}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 rounded-xl">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">State After (New Value)</span>
                    </div>
                    <pre className="p-4 bg-background border border-border rounded-2xl text-xs overflow-auto font-mono text-emerald-400 max-h-[350px]">
                      {selectedLog.newValue 
                        ? JSON.stringify(selectedLog.newValue, null, 2)
                        : selectedLog.details 
                        ? JSON.stringify(selectedLog.details, null, 2)
                        : '// No payload changes recorded.'}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-foreground hover:bg-foreground/95 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
