'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, ChevronRight, Eye } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminKciVerification() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [selectedCert, setSelectedCert] = useState<any>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/certificates/admin?page=${page}&limit=10`);
      if (res.success) {
        setData(res.data);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED', kciNumber?: string) => {
    try {
      const res = await api.put(`/certificates/admin/${id}/verify`, { status, kciNumber });
      if (res.success) {
        toast.success(`Certificate ${status.toLowerCase()}`);
        setSelectedCert(null);
        fetchCertificates();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Failed to verify certificate');
    }
  };

  const columns: ColumnDefinition<any>[] = [
    { 
      header: 'Dog', 
      accessor: (cert) => (
        <div>
          <p className="font-bold text-foreground">{cert.dog?.name}</p>
          <p className="text-xs text-muted-foreground">{cert.dog?.breed?.name}</p>
        </div>
      ) 
    },
    { 
      header: 'Owner', 
      accessor: (cert) => cert.dog?.ownerUser ? `${cert.dog.ownerUser.firstName} ${cert.dog.ownerUser.lastName}` : 'N/A' 
    },
    { 
      header: 'OCR Confidence', 
      accessor: (cert) => cert.ocrConfidence ? `${cert.ocrConfidence}%` : 'N/A' 
    },
    { 
      header: 'Status', 
      accessor: (cert) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          cert.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 
          cert.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 
          'bg-yellow-500/10 text-yellow-500'
        }`}>
          {cert.status}
        </span>
      ) 
    },
    { 
      header: 'Actions', 
      accessor: (cert) => (
        <Button onClick={() => setSelectedCert(cert)} variant="outline" size="sm" className="h-8 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white">
          <Eye className="w-4 h-4 mr-2" /> Review
        </Button>
      ) 
    }
  ];

  return (
    <div className="w-full">
      {selectedCert ? (
        <div className="bg-card rounded-2xl border border-border shadow-xl  animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Review Certificate</h2>
              <p className="text-muted-foreground text-sm mt-1">Verify OCR extracted details against the original document.</p>
            </div>
            <Button onClick={() => setSelectedCert(null)} variant="outline">Back to Queue</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 ga">
            <div className="border border-border rounded-xl overflow-hidden bg-accent flex items-center justify-center p-4">
              <img src={selectedCert.url} alt="Certificate" className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-input rounded-xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Dog Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground">Dog Name</span>
                    <span className="font-semibold text-foreground">{selectedCert.dog?.name}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Breed</span>
                    <span className="font-semibold text-foreground">{selectedCert.dog?.breed?.name}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Gender</span>
                    <span className="font-semibold text-foreground">{selectedCert.dog?.gender}</span>
                  </div>
                </div>
              </div>

              <div className="bg-input rounded-xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">OCR Extraction</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground mb-1">OCR Confidence</span>
                    <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border">
                      <div className="bg-brand-orange h-full" style={{ width: `${selectedCert.ocrConfidence || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">{selectedCert.ocrConfidence || 0}% Match</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground mb-1">Extracted KCI Number</span>
                    <input 
                      type="text" 
                      defaultValue={selectedCert.dog?.kciNumber || selectedCert.extractedData?.kciNumber || ''} 
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground font-mono"
                      id="kci-input"
                    />
                  </div>
                </div>
              </div>

              {selectedCert.status === 'PENDING' && (
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button 
                    onClick={() => handleVerify(selectedCert.id, 'APPROVED', (document.getElementById('kci-input') as HTMLInputElement)?.value)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & Update
                  </Button>
                  <Button 
                    onClick={() => handleVerify(selectedCert.id, 'REJECTED')}
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
                  >
                    <XCircle className="w-5 h-5 mr-2" /> Reject
                  </Button>
                </div>
              )}

              {selectedCert.status !== 'PENDING' && (
                <div className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 ${selectedCert.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {selectedCert.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  This certificate has been {selectedCert.status.toLowerCase()}.
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        <AdminDataTable
          title="KCI Verification Queue"
          description="Review uploaded KCI certificates and verify extracted OCR data."
          icon={FileText}
          data={data}
          columns={columns}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          search={search}
          onSearchChange={setSearch}
          onRefresh={fetchCertificates}
          onPageChange={setPage}
          keyExtractor={(item) => item.id}
        />
      )}
    </div>
  );
}
