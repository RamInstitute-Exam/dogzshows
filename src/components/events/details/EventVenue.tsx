'use client';

import { MapPin, Navigation2, Car, Building, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventVenue({ event }: { event: any }) {
  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-muted-foregroundxl font-extrabold text-[#0F172A] mb-8">Venue Details</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-brand-orange" />
              <h3 className="text-2xl font-bold text-[#0F172A]">{event.venue}</h3>
            </div>
            <p className="text-muted-foreground font-medium ml-9 mb-8">{event.location}</p>
            
            <div className="space-y-6 ml-9">
              <div className="flex items-start gap-4">
                <Car className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground">Parking</h4>
                  <p className="text-sm text-muted-foreground mt-1">Free VIP and general parking available on premises.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Plane className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground">Airport</h4>
                  <p className="text-sm text-muted-foreground mt-1">15km from International Airport. Shuttle services available.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Building className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground">Hotels</h4>
                  <p className="text-sm text-muted-foreground mt-1">Partner hotels offering pet-friendly accommodation.</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-8 h-12 bg-card hover:bg-foreground text-background text-foreground font-bold rounded-xl shadow-md">
            <Navigation2 className="w-4 h-4 mr-2" /> Get Directions
          </Button>
        </div>

        {/* Right: Map/Image */}
        <div className="h-full min-h-[300px] bg-gray-200 rounded-[16px] overflow-hidden relative group cursor-pointer border border-border">
          <img src="/images/hero_banner.png" alt="Venue Map" className="w-full h-full object-cover blur-[2px] group-hover:blur-none transition-all duration-500" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all duration-500">
            <div className="bg-card/90 backdrop-blur-sm text-[#0F172A] font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-orange" /> Open in Google Maps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
