"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import FCIGroupDetailClient from './FCIGroupDetailClient';


function FCIGroupDetailPageContent() {
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

  return <FCIGroupDetailClient slug={data} />;
}

export default function FCIGroupDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <FCIGroupDetailPageContent />
    </Suspense>
  );
}
