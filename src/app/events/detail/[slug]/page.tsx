import { Suspense } from 'react';
import EventDetailClient from '../EventDetailClient';
import { Loader2 } from 'lucide-react';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    }>
      <EventDetailClient params={params} />
    </Suspense>
  );
}
