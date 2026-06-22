'use client';

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function CMSManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cms-pages?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        setData(res.data.pages || res.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || res.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch CMS pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Page Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Author', accessor: (p) => p.author?.firstName || 'System' },
    { header: 'Status', accessor: (p) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {p.status || 'DRAFT'}
      </span>
    ) }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="CMS Pages"
        description="Manage dynamic content pages like About, FAQ, Privacy Policy, and Terms."
        icon={FileText}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchPages}
        onPageChange={setPage}
        createLink="/admin/cms/create"
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
