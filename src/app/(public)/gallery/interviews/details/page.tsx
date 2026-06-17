"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import VideoDetailClient from '../../show-videos/details/VideoDetailClient';
import { getVideoBySlug, getAllVideos } from '@/lib/server-api';


function VideoDetailPageContent() {
  const searchParams = useSearchParams();
  const paramVal = searchParams.get('slug');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paramVal) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        // Custom fetch logic needed
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [paramVal]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return notFound();

  return <VideoDetailClient initialVideos={[data]} />;
}

export default function VideoDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VideoDetailPageContent />
    </Suspense>
  );
}
