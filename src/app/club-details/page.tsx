"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ClubDetailClient from './ClubDetailClient';
import { getClubBySlug, getAllClubs } from '@/lib/server-api';
import Spinner from '@/components/common/loader/Spinner';


function ClubDetailPageContent() {
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
        const res = await getClubBySlug(paramVal!);
        setData(res?.data || res);
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

  return <ClubDetailClient club={data} />;
}

export default function ClubDetailPage() {
  return (
    <Suspense fallback={<Spinner className="p-8" />}>
      <ClubDetailPageContent />
    </Suspense>
  );
}
