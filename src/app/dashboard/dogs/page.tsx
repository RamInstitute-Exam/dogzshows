'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye, Dog, Copy, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { determineAgeClass } from '@/lib/age-calculator';
import { config } from '@/lib/config';

interface DogRecord {
  id: string;
  name: string;
  kciNumber: string;
  breed: { name: string } | null;
  gender: string;
  dob: string | null;
  isChampion: boolean;
  createdAt: string;
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<DogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchDogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/dogs?page=${page}&limit=10&search=${debouncedSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDogs(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to load dogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [page, debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dog?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/dog-details?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Dog deleted successfully');
        fetchDogs();
      }
    } catch (error) {
      toast.error('Failed to delete dog');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dogs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, filter, and export dog records. ({totalRecords} total)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search dogs by name or KCI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none text-foreground" 
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Filter className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
          <Link href="/dashboard/dogs/create">
            <Button className="bg-foreground hover:bg-foreground rounded-xl font-bold shadow-md text-foreground">
              <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add Dog</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-16 bg-accent animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
                    <th className="p-4 font-semibold">Dog Info</th>
                    <th className="p-4 font-semibold">Breed</th>
                    <th className="p-4 font-semibold">Age Class</th>
                    <th className="p-4 font-semibold">Gender</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)] text-sm">
                  {dogs.map(dog => (
                    <tr key={dog.id} className="hover:bg-accent transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                            <Dog className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-2">
                              {dog.name} 
                              {dog.isChampion && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">CH</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">KCI: {dog.kciNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{dog.breed?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-accent rounded-lg text-xs font-semibold text-foreground">
                          {determineAgeClass(dog.dob)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground capitalize">{dog.gender.toLowerCase()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/dog-details?id=${dog.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dog.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-muted-foreground">
                        <Dog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No dogs found. Click Add Dog to create one.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1"/> Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1"/>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
