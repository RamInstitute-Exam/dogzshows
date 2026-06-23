'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Filter, 
  MapPin, Trophy, Users, Clock, Plus, X, Edit, Trash2, ExternalLink, 
  Loader2, CheckCircle2, AlertTriangle, Play, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';
import { formatTitle } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer & Modal States
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch events & clubs
  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        api.get('/events?limit=1000'),
        api.get('/public/clubs?limit=1000')
      ]);
      
      if (eventsRes?.success) {
        setEvents(eventsRes.data.events || eventsRes.data || []);
      }
      if (clubsRes?.success) {
        setClubs(clubsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      toast.error('Failed to load shows calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(search.toLowerCase()) || 
                          event.venue?.toLowerCase().includes(search.toLowerCase()) ||
                          event.club?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesClub = !selectedClub || event.clubId === selectedClub;
    const matchesState = !selectedState || event.state === selectedState;
    const matchesStatus = !selectedStatus || event.status === selectedStatus;
    
    return matchesSearch && matchesClub && matchesState && matchesStatus;
  });

  // Unique states from events list for filter dropdown
  const statesList = Array.from(new Set(events.map(e => e.state).filter(Boolean))) as string[];

  // Helper date functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Previous month empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const currentDayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Status Styling Map
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'ONGOING':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  // Action: Delete Show
  const handleDeleteShow = async () => {
    if (!selectedEvent) return;
    try {
      const res = await api.delete(`/events/${selectedEvent.id}`);
      if (res.success) {
        toast.success('Dog show deleted successfully');
        setDrawerOpen(false);
        setDeleteConfirmOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete show');
    }
  };

  // Navigations
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-md">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-foreground" /> Shows Calendar
              </h1>
              <p className="text-muted-foreground mt-1">Schedule, reschedule, and manage national dog shows.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link href="/admin/events/create">
                <Button className="bg-[#111827] hover:bg-black text-white font-bold shadow-md rounded-xl px-5 h-[46px] dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6]">
                  <Plus className="w-5 h-5 mr-2" /> Add Show
                </Button>
              </Link>
              
              <div className="flex bg-accent/40 rounded-xl p-1 border border-border">
                {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                      view === v 
                        ? 'bg-foreground text-foreground shadow-md font-extrabold' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Show, Venue, Club..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:border-border outline-none text-sm"
              />
            </div>
            
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl focus:border-border outline-none text-sm text-foreground max-w-xs"
            >
              <option value="">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl focus:border-border outline-none text-sm text-foreground"
            >
              <option value="">All States</option>
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl focus:border-border outline-none text-sm text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Calendar Controller & Title */}
          <div className="flex justify-between items-center bg-card px-6 py-4 rounded-xl border border-border">
            <h2 className="text-xl font-bold capitalize text-foreground">
              {view === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              {view === 'week' && `Week of ${getDaysInWeek(currentDate)[0].toLocaleDateString('default', { day: 'numeric', month: 'short' })}`}
              {view === 'day' && currentDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {view === 'agenda' && 'Upcoming Dog Shows Agenda'}
            </h2>
            <div className="flex gap-2">
              <Button onClick={handlePrev} variant="outline" size="icon" className="border-border text-foreground hover:bg-accent h-10 w-10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={() => setCurrentDate(new Date())} variant="outline" className="border-border text-foreground hover:bg-accent font-bold px-4 h-10">
                Today
              </Button>
              <Button onClick={handleNext} variant="outline" size="icon" className="border-border text-foreground hover:bg-accent h-10 w-10">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Body */}
          {loading ? (
            <div className="flex justify-center items-center py-40 bg-card rounded-2xl border border-border min-h-[500px]">
              <Loader2 className="w-12 h-12 animate-spin text-foreground" />
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden min-h-[550px]">
              
              {/* MONTH VIEW */}
              {view === 'month' && (
                <div className="grid grid-cols-7 border-b border-border bg-accent/20">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0">
                      {d}
                    </div>
                  ))}
                </div>
              )}
              {view === 'month' && (
                <div className="grid grid-cols-7 grid-rows-5 bg-background">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayEvents = day ? filteredEvents.filter(e => isSameDay(new Date(e.startDate), day)) : [];
                    const isTodayDay = day && isSameDay(new Date(), day);
                    const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

                    return (
                      <div 
                        key={day ? day.toISOString() : `empty-${index}`} 
                        className={`min-h-[120px] p-2 border-b border-r border-border last:border-r-0 flex flex-col ${
                          !isCurrentMonth ? 'bg-accent/5' : 'bg-card'
                        }`}
                      >
                        {day && (
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-extrabold flex items-center justify-center w-7 h-7 rounded-full ${
                              isTodayDay 
                                ? 'bg-foreground text-foreground font-black' 
                                : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
                            }`}>
                              {day.getDate()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[85px] scrollbar-thin">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setDrawerOpen(true);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold truncate cursor-pointer transition-all hover:scale-[1.02] border-l-4 ${
                                event.status === 'REGISTRATION_OPEN' ? 'bg-green-500/10 text-green-500 border-green-500' :
                                event.status === 'ONGOING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' :
                                event.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500 border-blue-500' :
                                event.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500' :
                                'bg-gray-500/10 text-gray-400 border-gray-500'
                              }`}
                            >
                              <div className="font-extrabold truncate">{formatTitle(event.name)}</div>
                              <div className="text-[10px] opacity-75 font-semibold">{event.city || 'Online'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* WEEK VIEW */}
              {view === 'week' && (
                <div className="grid grid-cols-7 divide-x divide-border">
                  {getDaysInWeek(currentDate).map((day) => {
                    const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.startDate), day));
                    const isTodayDay = isSameDay(new Date(), day);
                    return (
                      <div key={day.toISOString()} className="min-h-[500px] bg-card p-4 flex flex-col">
                        <div className="text-center pb-4 border-b border-border mb-4">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">{day.toLocaleString('default', { weekday: 'short' })}</span>
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-black mt-1 ${
                            isTodayDay ? 'bg-foreground text-foreground' : 'text-foreground'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setDrawerOpen(true);
                              }}
                              className={`p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 border ${getStatusStyle(event.status)}`}
                            >
                              <h4 className="font-black text-sm text-foreground line-clamp-2">{formatTitle(event.name)}</h4>
                              <p className="text-xs text-muted-foreground mt-1 font-semibold">{event.club?.name}</p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                                <MapPin className="w-3.5 h-3.5 text-foreground" />
                                <span>{event.city || 'TBA'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DAY VIEW */}
              {view === 'day' && (
                <div className="p-6 space-y-4">
                  {filteredEvents.filter(e => isSameDay(new Date(e.startDate), currentDate)).length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground font-semibold">No shows scheduled for this date.</div>
                  ) : (
                    filteredEvents.filter(e => isSameDay(new Date(e.startDate), currentDate)).map(event => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDrawerOpen(true);
                        }}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-accent/10 hover:bg-accent/20 rounded-2xl border border-border cursor-pointer transition-all"
                      >
                        <div className="space-y-2">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getStatusStyle(event.status)}`}>
                            {event.status}
                          </span>
                          <h3 className="text-xl font-extrabold text-foreground">{formatTitle(event.name)}</h3>
                          <p className="text-sm text-muted-foreground font-bold">{event.club?.name}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-foreground" /> {event.venue}, {event.city}, {event.state}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-foreground" /> {event.startTime || '09:00 AM'} - {event.endTime || '06:00 PM'}</span>
                          </div>
                        </div>
                        <Button className="mt-4 sm:mt-0 bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] font-bold">Details</Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* AGENDA VIEW */}
              {view === 'agenda' && (
                <div className="divide-y divide-border">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground font-semibold">No upcoming events found.</div>
                  ) : (
                    filteredEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDrawerOpen(true);
                        }}
                        className="flex items-start gap-6 p-6 hover:bg-accent/10 transition-colors cursor-pointer"
                      >
                        <div className="bg-accent rounded-xl p-3 text-center min-w-[80px]">
                          <span className="block text-foreground font-black text-2xl leading-none">{new Date(event.startDate).getDate()}</span>
                          <span className="block text-muted-foreground font-bold text-xs uppercase mt-1">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusStyle(event.status)}`}>
                            {event.status}
                          </span>
                          <h3 className="text-lg font-black text-foreground">{formatTitle(event.name)}</h3>
                          <p className="text-sm text-muted-foreground font-semibold">{event.club?.name}</p>
                          <p className="text-sm text-muted-foreground/80 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-foreground" /> {event.city}, {event.state}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}

      {/* DETAIL DRAWER */}
      <AnimatePresence>
        {drawerOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-card w-full max-w-lg border-l border-border h-full overflow-y-auto flex flex-col text-foreground shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground">Event Details</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-accent rounded-xl">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Show Banner */}
              <div className="h-48 bg-accent relative overflow-hidden shrink-0">
                <img 
                  src={selectedEvent.bannerUrl || '/images/events_banner.png'} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getStatusStyle(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                  <h4 className="text-2xl font-black text-white mt-2 line-clamp-1">{formatTitle(selectedEvent.name)}</h4>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Organizing Club</h5>
                    <p className="text-base font-bold text-foreground mt-1">{selectedEvent.club?.name || 'TBA'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Date</h5>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Timings</h5>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {selectedEvent.startTime || '09:00 AM'} - {selectedEvent.endTime || '06:00 PM'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Venue</h5>
                    <p className="text-sm font-bold text-foreground mt-1 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                      <span>{selectedEvent.venue}, {selectedEvent.city}, {selectedEvent.state}, {selectedEvent.country}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Entry Fee</h5>
                      <p className="text-sm font-extrabold text-foreground mt-1">₹{selectedEvent.entryFee || 0}</p>
                    </div>
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Capacity</h5>
                      <p className="text-sm font-bold text-foreground mt-1">{selectedEvent.capacity || 'Unlimited'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Registration Closing Date</h5>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {selectedEvent.registrationWindowEnd ? new Date(selectedEvent.registrationWindowEnd).toLocaleDateString() : 'TBA'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Judges</h5>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {selectedEvent.judges && selectedEvent.judges.length > 0 
                          ? selectedEvent.judges.map((j: any) => j.name).join(', ') 
                          : selectedEvent.chiefJudge || 'TBA'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Club Secretary & Contact Details</h5>
                    {selectedEvent.secretaries && selectedEvent.secretaries.length > 0 ? (
                      <div className="space-y-3 mt-1.5">
                        {selectedEvent.secretaries.map((sec: any, idx: number) => (
                          <div key={sec.id || idx} className="p-3 bg-accent/40 rounded-xl border border-border space-y-1 text-xs">
                            <p className="font-bold text-foreground">{sec.name} <span className="text-[10px] text-foreground uppercase bg-foreground/10 px-1.5 py-0.5 rounded font-black">{sec.designation || 'Secretary'}</span></p>
                            <p className="text-muted-foreground">📞 {sec.mobile} {sec.alternateMobile ? `/ ${sec.alternateMobile}` : ''}</p>
                            <p className="text-muted-foreground">✉ {sec.email}</p>
                            {sec.address && <p className="text-muted-foreground italic mt-1 whitespace-pre-line">{sec.address}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-accent/40 rounded-xl border border-border space-y-1 text-xs mt-1.5">
                        <p className="font-bold text-foreground">{selectedEvent.contactPerson || 'Club Office'}</p>
                        {selectedEvent.mobile && <p className="text-muted-foreground">📞 {selectedEvent.mobile}</p>}
                        {selectedEvent.email && <p className="text-muted-foreground">✉ {selectedEvent.email}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Categories</h5>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedEvent.categories?.length > 0 ? (
                        selectedEvent.categories.map((c: any) => (
                          <span key={c.id} className="text-xs font-bold bg-accent/60 px-2.5 py-1 rounded-lg border border-border">{c.name}</span>
                        ))
                      ) : (
                        <span className="text-xs font-bold bg-accent/60 px-2.5 py-1 rounded-lg border border-border">Open Class</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Description</h5>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedEvent.description || 'No description provided.'}</p>
                  </div>

                  {selectedEvent.rules && (
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-muted-foreground">Rules & Regulations</h5>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedEvent.rules}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-border flex gap-3 bg-accent/10 shrink-0">
                <Link href={`/admin/events/edit?id=${selectedEvent.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent font-bold h-12 rounded-xl">
                    <Edit className="w-4 h-4 mr-2" /> Edit Show
                  </Button>
                </Link>
                <Button 
                  onClick={() => setDeleteConfirmOpen(true)} 
                  variant="destructive" 
                  className="flex-1 font-bold h-12 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
                <Link href={`/events/detail?slug=${selectedEvent.slug}`} target="_blank" className="flex-1">
                  <Button className="w-full bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] font-bold h-12 rounded-xl">
                    <ExternalLink className="w-4 h-4 mr-2" /> Website
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card max-w-md w-full rounded-2xl border border-border shadow-2xl p-6"
            >
              <h3 className="text-lg font-black text-foreground">Confirm Deletion</h3>
              <p className="text-sm text-muted-foreground mt-2">Are you sure you want to delete the show event "{formatTitle(selectedEvent?.name)}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)} className="hover:bg-accent text-foreground">Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteShow} className="font-bold">Delete Show</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
