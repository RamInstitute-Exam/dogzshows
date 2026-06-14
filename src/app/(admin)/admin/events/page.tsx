'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Search, Filter, Download, Plus, RefreshCw, Edit, Trash2, MoreVertical, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Link from 'next/link';

import { EventService } from '@/services/event.service';

export default function EventsListing() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await EventService.getAdminEvents({ page, limit: 10, search: debouncedSearch });
      if (data.success) {
        setEvents(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, debouncedSearch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(events.map(ev => ev.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete selected events?')) return;
    try {
      await EventService.bulkDeleteEvents({ ids: selectedIds });
      setSelectedIds([]);
      fetchEvents();
    } catch (error) {
      console.error('Failed to bulk delete');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-brand-orange" /> Show Management
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Total {totalCount} events listed on the platform.</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search event name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder-[#7C8798] focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
              <Button variant="outline" onClick={fetchEvents} className="border-border text-foreground hover:bg-accent">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link href="/admin/events/create">
                <Button className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
              </Link>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-xl">
              <p className="text-brand-orange font-bold">{selectedIds.length} events selected</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-foreground border-0">Delete Selected</Button>
              </div>
            </motion.div>
          )}

          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="py-4 px-6 w-12">
                      <input type="checkbox" onChange={handleSelectAll} checked={events.length > 0 && selectedIds.length === events.length} className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" />
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Details</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Host Club</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Schedule</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading events...</p>
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <CalendarDays className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No events scheduled.</p>
                      </td>
                    </tr>
                  ) : (
                    events.map((ev, i) => (
                      <motion.tr 
                        key={ev.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(ev.id)}
                            onChange={() => handleSelectOne(ev.id)}
                            className="rounded bg-accent border-border text-brand-orange focus:ring-brand-orange" 
                          />
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground group-hover:text-brand-orange transition-colors">{ev.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" /> {ev.venue || 'TBA'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="w-4 h-4 text-muted-foreground" /> {ev.club?.name || 'JuzDog Platform'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-muted-foreground">{new Date(ev.startDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">To {new Date(ev.endDate).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent border border-border text-[10px] font-bold uppercase tracking-wider ${ev.status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/events/edit/${ev.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-card">
                <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 border-border text-foreground hover:bg-accent">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 border-border text-foreground hover:bg-accent">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
