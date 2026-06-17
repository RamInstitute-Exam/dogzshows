'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api';

export default function KCIVerificationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates');
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Verified</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Rejected</span>;
      default: return <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">KCI Verification Status</h1>
          <p className="text-muted-foreground text-sm mt-1">Track the verification status of your uploaded KCI certificates.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-brand-orange outline-none text-foreground" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Filter className="w-4 h-4" /></Button>
          <Link href="/dashboard/dogs/create">
            <Button className="bg-brand-orange hover:bg-orange-600 rounded-xl font-bold shadow-md text-foreground">Upload New</Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 space-y-4">
             {[1,2,3].map(i => <div key={i} className="w-full h-16 bg-accent animate-pulse rounded-lg" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Certificates Uploaded</h2>
            <p className="text-muted-foreground max-w-sm mb-6">You haven't uploaded any KCI certificates yet. Register a new dog and upload the certificate to begin verification.</p>
            <Link href="/dashboard/dogs/create">
              <Button className="bg-brand-orange text-foreground font-bold hover:bg-orange-600 rounded-xl">Register Dog</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">Document</th>
                  <th className="p-4 font-semibold">Dog Info</th>
                  <th className="p-4 font-semibold">Extracted Data</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Submitted On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)] text-sm">
                {data.map((cert) => (
                  <tr key={cert.id} className="hover:bg-accent transition-colors">
                    <td className="p-4">
                      <a href={cert.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center overflow-hidden border border-border group-hover:border-brand-orange transition-colors">
                          <img src={cert.url} alt="Certificate" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" onError={(e) => { e.currentTarget.style.display='none' }} />
                          <FileText className="w-5 h-5 text-muted-foreground absolute -z-10" />
                        </div>
                        <span className="text-brand-orange font-bold text-xs hover:underline">View File</span>
                      </a>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-foreground">{cert.dog?.name || 'Unknown Dog'}</p>
                      <p className="text-xs text-muted-foreground">{cert.dog?.breed?.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-muted-foreground font-mono bg-input px-2 py-1 rounded inline-block">
                        {cert.ocrConfidence ? `Confidence: ${cert.ocrConfidence}%` : 'Pending OCR'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cert.status)}
                        {getStatusBadge(cert.status)}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(cert.createdAt).toLocaleDateString()}
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
