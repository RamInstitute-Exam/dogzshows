'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ClubDetailClient from '../../club-details/ClubDetailClient';
import api from '@/lib/api';

function ClubSlugContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [relatedClubs, setRelatedClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Set SEO title
  useEffect(() => {
    if (club?.name) {
      document.title = `${club.name} | JuzDog`;
    } else if (notFound) {
      document.title = 'Club Not Found | JuzDog';
    }
  }, [club, notFound]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    async function resolve() {
      try {
        // 1. Try to load as a club slug
        const res = await api.get(`/public/clubs/slug/${slug}`);
        const clubData = res?.data || res;
        if (clubData && clubData.id) {
          setClub(clubData);
          // Load a few related clubs for sidebar
          try {
            const recRes = await api.get(`/public/clubs?page=1&limit=5&status=ACTIVE`);
            const all: any[] = recRes?.data || [];
            setRelatedClubs(all.filter((c: any) => c.slug !== slug).slice(0, 4));
          } catch (_) { }
          setLoading(false);
          return;
        }
      } catch (_) {
        // Club not found — try category redirect
      }

      // 2. Check if slug matches a category
      try {
        const catRes = await api.get('/public/club-categories');
        const categories: any[] = catRes?.data || catRes?.items || [];
        const matched = categories.find(
          (c: any) =>
            c.slug === slug ||
            (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
        );
        if (matched) {
          router.replace(`/clubs/category/${matched.slug || slug}`);
          return;
        }
      } catch (_) { }

      // 3. Neither — show friendly not-found
      setNotFound(true);
      setLoading(false);
    }
    resolve();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-foreground" />
      </div>
    );
  }

  return <ClubDetailClient club={notFound && !club ? null : club} recommendedClubs={relatedClubs} />;
}

export default function ClubSlugClientPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-foreground" />
        </div>
      }
    >
      <ClubSlugContent />
    </Suspense>
  );
}
