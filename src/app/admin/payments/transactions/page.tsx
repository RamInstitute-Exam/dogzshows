'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, IndianRupee, ArrowUpRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

import { PaymentService } from '@/services/payment.service';
import api from '@/services/api';

export default function TransactionsDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await PaymentService.getTransactions({ page, limit: 10 });
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(t => 
    (t.transactionId || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <IndianRupee className="w-8 h-8 text-green-500" /> Transactions
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Monitor live platform payments, entries, and revenue.</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search TXN ID or Email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
                />
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                Export CSV
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Transaction Info</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500  mb-4" />
                        <p className="text-muted-foreground">Loading transactions...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <IndianRupee className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No transactions found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, i) => (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground uppercase">{t.transactionId || 'Awaiting ID'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(t.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{t.user?.firstName} {t.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t.user?.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-foreground text-lg">₹{t.amount?.toLocaleString()}</span>
                          <p className="text-xs text-muted-foreground mt-1">via {t.paymentGateway}</p>
                        </td>
                        <td className="py-4 px-6">
                          {t.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                              <CheckCircle className="w-3 h-3" /> SUCCESS
                            </span>
                          ) : t.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                              <XCircle className="w-3 h-3" /> FAILED
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-card">
                <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-border text-foreground hover:bg-accent">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-border text-foreground hover:bg-accent">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      
  );
}
