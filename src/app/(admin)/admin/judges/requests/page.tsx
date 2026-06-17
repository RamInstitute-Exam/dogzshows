'use client';

import React, { useState, useEffect } from 'react';
import { Mailbox, X, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import { Button } from '@/components/ui/button';
import { useJudgeRequests } from '@/hooks/useJudges';
import { toast } from 'sonner';
import api from '@/services/api';

export default function JudgeRequestsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const {
    requests,
    total,
    loading,
    fetchRequests,
    updateRequest,
    deleteRequest
  } = useJudgeRequests();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests({ page, limit: 10, search });
  }, [page, search, fetchRequests]);

  const handleStatusUpdate = async (status: string) => {
    setIsSubmitting(true);
    const success = await updateRequest(formData.id, { status });
    setIsSubmitting(false);
    
    if (success) {
      setIsModalOpen(false);
      fetchRequests({ page, limit: 10, search });
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete the request from "${item.name}"?`)) return;
    const success = await deleteRequest(item.id);
    if (success) {
      fetchRequests({ page, limit: 10, search });
    }
  };

  const openView = (item: any) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const columns: ColumnDefinition<any>[] = [
    { header: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
    { header: 'Name', accessor: 'name', className: 'font-bold text-foreground' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Status',
      accessor: (r) => {
        let colors = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        if (r.status === 'APPROVED') colors = 'bg-green-500/10 text-green-500 border border-green-500/20';
        if (r.status === 'REJECTED') colors = 'bg-red-500/10 text-red-500 border border-red-500/20';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors}`}>
            {r.status || 'PENDING'}
          </span>
        );
      }
    }
  ];

  return (
    <div className=" space-y-4 relative">
      <AdminDataTable
        title="Judge Requests"
        description="Review and manage judge onboarding requests."
        icon={Mailbox}
        data={requests}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={Math.ceil(total / 10) || 1}
        totalCount={total}
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => fetchRequests({ page, limit: 10, search })}
        onPageChange={setPage}
        onEdit={openView}
        onDelete={handleDelete}
        keyExtractor={(item) => item.id}
      />

      {/* Modal View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-2xl p-6 border border-border shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">Review Judge Request</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Name</label>
                    <div className="font-medium text-foreground">{formData.name}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Email</label>
                    <div className="font-medium text-foreground">{formData.email}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone</label>
                    <div className="font-medium text-foreground">{formData.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Date Submitted</label>
                    <div className="font-medium text-foreground">{new Date(formData.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Message</label>
                    <div className="p-3 bg-muted/50 rounded-lg whitespace-pre-wrap">{formData.message || 'No additional message provided.'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Current Status</label>
                    <span className="font-bold">{formData.status}</span>
                  </div>
                </div>
                
                {formData.status === 'PENDING' && (
                  <div className="pt-6 grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleStatusUpdate('APPROVED')} 
                      disabled={isSubmitting} 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate('REJECTED')} 
                      disabled={isSubmitting} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
