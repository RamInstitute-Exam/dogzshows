import React from 'react';
import type { Metadata } from 'next';
import JudgeDetailClient from './JudgeDetailClient';
import { getJudgeBySlug, getAllJudges } from '@/lib/server-api';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await getAllJudges();
    const judges = res?.data || [];
    return judges.map((judge: any) => ({
      slug: judge.slug || judge.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params for judges", error);
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const res = await getJudgeBySlug(slug);
    if (res?.success && res.data) {
      const judge = res.data;
      return {
        title: `${judge.name} | JuzDog Judges`,
        description: judge.bio || `View profile of ${judge.name} on JuzDog.`,
        openGraph: {
          title: judge.name,
          description: judge.bio || `View profile of ${judge.name} on JuzDog.`,
          images: judge.photoUrl ? [{ url: judge.photoUrl }] : [],
        },
      };
    }
  } catch (error) {
    // ignore
  }

  return {
    title: 'Judge Details | JuzDog',
  };
}

export default async function JudgeDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const judgeRes = await getJudgeBySlug(slug);

  return <JudgeDetailClient judge={judgeRes.data} />;
}
