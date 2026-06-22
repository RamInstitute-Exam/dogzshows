'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function PaymentManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        setData(res.data.payments || res.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || res.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Transaction ID', accessor: 'transactionId', className: 'font-bold text-foreground' },
    { header: 'Amount', accessor: (p) => `₹${p.amount}` },
    { header: 'Payment Method', accessor: 'method' },
    { header: 'Date', accessor: (p) => new Date(p.createdAt).toLocaleDateString() },
    { header: 'Status', accessor: (p) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : p.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {p.status || 'PENDING'}
      </span>
    ) }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Payment & Transactions"
        description="Monitor all platform revenue, refunds, and Razorpay transactions."
        icon={CreditCard}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchPayments}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
