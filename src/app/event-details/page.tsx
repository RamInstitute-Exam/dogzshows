"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, SearchX } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import EventHero from '@/components/events/details/EventHero';
import Spinner from '@/components/common/loader/Spinner';
import Link from 'next/link';
import api from '@/lib/api';

function EventDetailsPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || searchParams.get('id') || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        const res = await api.get(`/public/shows/${encodeURIComponent(slug)}`);
        if (res?.success && res?.data) {
          setData(res.data);
        } else {
          setError('Event not found.');
        }
      } catch (err: any) {
        console.error('[event-details] Failed to fetch:', err?.message || err);
        setError(err?.message || 'Failed to load event.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return <Spinner className="p-8" />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10 text-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-3">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This event does not exist.'}</p>
        <Link href="/events" className="inline-flex items-center gap-2 bg-foreground text-white font-bold px-5 py-2.5 rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <PageContainer>
      <EventHero event={data} />
    </PageContainer>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<Spinner className="p-8" />}>
      <EventDetailsPageContent />
    </Suspense>
  );
}
