import { ArrowLeft, Dog, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

export async function generateStaticParams() {
  try {
    const res = await fetch('${config.apiUrl}/groups');
    if (!res.ok) return [{ slug: '1' }];
    const data = await res.json();
    const params = data.data.map((group: any) => ({
      slug: group.slug || group.groupNumber.toString(),
    }));
    return params.length > 0 ? params : [{ slug: '1' }];
  } catch (error) {
    return [{ slug: '1' }];
  }
}


export default async function FCIGroupDetailPage({ params }: { params: { slug: string } }) {
  // We await params as recommended in Next 15, or standard destructuring in Next 14
  const { slug } = await params;
  const res = await fetch(`${config.apiUrl}/groups/${slug}`);

  if (!res.ok) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#07090F] text-foreground">
        <h1 className="text-3xl font-bold mb-4">Group Not Found</h1>
        <Link href="/">
          <Button variant="outline" className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  const { data: group } = await res.json();

  return (
    <div className="bg-[#07090F] min-h-screen text-foreground pt-6 lg:pt-12 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-brand-orange transition-colors mb-8 font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Groups
        </Link>

        {/* Hero Section */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden mb-16 shadow-2xl border border-border group">
          {group.heroImage ? (
            <img src={group.heroImage} alt={group.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/60 to-transparent" />

          <div className="absolute bottom-12 left-12 right-12 z-20 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <span className="inline-block px-4 py-1.5 bg-brand-orange/20 text-brand-orange text-sm font-black tracking-widest uppercase rounded-full border border-brand-orange/50 mb-4 shadow-[0_0_20px_rgba(255,165,0,0.3)]">
                FCI Group {group.groupNumber}
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
                {group.name}
              </h1>
            </div>

            <div className="flex gap-4">
              <div className="bg-card/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border text-center shadow-lg">
                <p className="text-3xl font-black text-brand-orange">{group._count?.breeds || 0}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Breeds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
                <Dog className="text-brand-orange w-8 h-8" />
                About This Group
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {group.description || `The ${group.name} group represents a specialized classification of dog breeds recognized by the Fédération Cynologique Internationale (FCI). These breeds have been historically bred for specific purposes and share common characteristics, temperaments, and working abilities.`}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-extrabold mb-6 border-t border-border pt-12">Recognized Breeds</h2>
              <div className="bg-card rounded-[24px] p-8 border border-border text-center shadow-md">
                <p className="text-muted-foreground text-lg">Detailed breed profiles are currently being curated for the CMS.</p>
                <Button className="mt-6 bg-brand-orange hover:bg-orange-600 rounded-full font-bold shadow-[0_0_15px_rgba(255,165,0,0.3)] text-foreground">View Full Registry</Button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-card rounded-[24px] p-8 border border-border shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                <Calendar className="text-blue-400 w-5 h-5" />
                Upcoming Shows
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">No upcoming specialty shows scheduled exclusively for Group {group.groupNumber}. Check the main events calendar for all-breed championships.</p>
              <Link href="/events">
                <Button variant="outline" className="w-full mt-6 rounded-full border-border hover:bg-accent text-foreground font-bold">All Events Calendar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
