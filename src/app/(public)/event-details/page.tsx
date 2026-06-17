"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { MOCK_EVENT_DETAIL } from '@/lib/mock/eventsData';
import PageContainer from '@/components/layout/PageContainer';
import EventHero from '@/components/events/details/EventHero';

function EventDetailsPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    // Simulate fetch with mock data
    setData(MOCK_EVENT_DETAIL);
    setLoading(false);
  }, [slug]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return notFound();

  return (
    <PageContainer>
      <EventHero event={data} />
    </PageContainer>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EventDetailsPageContent />
    </Suspense>
  );
}
