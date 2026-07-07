'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Search, MapPin, Receipt, ExternalLink, Calendar, 
  Trash2, XCircle, Award, FileText, Download, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { config } from '@/lib/config';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function RegisteredEvents() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations');
      if (res.success) {
        setRegistrations(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to request cancellation for this registration?')) {
      return;
    }

    try {
      const res = await api.put(`/registrations/${regId}`, { status: 'CANCELLED' });
      if (res.success) {
        toast.success('Registration cancelled successfully');
        fetchRegistrations();
      } else {
        toast.error(res.message || 'Failed to cancel registration');
      }
    } catch (err) {
      toast.error('An error occurred during cancellation');
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.event?.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.dog?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.serialNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground bg-background min-h-[auto]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" /> My Event Registrations
          </h1>
          <p className="text-muted-foreground">Track your upcoming shows, download entry passes, receipts, and certificates.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by event, dog or serial no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-[#7C8798] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xl">
          <Calendar className="w-16 h-16 text-[#1E293B] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Registrations</h3>
          <p className="text-muted-foreground mb-6">You haven't registered any dogs for an upcoming event yet.</p>
          <Link href="/events">
            <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold px-6 py-2.5 rounded-xl">Browse Show Calendar</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRegistrations.map((reg, i) => {
            const isConfirmed = reg.status === 'CONFIRMED';
            const isCancelled = reg.status === 'CANCELLED';
            const isPending = reg.status === 'PENDING';
            
            return (
              <motion.div 
                key={reg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      isConfirmed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      isCancelled ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {reg.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      isConfirmed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      Payment: {isConfirmed ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {new Date(reg.event?.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 leading-tight flex items-center gap-1.5 flex-wrap">
                      {reg.event?.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground mt-1">
                      <p className="flex items-center gap-1"><Building className="w-4 h-4 shrink-0" /> {reg.event?.club?.name || 'Kennel Club'}</p>
                      <p className="flex items-center gap-1"><MapPin className="w-4 h-4 shrink-0" /> {reg.event?.venue}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 border border-border/40 p-3.5 rounded-xl text-xs font-bold">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Reg No</span>
                      <span className="text-foreground font-mono">{reg.serialNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Dog Name</span>
                      <span className="text-foreground truncate block">{reg.dog?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Breed</span>
                      <span className="text-foreground truncate block">{reg.dog?.breed?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Class</span>
                      <span className="text-primary truncate block">{reg.category?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col gap-3 shrink-0 w-full lg:w-48">
                  {isConfirmed && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`${config.apiUrl}/registrations/${reg.id}/receipt`, '_blank')}
                        className="flex-1 lg:flex-none border-border hover:bg-accent text-foreground text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Receipt className="w-4 h-4" /> Download Receipt
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`${config.apiUrl}/registrations/${reg.id}/certificate`, '_blank')}
                        className="flex-1 lg:flex-none border-border hover:bg-accent text-foreground text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-4 h-4" /> Certificate
                      </Button>
                    </>
                  )}

                  {!isCancelled && !isConfirmed && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleCancelRegistration(reg.id)}
                      className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Cancel Request
                    </Button>
                  )}
                  {isConfirmed && (
                    <Button 
                      onClick={() => window.open(`${config.apiUrl}/registrations/${reg.id}/pass`, '_blank')}
                      className="flex-1 lg:flex-none bg-[#38BDF8] hover:bg-blue-500 text-foreground font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" /> View Digital Pass
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
