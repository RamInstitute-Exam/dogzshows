"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import DogDetailsClient from './DogDetailsClient';


function DogDetailsPageContent() {
  const searchParams = useSearchParams();
  const paramVal = searchParams.get('id');
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

  return <DogDetailsClient id={data} />;
}

export default function DogDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DogDetailsPageContent />
    </Suspense>
  );
}
