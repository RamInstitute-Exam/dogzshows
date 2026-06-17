import React from 'react';
import type { Metadata } from 'next';
import ClubDetailClient from './ClubDetailClient';
import { getClubBySlug, getAllClubs } from '@/lib/server-api';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await getAllClubs();
    const clubs = res?.data || [];
    const params = clubs.map((club: any) => ({
      slug: club.slug || club.id,
    }));
    if (!params.some((p: any) => p.slug === 'kci')) {
      params.push({ slug: 'kci' });
    }
    if (!params.some((p: any) => p.slug === 'speciality')) {
      params.push({ slug: 'speciality' });
    }
    if (!params.some((p: any) => p.slug === 'all-breeds')) {
      params.push({ slug: 'all-breeds' });
    }
    return params;
  } catch (error) {
    console.error("Failed to generate static params for clubs", error);
  }
  return [{ slug: 'kci' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const res = await getClubBySlug(slug);
    let club = res?.success && res.data ? res.data : null;
    if (!club && slug === 'kci') {
      club = {
        name: 'Kennel Club of India',
        description: 'The Kennel Club of India (KCI) is the primary registry of purebred dogs in India.',
      };
    }
    if (club) {
      return {
        title: `${club.name} | JuzDog Clubs`,
        description: club.description || `View details for ${club.name} on JuzDog.`,
        openGraph: {
          title: club.name,
          description: club.description || `View details for ${club.name} on JuzDog.`,
          images: club.logoUrl ? [{ url: club.logoUrl }] : [],
        },
      };
    }
  } catch (error) {
    // ignore
  }

  return {
    title: 'Club Details | JuzDog',
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const clubRes = await getClubBySlug(slug);
  let club = clubRes?.data || null;
  let recommendedClubs = [];

  if (!club && slug !== 'kci') {
    try {
      const recRes = await getAllClubs();
      recommendedClubs = (recRes?.data || []).filter((c: any) => c.isFeatured).slice(0, 4);
    } catch (e) { }
  }

  if (!club && slug === 'kci') {
    club = {
      id: 'kci',
      name: 'Kennel Club of India',
      slug: 'kci',
      description: 'The Kennel Club of India (KCI) is the primary registry of purebred dogs in India. It is the premier national body representing dog owners, breeders, and Kennel clubs throughout India.',
      address: 'No. 88, KCI House, Chennai, Tamil Nadu, India',
      email: 'info@kennelclubofindia.org',
      phone: '+91 44 2825 5315',
      logoUrl: null,
      isFeatured: true,
      website: 'https://www.kennelclubofindia.org',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const jsonLd = club ? {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: club.name,
      description: club.description,
      url: club.website || `https://juzdog.com/clubs/${club.slug}`,
      logo: club.logoUrl || undefined,
      address: club.city || club.state ? {
        '@type': 'PostalAddress',
        streetAddress: club.address || undefined,
        addressLocality: club.city || undefined,
        addressRegion: club.state || undefined,
        postalCode: club.zipcode || undefined,
        addressCountry: club.country || 'IN'
      } : undefined,
      contactPoint: (club.phone || club.email) ? {
        '@type': 'ContactPoint',
        telephone: club.phone || undefined,
        email: club.email || undefined,
        contactType: 'customer service'
      } : undefined,
      foundingDate: club.establishedYear ? club.establishedYear.toString() : undefined
    } : null;

    return (
      <>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <ClubDetailClient club={club} recommendedClubs={recommendedClubs} />
      </>
    );
  }
}