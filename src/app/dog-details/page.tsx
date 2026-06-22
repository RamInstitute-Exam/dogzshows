"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import DogProfileClient from './DogProfileClient';
import Spinner from '@/components/common/loader/Spinner';


function DogProfilePageContent() {
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

  if (loading) return <Spinner className="p-8" />;
  if (!data) return notFound();

  return <DogProfileClient id={data} />;
}

export default function DogProfilePage() {
  return (
    <Suspense fallback={<Spinner className="p-8" />}>
      <DogProfilePageContent />
    </Suspense>
  );
}
