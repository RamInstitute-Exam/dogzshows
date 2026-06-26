'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarDays, Award, User, RefreshCw, Trophy, Dog, X, Eye } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function DogsEntriesClient({ initialBannerData }: { initialBannerData?: any }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal details
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = `/public/entries?page=${page}&limit=12&search=${search}`;
      if (breedFilter) url += `&breed=${breedFilter}`;
      if (eventFilter) url += `&dogShowId=${eventFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (genderFilter) url += `&gender=${genderFilter}`;

      const res = await api.get(url);
      if (res.success) {
        setEntries(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load approved dog entries catalog', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersMetadata = async () => {
    try {
      const eventsRes = await api.get('/public/shows?limit=1000');
      if (eventsRes?.success) setEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Failed to load filters metadata', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, search, breedFilter, eventFilter, categoryFilter, genderFilter]);

  useEffect(() => {
    fetchFiltersMetadata();
  }, []);

  // Compute unique breeds dynamically from loaded entries for simple filtering
  const uniqueBreeds = Array.from(new Set(entries.map(e => e.breed).filter(Boolean)));

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="entries/dogs"
        fallbackTitle="APPROVED DOG ENTRIES"
        fallbackSubtitle="Browse verified canine registrations and classes active in current championships."
        fallbackImage="/images/competitions_banner.png"
        initialBannerData={initialBannerData}
      />

      {/* Filters & Search */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 mt-12">
        <div className="bg-card rounded-[24px] p-5 shadow-sm border border-border flex flex-wrap gap-4 items-center">
          
          {/* Search */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Dog Name, Owner, Reg #..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-border focus:ring-2 focus:ring-foreground/20 outline-none transition-all font-medium text-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Show Filter */}
            <select
              value={eventFilter}
              onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-border"
            >
              <option value="">All Shows</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>

            {/* Breed Filter */}
            <select
              value={breedFilter}
              onChange={(e) => { setBreedFilter(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-border"
            >
              <option value="">All Breeds</option>
              {uniqueBreeds.map((breed, i) => <option key={i} value={breed}>{breed}</option>)}
              <option value="Golden Retriever">Golden Retriever</option>
              <option value="German Shepherd">German Shepherd</option>
              <option value="Labrador Retriever">Labrador Retriever</option>
              <option value="Rottweiler">Rottweiler</option>
              <option value="Pug">Pug</option>
            </select>

            {/* Class Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-border"
            >
              <option value="">All Classes</option>
              <option value="Puppy">Puppy</option>
              <option value="Junior">Junior</option>
              <option value="Open Class">Open Class</option>
              <option value="Champion">Champion</option>
              <option value="Veteran">Veteran</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              className="px-4 py-3.5 bg-background border border-border rounded-xl font-semibold text-muted-foreground text-sm outline-none focus:border-border"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="flex gap-3 ml-auto">
            <Button 
              onClick={() => {
                setSearch('');
                setBreedFilter('');
                setEventFilter('');
                setCategoryFilter('');
                setGenderFilter('');
                setPage(1);
              }}
              variant="outline"
              className="h-[52px] px-6 rounded-xl border-border text-muted-foreground font-bold hover:bg-card"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Dog className="w-8 h-8 text-foreground" /> Verified Dog Listings
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">Browse dynamic live catalog records. Total: {totalCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border h-[350px] animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-24 font-bold text-lg">
            No approved entries found matching the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -6 }}
                className="bg-card rounded-[24px] overflow-hidden shadow-lg border border-border flex flex-col group relative text-foreground"
              >
                {/* Photo container */}
                <div className="h-[200px] relative overflow-hidden bg-accent">
                  <OptimizedImage 
                    src={entry.dogPhoto || '/images/hero_banner.png'} 
                    alt={entry.dogName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Class Badge */}
                  <span className="absolute bottom-4 left-4 bg-foreground text-foreground font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    {entry.category}
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-foreground transition-colors">{entry.dogName}</h3>
                    
                    <div className="flex gap-2 text-xs">
                      <span className="bg-accent px-2 py-0.5 rounded font-bold text-muted-foreground">{entry.breed}</span>
                      <span className="bg-accent px-2 py-0.5 rounded font-bold text-muted-foreground uppercase">{entry.gender}</span>
                    </div>

                    <div className="pt-2.5 border-t border-border space-y-2 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-foreground" />
                        <span className="truncate">Owner: {entry.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-foreground" />
                        <span className="truncate">{entry.event?.name || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => { setSelectedEntry(entry); setIsViewModalOpen(true); }}
                    className="mt-5 w-full bg-accent/20 hover:bg-foreground text-foreground rounded-xl h-10 shadow-sm border border-border group-hover:border-transparent font-bold flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-border text-foreground hover:bg-card"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-muted-foreground px-4">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-border text-foreground hover:bg-card"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* VIEW MODAL DETAILS */}
      <AnimatePresence>
        {isViewModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-card max-w-2xl w-full rounded-[24px] border border-border shadow-2xl overflow-hidden flex flex-col text-foreground"
            >
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-accent/10">
                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <Award className="w-6 h-6 text-foreground" /> Show Entry Profile
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                {selectedEntry.dogPhoto && (
                  <div className="w-full h-52 rounded-2xl bg-accent overflow-hidden relative border border-border">
                    <OptimizedImage src={selectedEntry.dogPhoto} alt="Dog Photo" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Dog Name</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.dogName}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Registration ID / KCI #</span>
                    <span className="text-sm font-mono text-foreground font-bold">{selectedEntry.registrationNumber || 'None'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Breed & Gender</span>
                    <span className="text-sm font-bold text-foreground">{selectedEntry.breed} ({selectedEntry.gender})</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Age & Color</span>
                    <span className="text-sm font-semibold text-foreground">{selectedEntry.age || '—'} / {selectedEntry.color || '—'}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Owner Name</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><User className="w-4 h-4 text-blue-500" /> {selectedEntry.ownerName}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Handler Name</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5">{selectedEntry.handler || 'Self / Owner'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Registered Dog Show</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5"><Trophy className="w-4 h-4 text-foreground" /> {selectedEntry.event?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Show Class / Category</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{selectedEntry.category}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Chief Show Judge</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{selectedEntry.judgeName || 'TBA'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground">Registration Date</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5">{new Date(selectedEntry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedEntry.description && (
                  <div className="border-t border-border pt-4">
                    <span className="block text-xs uppercase font-extrabold text-muted-foreground mb-1">Description / Notes</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-accent/20 p-3.5 rounded-xl leading-relaxed">{selectedEntry.description}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-accent/10 flex justify-end shrink-0">
                <Button onClick={() => setIsViewModalOpen(false)} className="bg-foreground hover:bg-foreground text-foreground font-bold px-6">Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
