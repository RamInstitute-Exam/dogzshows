'use client';

import React, { useState, useEffect } from 'react';
import { Dog } from 'lucide-react';
import { AdminDataTable, ColumnDefinition } from '@/components/shared/AdminDataTable';
import api from '@/lib/api';

export default function DogManagement() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dogs?page=${page}&search=${search}&limit=10`);
      if (res.success) {
        setData(res.data.dogs || res.data); // Adjust based on pagination response structure
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || res.data.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [page, search]);

  const columns: ColumnDefinition<any>[] = [
    { header: 'Dog Name', accessor: 'dogName', className: 'font-bold text-foreground' },
    { header: 'Registration No.', accessor: 'registrationNumber' },
    { header: 'Breed', accessor: (dog) => dog.breed?.name || 'N/A' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Status', accessor: (dog) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${dog.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {dog.status || 'PENDING'}
      </span>
    ) }
  ];

  return (
    <div className="w-full">
      <AdminDataTable
        title="Dog Management"
        description="Manage registered dogs, approve pending registrations, and view details."
        icon={Dog}
        data={data}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onRefresh={fetchDogs}
        onPageChange={setPage}
        createLink="/admin/dogs/create"
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
