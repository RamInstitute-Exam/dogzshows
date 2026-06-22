'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Undo2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

import { PaymentService } from '@/services/payment.service';
import api from '@/services/api';

export default function RefundsDashboard() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const data = await PaymentService.getRefunds();
      if (data.success) {
        setRefunds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const filtered = refunds.filter(r => 
    (r.transactionId || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.payment?.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Undo2 className="w-8 h-8 text-red-500" /> Refund Management
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Process cancellations, chargebacks, and refund requests.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search refund TXN or Email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Refund TXN</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Customer & Reason</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500  mb-4" />
                        <p className="text-muted-foreground">Loading refund requests...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No pending refunds found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <motion.tr 
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground uppercase">{r.transactionId || 'Awaiting API'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{r.payment?.user?.firstName} {r.payment?.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Reason: <span className="text-red-400">{r.refundReason || 'User Cancellation'}</span></p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-foreground text-lg">₹{r.amount?.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          {r.status === 'PROCESSED' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                              PROCESSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {r.status === 'PENDING' && (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-foreground font-bold">
                              <RefreshCw className="w-4 h-4 mr-2" /> Process
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      
  );
}
