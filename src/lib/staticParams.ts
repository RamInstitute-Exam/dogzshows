/**
 * staticParams.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared helpers for `generateStaticParams()` used by every dynamic route.
 *
 * With `output: 'export'` Next.js pre-renders one HTML shell per param entry.
 * All actual data is fetched client-side via useParams / useSearchParams,
 * so the shell is identical for every ID — we just need the IDs enumerated so
 * Next.js doesn't throw the "missing param" error.
 *
 * Fallback behaviour: if the API is unreachable (e.g. during CI), an empty
 * array is returned so the build still succeeds.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api/v1';

/** Generic fetch helper — returns [] on any failure */
async function safeFetch<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    // Handle both { data: [...] } and plain array responses
    if (Array.isArray(json)) return json as T[];
    if (Array.isArray(json?.data)) return json.data as T[];
    if (Array.isArray(json?.items)) return json.items as T[];
    return [];
  } catch {
    return [];
  }
}

/** Fetch all event IDs for /admin/events/edit/[id] */
export async function getEventIds(): Promise<{ id: string }[]> {
  const events = await safeFetch<{ id: string }>(`${API_BASE}/events?limit=10000`);
  if (events.length === 0) return [{ id: '_' }];
  return events.map((e) => ({ id: String(e.id) }));
}

/** Fetch all club slugs for /clubs/[slug] */
export async function getClubSlugs(): Promise<{ slug: string }[]> {
  const clubs = await safeFetch<{ slug: string }>(`${API_BASE}/public/clubs?limit=10000`);
  if (clubs.length === 0) return [{ slug: '_' }];
  return clubs.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
}

/** Fetch all club-category slugs for /clubs/category/[slug] */
export async function getClubCategorySlugs(): Promise<{ slug: string }[]> {
  const cats = await safeFetch<{ slug: string }>(`${API_BASE}/public/club-categories?limit=10000`);
  if (cats.length === 0) return [{ slug: '_' }];
  return cats.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
}

/** Fetch all judge IDs (for any future /judges/[id] dynamic route) */
export async function getJudgeIds(): Promise<{ id: string }[]> {
  const judges = await safeFetch<{ id: string }>(`${API_BASE}/public/judges?limit=10000`);
  if (judges.length === 0) return [{ id: '_' }];
  return judges.map((j) => ({ id: String(j.id) }));
}
