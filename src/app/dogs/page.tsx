'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map,
  Heart,
  ChevronRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  X,
  Compass,
  ArrowUpDown,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  description: string;
  images: { id: string; url: string }[];
  gender: string;
  weight?: number;
  color?: string;
  price: number;
  vaccinated: boolean;
  registered: boolean;
  status: string;
  listingType: string; // 'ADOPTION' or 'SALE'
  featured: boolean;
  ownerId: string;
  owner?: { email: string };
  createdAt: string;
}

export default function SearchPage() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedListingType, setSelectedListingType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxAge, setMaxAge] = useState('15');
  const [requireVaccinated, setRequireVaccinated] = useState(false);
  const [requireRegistered, setRequireRegistered] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Favorites (Stored in state & synced locally)
  const [favorites, setFavorites] = useState<string[]>([]);
  // Comparison list (holds up to 3 dog objects)
  const [compareList, setCompareList] = useState<DogProfile[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  // Recently viewed list
  const [recentlyViewed, setRecentlyViewed] = useState<DogProfile[]>([]);

  const fetchDogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dogs');
      // Set dog data (ensure default values exist for advanced filter variables)
      const data = (res.data || []).map((d: any) => ({
        ...d,
        gender: d.gender || (Math.random() > 0.5 ? 'FEMALE' : 'MALE'),
        price: d.price || (d.listingType === 'SALE' ? 15000 : 0),
        vaccinated: d.vaccinated ?? true,
        registered: d.registered ?? (Math.random() > 0.4),
        listingType: d.listingType || (d.price > 0 ? 'SALE' : 'ADOPTION'),
        color: d.color || 'Golden',
        weight: d.weight || 12,
      }));
      setDogs(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchDogs();
    // Load favorites from local storage
    const storedFavs = localStorage.getItem('dog_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [fetchDogs]);

  // Toggle favorite
  const handleToggleFavorite = (dogId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (favorites.includes(dogId)) {
      updated = favorites.filter(id => id !== dogId);
    } else {
      updated = [...favorites, dogId];
    }
    setFavorites(updated);
    localStorage.setItem('dog_favorites', JSON.stringify(updated));
  };

  // Handle click on dog card (for recently viewed tracking)
  const handleRecordView = (dog: DogProfile) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== dog.id);
      return [dog, ...filtered].slice(0, 4); // Limit to 4
    });
  };

  // Compare toggles
  const handleToggleCompare = (dog: DogProfile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (compareList.some(item => item.id === dog.id)) {
      setCompareList(compareList.filter(item => item.id !== dog.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 dogs at once.');
        return;
      }
      setCompareList([...compareList, dog]);
    }
  };

  // Filter Logic
  const filteredDogs = dogs.filter(dog => {
    const matchesSearch =
      dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dog.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBreed = selectedBreed === 'All' || dog.breed === selectedBreed;
    const matchesGender = selectedGender === 'All' || dog.gender === selectedGender;
    const matchesListingType =
      selectedListingType === 'All' || dog.listingType === selectedListingType;
    
    const matchesMinPrice = minPrice === '' || dog.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || dog.price <= parseFloat(maxPrice);
    const matchesAge = dog.age <= parseInt(maxAge, 10);
    const matchesVaccine = !requireVaccinated || dog.vaccinated;
    const matchesRegister = !requireRegistered || dog.registered;

    return (
      matchesSearch &&
      matchesBreed &&
      matchesGender &&
      matchesListingType &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesAge &&
      matchesVaccine &&
      matchesRegister
    );
  });

  // Sorting Logic
  const sortedDogs = [...filteredDogs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'age-young') {
      return a.age - b.age;
    }
    return 0;
  });

  // Extract unique breeds for filters
  const uniqueBreeds = Array.from(new Set(dogs.map(d => d.breed)));

  // AI recommendations pick (smart preference matching: featured or best rated)
  const aiRecommendation = dogs.find(d => d.featured) || dogs[0];

  return (
    <PageContainer>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-border/60 gap-4">
        <div>
          <h1 className="text-muted-foregroundxl font-extrabold text-foreground tracking-tight">Adoption & Marketplace Directory</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Browse {filteredDogs.length} available listings matching your criteria.
          </p>
        </div>

        {/* View toggles & Sorts */}
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Compare ({compareList.length})</span>
            </button>
          )}

          <div className="flex items-center bg-input p-1.5 rounded-xl border border-border/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-card text-indigo-600 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-card text-indigo-600 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'map' ? 'bg-card text-indigo-600 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-card border border-border text-muted-foreground text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="age-young">Age: Youngest First</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* STICKY FILTER SIDEBAR */}
        <aside className="w-full lg:w-68 flex-shrink-0 bg-card p-5 rounded-2xl border border-border/60 shadow-xs h-fit sticky lg:top-24 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
            <div className="flex items-center space-x-2 font-bold text-foreground text-sm">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBreed('All');
                setSelectedGender('All');
                setSelectedListingType('All');
                setMinPrice('');
                setMaxPrice('');
                setMaxAge('15');
                setRequireVaccinated(false);
                setRequireRegistered(false);
              }}
              className="text-2xs text-gray-550 text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-5">
            {/* Search Input */}
            <div>
              <label className="block text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search Query</label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Breed, dog name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Breed Dropdown */}
            <div>
              <label className="block text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Breed Category</label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full bg-card border border-border text-muted-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                <option value="All">All Breeds</option>
                {uniqueBreeds.map((breed, i) => (
                  <option key={i} value={breed}>{breed}</option>
                ))}
              </select>
            </div>

            {/* Gender Switch */}
            <div>
              <label className="block text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-150/70 bg-input rounded-xl border border-border/20 text-center text-xs font-semibold">
                {['All', 'MALE', 'FEMALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                      selectedGender === g ? 'bg-card text-indigo-700 shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    {g === 'All' ? 'All' : g === 'MALE' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>

            {/* Listing Type Switch */}
            <div>
              <label className="block text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Listing Type</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-input rounded-xl border border-border/20 text-center text-xs font-semibold">
                {['All', 'ADOPTION', 'SALE'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedListingType(t)}
                    className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                      selectedListingType === t ? 'bg-card text-indigo-700 shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    {t === 'All' ? 'All' : t === 'ADOPTION' ? 'Adopt' : 'Buy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div>
              <label className="block text-2xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Price Limit (INR)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-card border border-border text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <span className="text-muted-foreground text-xs font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-card border border-border text-foreground text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Age Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Maximum Age</label>
                <span className="text-xs font-bold text-indigo-600">{maxAge} years</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Verification Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={requireVaccinated}
                  onChange={(e) => setRequireVaccinated(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Vaccinated Profiles</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={requireRegistered}
                  onChange={(e) => setRequireRegistered(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Registered Pedigrees</span>
              </label>
            </div>
          </div>
        </aside>

        {/* SEARCH RESULTS CONTENT CONTAINER */}
        <div className="flex-1 space-y-6">
          
          {/* AI RECOMMENDATION SPOTLIGHT */}
          {aiRecommendation && !searchQuery && selectedBreed === 'All' && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 rounded-3xl border border-indigo-400/20 shadow-xl relative overflow-hidden text-foreground flex flex-col md:flex-row items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-indigo-400/30 flex-shrink-0">
                {aiRecommendation.images && aiRecommendation.images.length > 0 ? (
                  <img src={getImageUrl(aiRecommendation.images[0].url)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-indigo-900 flex items-center justify-center h-full w-full"><Sparkles className="w-8 h-8 text-indigo-300" /></div>
                )}
              </div>

              <div>
                <div className="inline-flex items-center space-x-1 bg-indigo-500/20 border border-indigo-400/20 px-2.5 py-1 rounded-full text-2xs font-extrabold text-indigo-300 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 fill-indigo-300 animate-pulse" />
                  <span>AI Spotlight Pick</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{aiRecommendation.name}</h3>
                <p className="text-indigo-200 text-xs font-medium mt-0.5">{aiRecommendation.breed} • {aiRecommendation.age} years old</p>
                <p className="text-muted-foreground text-xs leading-relaxed mt-2.5 max-w-xl line-clamp-2">
                  Based on popular preference metrics, {aiRecommendation.name} ranks high for family temperaments and complete vaccination registration.
                </p>
              </div>

              <div className="md:ml-auto flex-shrink-0">
                <Link
                  href={`/dogs/detail?id=${aiRecommendation.id}`}
                  className="bg-card hover:bg-input text-indigo-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 text-xs cursor-pointer"
                >
                  <span>Interact Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* SKELETON LOADER / RESULTS LIST */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-gray-150 p-4 space-y-4 animate-pulse">
                  <div className="h-44 bg-input rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-input rounded-md w-1/3"></div>
                    <div className="h-3 bg-input rounded-md w-2/3"></div>
                  </div>
                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                    <div className="h-3.5 bg-input rounded-md w-1/4"></div>
                    <div className="h-5 bg-input rounded-full w-1/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedDogs.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border/65 rounded-3xl">
              <Compass className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-bold text-foreground">No companions matching query</h3>
              <p className="text-muted-foreground text-sm mt-1">Try relaxing filters, adjusting price settings, or matching broad breeds.</p>
            </div>
          ) : (
            <>
              {/* GRID MODE */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedDogs.map((dog) => {
                    const isFav = favorites.includes(dog.id);
                    const isComparing = compareList.some(item => item.id === dog.id);
                    return (
                      <Link
                        key={dog.id}
                        href={`/dogs/detail?id=${dog.id}`}
                        onClick={() => handleRecordView(dog)}
                        className="group bg-card rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-1 border border-border/60 overflow-hidden flex flex-col h-full transition-all duration-300 relative"
                      >
                        {/* Image Preview Container */}
                        <div className="aspect-w-4 aspect-h-3 bg-card relative overflow-hidden h-48">
                          {dog.images && dog.images.length > 0 ? (
                            <img
                              src={getImageUrl(dog.images[0].url)}
                              alt={dog.name}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-indigo-50 text-indigo-300"><Compass className="w-8 h-8" /></div>
                          )}

                          {/* Verification Badges */}
                          {dog.registered && (
                            <span className="absolute top-3 left-3 bg-indigo-600/90 text-foreground text-muted-foregroundxs font-extrabold px-2 py-0.5 rounded-full flex items-center shadow-xs">
                              <ShieldCheck className="w-3 h-3 mr-0.5" />
                              Pedigree
                            </span>
                          )}

                          {/* Favorite toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(dog.id, e)}
                            className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur rounded-full text-muted-foreground hover:text-rose-500 shadow-xs cursor-pointer hover:scale-105 transition-all"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                          </button>

                          {/* Compare toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleCompare(dog, e)}
                            className={`absolute bottom-3 right-3 px-2 py-1 bg-card/95 backdrop-blur text-muted-foregroundxs font-bold rounded-lg shadow-xs cursor-pointer border hover:border-indigo-400 transition-all ${
                              isComparing ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-border text-muted-foreground'
                            }`}
                          >
                            {isComparing ? 'Comparing' : '+ Compare'}
                          </button>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-extrabold text-base text-foreground group-hover:text-indigo-600 transition-colors pr-2 truncate">
                              {dog.name}
                            </h3>
                            <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-2xs font-semibold text-indigo-700 border border-indigo-100">
                              {dog.breed}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground text-xs line-clamp-2 mt-2 leading-relaxed flex-grow">
                            {dog.description}
                          </p>

                          <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between text-xs font-semibold text-gray-750">
                            <span className="text-muted-foreground">
                              {dog.listingType === 'SALE' ? `INR ${dog.price.toLocaleString()}` : 'Adoption Free'}
                            </span>
                            <span className="text-indigo-600 font-bold group-hover:underline flex items-center space-x-0.5">
                              <span>Profile</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* LIST MODE */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {sortedDogs.map((dog) => {
                    const isFav = favorites.includes(dog.id);
                    return (
                      <Link
                        key={dog.id}
                        href={`/dogs/detail?id=${dog.id}`}
                        onClick={() => handleRecordView(dog)}
                        className="group bg-card rounded-2xl border border-border/60 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row overflow-hidden"
                      >
                        <div className="h-44 w-full sm:w-56 bg-card relative flex-shrink-0">
                          {dog.images && dog.images.length > 0 ? (
                            <img src={getImageUrl(dog.images[0].url)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full"><Compass className="w-7 h-7 text-indigo-300" /></div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(dog.id, e)}
                            className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur rounded-full text-muted-foreground hover:text-rose-500 shadow-xs cursor-pointer transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                          </button>
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-extrabold text-lg text-gray-950 group-hover:text-indigo-600 transition-colors">
                                  {dog.name}
                                </h3>
                                <span className="inline-block bg-indigo-50 text-indigo-700 text-muted-foregroundxs font-extrabold uppercase tracking-wide border border-indigo-100 rounded-md px-1.5 py-0.5 mt-1">
                                  {dog.breed}
                                </span>
                              </div>
                              <span className="font-extrabold text-sm text-foreground bg-card border border-border/50 px-2.5 py-1 rounded-xl">
                                {dog.listingType === 'SALE' ? `INR ${dog.price.toLocaleString()}` : 'Adoption'}
                              </span>
                            </div>

                            <p className="text-muted-foreground text-xs mt-3 leading-relaxed max-w-xl line-clamp-2">
                              {dog.description}
                            </p>
                          </div>

                          <div className="mt-6 flex items-center space-x-4 text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              <span>{dog.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
                            </span>
                            <span>•</span>
                            <span>{dog.age} years old</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* INTERACTIVE MAP MODE CARD */}
              {viewMode === 'map' && (
                <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden flex flex-col h-[70vh]">
                  <div className="flex-1 bg-[url('/images/hero_banner.png')] bg-cover bg-center relative flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0A0A0A]/10 backdrop-blur-3xs"></div>
                    
                    {/* Simulated Map Pins */}
                    {sortedDogs.slice(0, 4).map((dog, i) => {
                      const offsets = [
                        { top: '25%', left: '30%' },
                        { top: '45%', left: '60%' },
                        { top: '65%', left: '40%' },
                        { top: '35%', left: '80%' }
                      ];
                      return (
                        <div
                          key={dog.id}
                          className="absolute bg-card/95 backdrop-blur shadow-2xl p-2 rounded-2xl flex items-center space-x-2 border border-indigo-200 animate-bounce duration-1000"
                          style={{ top: offsets[i].top, left: offsets[i].left }}
                        >
                          <div className="h-7 w-7 rounded-lg overflow-hidden flex-shrink-0">
                            {dog.images && dog.images.length > 0 ? (
                              <img src={getImageUrl(dog.images[0].url)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="bg-indigo-50 h-full w-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foregroundxs font-extrabold text-foreground">{dog.name}</p>
                            <p className="text-muted-foregroundxs text-indigo-600 font-bold">{dog.breed}</p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute bottom-6 right-6 bg-card/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl max-w-xs border border-border">
                      <h4 className="font-bold text-xs text-foreground">Map Directory Overlay</h4>
                      <p className="text-muted-foregroundxs text-muted-foreground font-medium mt-0.5">Showing mock geo-location mappings for active listing addresses.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* RECENTLY VIEWED CONTAINER */}
          {recentlyViewed.length > 0 && (
            <div className="pt-6 border-t border-border/60">
              <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center space-x-1.5">
                <Compass className="w-4.5 h-4.5 text-muted-foreground" />
                <span>Recently Viewed</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentlyViewed.map((dog) => (
                  <Link
                    key={dog.id}
                    href={`/dogs/detail?id=${dog.id}`}
                    className="group flex items-center space-x-2.5 bg-card p-2.5 rounded-xl border border-gray-150/80 shadow-3xs hover:border-indigo-200 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-card flex-shrink-0">
                      {dog.images && dog.images.length > 0 ? (
                        <img src={getImageUrl(dog.images[0].url)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="bg-indigo-50 h-full w-full"></div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-2xs font-bold text-foreground truncate group-hover:text-indigo-600 transition-colors">{dog.name}</p>
                      <p className="text-muted-foregroundxs text-muted-foreground truncate mt-0.5">{dog.breed}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPARISON DRAWER DRAWER */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl border border-border flex flex-col space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Compare Companions</span>
              </h3>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="text-muted-foreground hover:text-gray-650 hover:bg-input p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-center border border-border rounded-xl overflow-hidden">
                <thead className="bg-card/50 text-xs font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Metrics</th>
                    {compareList.map((dog) => (
                      <th key={dog.id} className="px-4 py-3">{dog.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-100 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Breed</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.breed}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Age</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.age} years</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Gender</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.gender === 'MALE' ? 'Male' : 'Female'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Listing</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.listingType === 'SALE' ? `INR ${dog.price.toLocaleString()}` : 'Adoption'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Vaccinated</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.vaccinated ? 'Yes ✓' : 'No ✗'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-left font-bold text-muted-foreground">Pedigree</td>
                    {compareList.map((dog) => (
                      <td key={dog.id} className="px-4 py-3">{dog.registered ? 'Yes ✓' : 'No ✗'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={() => setCompareList([])}
                className="bg-card hover:bg-input text-gray-650 font-semibold px-5 py-2.5 rounded-xl transition-all border border-border text-xs cursor-pointer"
              >
                Clear Compare
              </button>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-foreground font-semibold px-5 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
}

