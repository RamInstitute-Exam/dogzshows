'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function EventManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        setData(res.data.events || res.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || res.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Event Title', accessor: 'title', className: 'font-bold text-foreground' },
    { header: 'Location', accessor: 'location' },
    { header: 'Start Date', accessor: (e) => new Date(e.startDate).toLocaleDateString() },
    { header: 'Capacity', accessor: (e) => `${e.registrationsCount || 0} / ${e.capacity || 'Unlimited'}` }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Event Management"
        description="Manage dog shows, competitions, and view event registrations."
        icon={Calendar}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchEvents}
        onPageChange={setPage}
        createLink="/admin/events/create"
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
