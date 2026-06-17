"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JudgeDetailClient from './JudgeDetailClient';
import { getJudgeBySlug, getAllJudges } from '@/lib/server-api';


function JudgeDetailPageContent() {
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
        const res = await getJudgeBySlug(paramVal!);
        setData(res?.data || res);
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

  return <JudgeDetailClient judge={data} />;
}

export default function JudgeDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <JudgeDetailPageContent />
    </Suspense>
  );
}
