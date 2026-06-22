"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PhotoDetailClient from './PhotoDetailClient';
import { getPhotoBySlug, getAllPhotos } from '@/lib/server-api';
import Spinner from '@/components/common/loader/Spinner';


function PhotoDetailPageContent() {
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

  if (loading) return <Spinner className="p-8" />;
  if (!data) return notFound();

  return <PhotoDetailClient initialPhotos={[data]} />;
}

export default function PhotoDetailPage() {
  return (
    <Suspense fallback={<Spinner className="p-8" />}>
      <PhotoDetailPageContent />
    </Suspense>
  );
}
