import { config } from './config';

const getBaseUrl = () => {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
};

/**
 * Reusable server-side fetcher with built-in revalidation.
 */
export async function fetchServerData(endpoint: string, revalidate: number = 60) {
  // Removed NEXT_PHASE check to allow Next.js to fetch data during static generation

  // Defensive check against invalid dynamic params
  if (endpoint.includes('/undefined') || endpoint.includes('/null')) {
    console.warn(`[server-api] Blocked invalid fetch request to: ${endpoint}`);
    return { success: false, data: [] };
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
    let resultData = [];
    if (Array.isArray(json)) {
      resultData = json;
    } else if (Array.isArray(json.data)) {
      resultData = json.data;
    } else if (Array.isArray(json.items)) {
      resultData = json.items;
    } else if (json.data && Array.isArray(json.data.items)) {
      resultData = json.data.items;
    }
    return { success: true, data: resultData };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { success: false, data: [] };
  }
}

export async function getHeroSlides() {
  return fetchServerData('/public/homepage-banners', 60);
}

export async function getFeaturedShows() {
  return fetchServerData('/public/events/upcoming', 60); // Optionally add ?featured=true
}

export async function getFeaturedPhotos() {
  return fetchServerData('/public/media/photos?featured=true&limit=8', 60);
}

export async function getFeaturedVideos() {
  return fetchServerData('/public/media/videos?featured=true&limit=8', 60);
}

export async function getFeaturedJudges() {
  return fetchServerData('/public/judges?limit=8', 60);
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
  // Removed NEXT_PHASE check to allow Next.js to fetch data during static generation

  // Defensive check against invalid dynamic params
  if (endpoint.includes('/undefined') || endpoint.includes('/null')) {
    console.warn(`[server-api] Blocked invalid fetch request to: ${endpoint}`);
    return { success: false, data: null };
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

export async function getPublicAlbumsAPI() {
  return fetchServerData('/public/gallery/albums?limit=6', 60);
}
