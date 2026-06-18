import { config } from './config';

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
};

/**
 * Reusable server-side fetcher with built-in revalidation.
 */
export async function fetchServerData(endpoint: string, revalidate: number = 60) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { success: true, data: [] };
  }

  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const res = await fetch(url, {
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch ${endpoint}: Status ${res.status}`);
      return { success: false, data: [] };
    }

    const json = await res.json();
    return { success: true, data: Array.isArray(json) ? json : json.data || [] };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { success: false, data: [] };
  }
}

export async function getHeroSlides() {
  return fetchServerData('/banners?type=hero', 60);
}

export async function getFeaturedShows() {
  return fetchServerData('/public/events', 60); // Optionally add ?featured=true
}

export async function getFeaturedPhotos() {
  return fetchServerData('/public/media/photos?featured=true&limit=8', 60);
}

export async function getFeaturedVideos() {
  return fetchServerData('/public/media/videos?featured=true&limit=8', 60);
}

export async function getFeaturedJudges() {
  return fetchServerData('/public/judges', 60);
}

export async function getFCIGroups() {
  return fetchServerData('/public/groups', 60);
}

export async function getStats() {
  return fetchServerData('/public/stats', 60);
}

export async function getTestimonials() {
  return fetchServerData('/public/testimonials', 60);
}

export async function getSponsors() {
  return fetchServerData('/public/sponsors', 60);
}

export async function fetchServerDataSingle(endpoint: string, revalidate: number = 60) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { success: true, data: null };
  }

  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const res = await fetch(url, {
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch ${endpoint}: Status ${res.status}`);
      return { success: false, data: null };
    }

    const json = await res.json();
    // Return json.data if it exists (standard wrapped response), otherwise the raw json
    return { success: true, data: json.data !== undefined ? json.data : json };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { success: false, data: null };
  }
}

export async function getAllPhotos() {
  return fetchServerData('/public/media/photos', 60);
}

export async function getPhotoBySlug(slug: string) {
  return fetchServerDataSingle(`/public/media/photos/${slug}`, 60);
}

export async function getAllVideos() {
  return fetchServerData('/public/media/videos', 60);
}

export async function getVideoBySlug(slug: string) {
  return fetchServerDataSingle(`/public/media/videos/${slug}`, 60);
}

export async function getAllJudges() {
  return fetchServerData('/public/judges', 60); 
}

export async function getJudgeBySlug(slug: string) {
  return fetchServerDataSingle(`/public/judges/slug/${slug}`, 60); 
}

export async function getAllClubs() {
  return fetchServerData('/public/clubs', 60); 
}

export async function getClubBySlug(slug: string) {
  return fetchServerDataSingle(`/public/clubs/slug/${slug}`, 60); 
}
