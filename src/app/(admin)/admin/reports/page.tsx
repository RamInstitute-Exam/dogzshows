'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';
import api from '@/services/api';

export default function ReportsDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/reports`);
      const data = res;
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/reports/generate`);
      
      if (res.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" /> Platform Reports
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Generate and download financial, registration, and system reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-900/40 to-[#111827] border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <IndianRupeeIcon className="w-24 h-24 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Financial Report</h3>
              <p className="text-muted-foreground text-sm mb-6 relative z-10">Generate a comprehensive PDF breakdown of all settled payments and pending refunds.</p>
              <Button onClick={() => generateReport('FINANCIAL')} disabled={generating} className="w-full bg-blue-600 hover:bg-blue-700 text-foreground font-bold relative z-10">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Generate Report
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-purple-900/40 to-[#111827] border border-purple-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <UsersIcon className="w-24 h-24 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Registration Export</h3>
              <p className="text-muted-foreground text-sm mb-6 relative z-10">Export a complete CSV list of all active event registrations and dog entries.</p>
              <Button onClick={() => generateReport('REGISTRATION')} disabled={generating} className="w-full bg-purple-600 hover:bg-purple-700 text-foreground font-bold relative z-10">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Export CSV
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-brand-orange/20 to-[#111827] border border-brand-orange/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DogIcon className="w-24 h-24 text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">KCI Directory</h3>
              <p className="text-muted-foreground text-sm mb-6 relative z-10">Extract a full list of all verified dogs and their KCI / Microchip mappings.</p>
              <Button onClick={() => generateReport('KCI_DIRECTORY')} disabled={generating} className="w-full bg-brand-orange hover:bg-orange-600 text-foreground font-bold relative z-10">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Generate Directory
              </Button>
            </motion.div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden mt-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-card">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><ClockIcon className="w-5 h-5 text-muted-foreground"/> Generated Reports Archive</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500  mb-4" />
                        <p className="text-muted-foreground">Loading archives...</p>
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td className="py-12 text-center">
                        <FileText className="w-12 h-12 text-[#1E293B]  mb-4" />
                        <p className="text-muted-foreground font-medium">No reports have been generated yet.</p>
                      </td>
                    </tr>
                  ) : (
                    reports.map((r, i) => (
                      <motion.tr 
                        key={r.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6 w-12">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground group-hover:text-blue-400 transition-colors">{r.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Generated {new Date(r.createdAt).toLocaleString()} by {r.generatedBy}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold">
                              <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                          </a>
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

// Icon Helpers to avoid cluttering imports
const IndianRupeeIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3c2.24 0 4-1.56 4-3.5C13 7.56 11.24 6 9 6H6"/></svg>
const UsersIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const DogIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.7.28 1.53.51 2.5a2.5 2.5 0 0 0 2.45 2.05h1A2.5 2.5 0 0 0 8.91 12.5L10 8V5.172Z"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.7-.28 1.53-.51 2.5a2.5 2.5 0 0 1-2.45 2.05h-1a2.5 2.5 0 0 1-2.45-2.05L14 8V5.172Z"/><path d="M10 16.5a2.5 2.5 0 1 0 4 0"/></svg>
const ClockIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
