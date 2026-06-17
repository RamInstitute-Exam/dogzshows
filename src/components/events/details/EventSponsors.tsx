'use client';

export default function EventSponsors() {
  const sponsors = [
    { name: 'KCI', type: 'Partner Club' },
    { name: 'Royal Canin', type: 'Title Sponsor' },
    { name: 'Pedigree', type: 'Nutrition Partner' },
    { name: 'FCI', type: 'Global Partner' },
  ];

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-50 mb-[80px]">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8 text-center">Our Sponsors</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sponsors.map((sponsor, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border hover:border-brand-orange/30 transition-colors">
            <div className="h-12 w-full flex items-center justify-center font-extrabold text-muted-foreground text-2xl tracking-wider uppercase mb-2">
              {sponsor.name}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">{sponsor.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
