import React from 'react';
import { fetchServerData } from '@/lib/server-api';
import ClubWinnersClient from './ClubWinnersClient';

// Static export: generateStaticParams provides placeholder and dynamic slugs.
export async function generateStaticParams() {
  try {
    const res = await fetchServerData('/public/clubs?limit=100', 300).catch(() => null);
    const clubs = (res as any)?.data || (res as any)?.items || [];
    
    const params = [
      { slug: 'placeholder' }
    ];
    
    if (Array.isArray(clubs) && clubs.length > 0) {
      clubs.forEach((club: any) => {
        if (club.slug) {
          params.push({ slug: club.slug });
        }
      });
    }
    return params;
  } catch (_) {}

  // Fallback
  return [{ slug: 'placeholder' }];
}

export default function ClubWinnersPage() {
  return <ClubWinnersClient />;
}
