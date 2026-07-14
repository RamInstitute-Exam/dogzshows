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
 * We ALSO push a 'placeholder' param for every route. This forces Next.js to
 * build a fallback HTML shell (e.g. /clubs/placeholder/index.html).
 * The .htaccess file then rewrites any unknown slug (like a newly created club)
 * to this placeholder shell. The React router then loads, reads the real URL,
 * and fetches the correct data client-side!
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
  const params = events.map((e) => ({ id: String(e.id) }));
  params.push({ id: 'placeholder' });
  return params;
}

/** Fetch all club slugs for /clubs/[slug] */
export async function getClubSlugs(): Promise<{ slug: string }[]> {
  const clubs = await safeFetch<{ slug: string }>(`${API_BASE}/public/clubs?limit=10000`);
  const params = clubs.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
  params.push({ slug: 'placeholder' });
  return params;
}

/** Fetch all club-category slugs for /clubs/category/[slug] */
export async function getClubCategorySlugs(): Promise<{ slug: string }[]> {
  const cats = await safeFetch<{ slug: string }>(`${API_BASE}/public/club-categories?limit=10000`);
  const params = cats.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
  params.push({ slug: 'placeholder' });
  return params;
}

/** Fetch all judge IDs (for any future /judges/[id] dynamic route) */
export async function getJudgeIds(): Promise<{ id: string }[]> {
  const judges = await safeFetch<{ id: string }>(`${API_BASE}/public/judges?limit=10000`);
  const params = judges.map((j) => ({ id: String(j.id) }));
  params.push({ id: 'placeholder' });
  return params;
}

/** Fetch all show album IDs for /gallery/shows/[id] */
export async function getShowAlbumIds(): Promise<{ id: string }[]> {
  const albums = await safeFetch<{ id: string }>(`${API_BASE}/public/homepage-show-albums?limit=10000`);
  const params = albums.map((a) => ({ id: String(a.id) }));
  params.push({ id: 'placeholder' });
  return params;
}

/** Fetch all outdoor album IDs for /gallery/outdoor/[id] */
export async function getOutdoorAlbumIds(): Promise<{ id: string }[]> {
  let params: { id: string }[] = [];
  try {
    const res = await fetch(`${API_BASE}/public/homepage-outdoor-photos?limit=10000`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const albums = json?.data?.albums;
      if (Array.isArray(albums) && albums.length > 0) {
        params = albums.map((a) => ({ id: String(a.id) }));
      }
    }
  } catch { }
  params.push({ id: 'placeholder' });
  return params;
}

/** Fetch all gallery category slugs for /gallery/[categorySlug] */
export async function getGalleryCategorySlugs(): Promise<{ categorySlug: string }[]> {
  const cats = await safeFetch<{ slug: string }>(`${API_BASE}/public/gallery/categories`);
  const params = cats.filter((c) => c.slug).map((c) => ({ categorySlug: c.slug }));
  params.push({ categorySlug: 'placeholder' });
  return params;
}

/** Fetch all gallery album slugs for /gallery/album/[slug] */
export async function getGalleryAlbumSlugs(): Promise<{ slug: string }[]> {
  const albums = await safeFetch<{ slug: string }>(`${API_BASE}/public/gallery/albums`);
  const params = albums.filter((a) => a.slug).map((a) => ({ slug: a.slug }));
  params.push({ slug: 'placeholder' });
  return params;
}

/** Fetch all magazine slugs for /e-magazines/[slug] */
export async function getMagazineSlugs(): Promise<{ slug: string }[]> {
  const mags = await safeFetch<{ slug: string }>(`${API_BASE}/public/magazines?limit=10000`);
  const params = mags.filter((m) => m.slug).map((m) => ({ slug: m.slug }));
  params.push({ slug: 'placeholder' });
  return params;
}

/** Fetch all unique event IDs for /gallery/show-photos/[eventId] */
export async function getShowPhotoEventIds(): Promise<{ eventId: string }[]> {
  const params: { eventId: string }[] = [];
  function slugify(text: string) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  }
  try {
    const [allRes, hofRes] = await Promise.all([
      safeFetch<any>(`${API_BASE}/public/winners/public?limit=10000`),
      safeFetch<any>(`${API_BASE}/public/winners/public/hall-of-fame?limit=10000`),
    ]);
    const all = [...allRes, ...hofRes];
    const ids = new Set<string>();
    all.forEach((w) => {
      const id = w.event?.id || w.eventId || slugify(w.eventName || w.event?.name || '');
      if (id) ids.add(String(id));
    });
    params.push(...Array.from(ids).map((id) => ({ eventId: id })));
  } catch {}
  params.push({ eventId: 'placeholder' });
  return params;
}

/** Fetch all event slugs for /events/detail/[slug] */
export async function getEventSlugs(): Promise<{ slug: string }[]> {
  const shows = await safeFetch<{ slug: string }>(`${API_BASE}/public/shows?limit=10000`);
  const params = shows.filter((s) => s.slug).map((s) => ({ slug: s.slug }));
  params.push({ slug: 'placeholder' });
  return params;
}
