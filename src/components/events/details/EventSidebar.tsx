'use client';

import { Button } from '@/components/ui/button';
import { Download, Phone, Mail, MessageCircle, AlertCircle, Info } from 'lucide-react';

export default function EventSidebar({ event }: { event: any }) {
  return (
    <div className="sticky top-[110px] space-y-[40px]">
      
      {/* 1. Register Card */}
      <div className="bg-card rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50">
        <h3 className="text-2xl font-extrabold text-foreground mb-2">Register Dog</h3>
        <p className="text-muted-foreground font-medium mb-6">Secure your spot before slots fill up.</p>
        
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
          <span className="text-muted-foreground font-semibold">Entry Fee</span>
          <span className="text-muted-foregroundxl font-extrabold text-brand-orange">{event.entryFee}</span>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-muted-foreground">Available Slots</span>
            <span className="text-foreground">{event.availableSlots} <span className="text-muted-foreground">/ 500</span></span>
          </div>
          <div className="w-full bg-input rounded-full h-3 overflow-hidden">
            <div className="bg-brand-orange h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <Button className="w-full min-h-[48px] md:h-14 bg-brand-orange hover:bg-orange-600 text-foreground font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] mb-4">
          Register Now
        </Button>
        <Button variant="outline" className="w-full min-h-[48px] md:h-12 text-muted-foreground border-border rounded-xl font-bold hover:bg-card flex items-center justify-center">
          <Download className="w-4 h-4 mr-2" /> Download Rulebook
        </Button>
      </div>

      {/* Age Classes Summary */}
      <div className="bg-card rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-brand-orange" />
          <h3 className="text-xl font-extrabold text-foreground">Age Classes</h3>
        </div>
        <div className="space-y-3">
          {event.ageClasses.slice(0, 5).map((cls: any, i: number) => (
            <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <span className="font-bold text-muted-foreground text-sm">{cls.name}</span>
              <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded-md">{cls.age}</span>
            </div>
          ))}
        </div>
        <Button variant="link" className="w-full mt-4 text-brand-orange font-bold">View Full Details</Button>
      </div>

      {/* 2. Need Help Card */}
      <div className="bg-card rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-foreground">
        <h3 className="text-xl font-extrabold mb-2">Need Help?</h3>
        <p className="text-muted-foreground font-medium mb-6 text-sm">Contact the event organizer directly for any queries.</p>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full min-h-[48px] md:h-12 bg-card/10 hover:bg-card/20 border-border text-foreground rounded-xl justify-start">
            <Phone className="w-4 h-4 mr-3 text-brand-orange" /> +91 98765 43210
          </Button>
          <Button variant="outline" className="w-full min-h-[48px] md:h-12 bg-card/10 hover:bg-card/20 border-border text-foreground rounded-xl justify-start">
            <MessageCircle className="w-4 h-4 mr-3 text-green-400" /> WhatsApp Support
          </Button>
          <Button variant="outline" className="w-full min-h-[48px] md:h-12 bg-card/10 hover:bg-card/20 border-border text-foreground rounded-xl justify-start">
            <Mail className="w-4 h-4 mr-3 text-blue-400" /> support@juzdog.com
          </Button>
        </div>
      </div>

    </div>
  );
}
