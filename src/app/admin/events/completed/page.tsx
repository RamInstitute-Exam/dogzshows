'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function CompletedEvents() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/shows/completed?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        const eventsList = res.data.events || res.data || [];
        setData(eventsList);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || eventsList.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch completed events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Event Title', accessor: 'name', className: 'font-bold text-foreground' },
    { header: 'Venue / Location', accessor: (e) => `${e.venue}, ${e.city}, ${e.state}` },
    { header: 'End Date', accessor: (e) => new Date(e.endDate).toLocaleDateString() },
    { header: 'Status', accessor: (e) => (
      <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
        COMPLETED
      </span>
    ) }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Completed Events"
        description="Dog shows that have successfully ended. Access historical data and results."
        icon={CalendarDays}
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
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
