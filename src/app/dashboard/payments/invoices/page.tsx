'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Loader2, Eye, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PaymentsInvoicesPage() {
  const { data: result, isLoading } = useQuery({
    queryKey: ['userPaymentsHistory'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/history');
      return response.data;
    }
  });

  const data = result?.data || [];

  return (
    <div className="space-y-6">
      
      {/* Page Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Payments Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and view your payments invoices records.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none text-foreground" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Filter className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
          <Button className="bg-foreground hover:bg-foreground rounded-xl font-bold shadow-md text-foreground"><Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">New Entry</span></Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Records Found</h2>
            <p className="text-muted-foreground max-w-sm mb-6">There are currently no payments invoices records available in this section. Start by creating a new entry.</p>
            <Button variant="outline" className="border-border text-foreground hover:bg-foreground hover:text-foreground">Create New</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="p-4 font-semibold text-foreground">Transaction ID</th>
                  <th className="p-4 font-semibold text-foreground">Date</th>
                  <th className="p-4 font-semibold text-foreground">Amount</th>
                  <th className="p-4 font-semibold text-foreground">Status</th>
                  <th className="p-4 font-semibold text-foreground">Event</th>
                  <th className="p-4 font-semibold text-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground text-sm font-mono">{payment.transactionId || payment.id.slice(0,8)}</td>
                    <td className="p-4 text-foreground">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-foreground">₹{payment.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-foreground text-sm">{payment.registration?.event?.name || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl w-full p-6 sm:p-8">
                          {/* Receipt Header */}
                          <div className="flex flex-row justify-between items-start pb-5 mb-5 border-b border-border">
                            <div>
                              <DialogTitle className="text-2xl font-black text-primary tracking-tighter">JUZDOG</DialogTitle>
                              <p className="text-muted-foreground text-xs mt-1 font-mono">Receipt: {payment.transactionId || payment.id.slice(0, 12)}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.print()} className="flex-shrink-0 rounded-xl border-border text-muted-foreground hover:text-foreground gap-1.5">
                              <Printer className="w-3.5 h-3.5" /> Print
                            </Button>
                          </div>

                          {/* Billed To + Status — side by side */}
                          <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-border">
                            {/* Left: Billed To */}
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Billed To</p>
                              <p className="text-foreground font-bold text-sm">{payment.registration?.user?.firstName || 'User'} {payment.registration?.user?.lastName || ''}</p>
                              <p className="text-muted-foreground text-xs">{payment.registration?.user?.email || 'Registered User'}</p>
                            </div>
                            {/* Right: Status */}
                            <div className="bg-muted/30 rounded-xl border border-border/50 p-3 space-y-2">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Payment Status</p>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    payment.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                                  }`}>
                                    {payment.status}
                                  </span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">via {payment.paymentGateway || 'Card'}</span>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date Paid</p>
                                  <p className="text-xs text-foreground">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} · {new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Line Items */}
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Description</th>
                                <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-4 pr-4">
                                  <p className="font-semibold text-foreground text-sm">{payment.registration?.event?.name || 'Event Registration'}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">Dog: {payment.registration?.dog?.name || 'N/A'}</p>
                                </td>
                                <td className="py-4 text-right font-mono text-foreground font-semibold text-sm whitespace-nowrap">
                                  ₹{Number(payment.amount).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-border">
                                <td className="pt-4 text-sm text-muted-foreground font-medium text-right">Total Paid</td>
                                <td className="pt-4 text-right text-xl font-black text-primary whitespace-nowrap">₹{Number(payment.amount).toLocaleString('en-IN')}</td>
                              </tr>
                            </tfoot>
                          </table>

                          {/* Footer note */}
                          <p className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border/50">Thank you for your payment • JuzDog Platform</p>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}
