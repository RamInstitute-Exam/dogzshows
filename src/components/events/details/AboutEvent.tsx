'use client';

import { Shield, AlertCircle, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutEvent({ event }: { event: any }) {
  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">About the Event</h2>
      
      {/* Description Section */}
      <div className="mb-10">
        <p className="text-muted-foreground leading-relaxed text-lg font-medium">{event?.about ?? event?.description ?? 'No description available.'}</p>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-brand-orange" />
            <h3 className="text-xl font-bold text-foreground">Objectives</h3>
          </div>
          <ul className="space-y-3">
            {['Promote responsible purebred breeding.', 'Provide a competitive platform for exhibitors.', 'Educate the public on various dog breeds.', 'Identify the ultimate Best in Show.'].map((obj, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground font-medium">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {obj}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-brand-orange" />
            <h3 className="text-xl font-bold text-foreground">Highlights</h3>
          </div>
          <ul className="space-y-3">
            {['International FCI Judges Panel.', 'Digital certificates & badges.', 'Live scoring and dynamic leaderboards.', 'Professional media coverage.'].map((high, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground font-medium">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {high}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rules Section */}
      <div className="bg-card rounded-[16px] p-8 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold text-foreground">Strict Competition Rules</h3>
        </div>
        {(!event?.rules || event.rules.length === 0) ? (
          <p className="text-muted-foreground font-medium italic">No competition rules listed for this event.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(event.rules as string[]).map((rule: string, i: number) => (
              <li key={i} className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-muted-foreground font-medium">{rule}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
