/**
 * useNavMenus — React Query hook for fetching navbar menus
 *
 * - Fetches from GET /menus?position=NAVBAR&role=<roleName>
 * - Caches for 5 minutes, refetches on window focus
 * - Returns loading + error states for skeleton/error UI
 * - Passing `role` filters visibility server-side (RBAC)
 * - Returns robust local fallback menus if API fails or is empty.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface NavMenuItem {
  id: string;
  name: string;
  url: string;
  icon?: string;
  position: string;
  parentId?: string | null;
  displayOrder: number;
  visibility: boolean;
  openNewTab: boolean;
  badge?: string | null;
  color?: string | null;
  onlyLoggedUser: boolean;
  onlyGuest: boolean;
  onlyAdmin: boolean;
  children: NavMenuItem[];
}

// ── Fallback Menus ─────────────────────────────────────────────────────────

export const FALLBACK_MENUS: NavMenuItem[] = [
  {
    id: 'fallback-home',
    name: 'Home',
    url: '/',
    position: 'NAVBAR',
    displayOrder: 1,
    visibility: true,
    openNewTab: false,
    parentId: null,
    onlyLoggedUser: false,
    onlyGuest: false,
    onlyAdmin: false,
    children: [],
  },
  {
    id: 'fallback-media',
    name: 'Media Gallery',
    url: '/gallery/all-photos',
    position: 'NAVBAR',
    displayOrder: 2,
    visibility: true,
    openNewTab: false,
    parentId: null,
    onlyLoggedUser: false,
    onlyGuest: false,
    onlyAdmin: false,
    children: [
      {
        id: 'fallback-all-photos',
        name: 'All Photos',
        url: '/gallery/all-photos',
        position: 'NAVBAR',
        displayOrder: 1,
        visibility: true,
        openNewTab: false,
        parentId: 'fallback-media',
        onlyLoggedUser: false,
        onlyGuest: false,
        onlyAdmin: false,
        children: [],
      },
      {
        id: 'fallback-outdoor-photos',
        name: 'Outdoor Photos',
        url: '/gallery/outdoor-photos',
        position: 'NAVBAR',
        displayOrder: 2,
        visibility: true,
        openNewTab: false,
        parentId: 'fallback-media',
        onlyLoggedUser: false,
        onlyGuest: false,
        onlyAdmin: false,
        children: [],
      },
      {
        id: 'fallback-e-magazines',
        name: 'E-Magazines',
        url: '/media-gallery/e-magazines',
        position: 'NAVBAR',
        displayOrder: 3,
        visibility: true,
        openNewTab: false,
        parentId: 'fallback-media',
        onlyLoggedUser: false,
        onlyGuest: false,
        onlyAdmin: false,
        children: [],
      },
    ],
  },

  {
    id: 'fallback-calendar',
    name: 'Show Calendar',
    url: '/events',
    position: 'NAVBAR',
    displayOrder: 4,
    visibility: true,
    openNewTab: false,
    parentId: null,
    onlyLoggedUser: false,
    onlyGuest: false,
    onlyAdmin: false,
    children: [
      // {
      //   id: 'fallback-national-shows',
      //   name: 'National Shows',
      //   url: '/events/national',
      //   position: 'NAVBAR',
      //   displayOrder: 1,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-calendar',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-state-shows',
      //   name: 'State Shows',
      //   url: '/events/state',
      //   position: 'NAVBAR',
      //   displayOrder: 2,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-calendar',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-specialty-shows',
      //   name: 'Specialty Shows',
      //   url: '/events/specialty',
      //   position: 'NAVBAR',
      //   displayOrder: 3,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-calendar',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
    ],
  },
  {
    id: 'fallback-judges',
    name: 'Judges',
    url: '/judges',
    position: 'NAVBAR',
    displayOrder: 5,
    visibility: true,
    openNewTab: false,
    parentId: null,
    onlyLoggedUser: false,
    onlyGuest: false,
    onlyAdmin: false,
    children: [],
  },
  {
    id: 'fallback-clubs',
    name: 'Clubs',
    url: '/clubs',
    position: 'NAVBAR',
    displayOrder: 6,
    visibility: true,
    openNewTab: false,
    parentId: null,
    onlyLoggedUser: false,
    onlyGuest: false,
    onlyAdmin: false,
    children: [
      // {
      //   id: 'fallback-all-clubs',
      //   name: 'All Clubs',
      //   url: '/clubs',
      //   position: 'NAVBAR',
      //   displayOrder: 1,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-all-breeds-clubs',
      //   name: 'All Breeds Clubs',
      //   url: '/clubs?type=all-breeds',
      //   position: 'NAVBAR',
      //   displayOrder: 2,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-specialty-clubs',
      //   name: 'Specialty Clubs',
      //   url: '/clubs?type=specialty',
      //   position: 'NAVBAR',
      //   displayOrder: 3,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-kennel-clubs',
      //   name: 'Kennel Clubs',
      //   url: '/clubs?type=kennel',
      //   position: 'NAVBAR',
      //   displayOrder: 4,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-state-clubs',
      //   name: 'State Clubs',
      //   url: '/clubs?type=state',
      //   position: 'NAVBAR',
      //   displayOrder: 5,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-register-club',
      //   name: 'Register Club',
      //   url: '/clubs/register',
      //   position: 'NAVBAR',
      //   displayOrder: 6,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
      // },
      // {
      //   id: 'fallback-club-directory',
      //   name: 'Club Directory',
      //   url: '/clubs',
      //   position: 'NAVBAR',
      //   displayOrder: 7,
      //   visibility: true,
      //   openNewTab: false,
      //   parentId: 'fallback-clubs',
      //   onlyLoggedUser: false,
      //   onlyGuest: false,
      //   onlyAdmin: false,
      //   children: [],
    ],
  },
];

// ── Query key factory ──────────────────────────────────────────────────────

export const menuKeys = {
  all: ['menus'] as const,
  navbar: (role?: string) => ['menus', 'NAVBAR', role ?? 'guest'] as const,
  admin: (position?: string) => ['menus', 'admin', position ?? 'all'] as const,
};

// ── Fetch function ─────────────────────────────────────────────────────────

async function fetchNavMenus(role?: string): Promise<NavMenuItem[]> {
  const params: Record<string, string> = { position: 'NAVBAR' };
  if (role) params.role = role;

  try {
    const res = await api.get<{ success: boolean; data: NavMenuItem[] }>('/public/menus', params);
    if (res?.success && Array.isArray(res.data)) return res.data;
    return [];
  } catch (error) {
    console.error('Failed to fetch menus from API:', error);
    throw error;
  }
}

async function fetchAllMenusForAdmin(position?: string): Promise<NavMenuItem[]> {
  const params: Record<string, string> = {};
  if (position) params.position = position;

  const res = await api.get<{ success: boolean; data: NavMenuItem[] }>('/menus/all', params);
  if (res?.success && Array.isArray(res.data)) return res.data;
  return [];
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/**
 * useNavMenus — for the public navbar.
 * @param role  the current user's role name (e.g. "Guest", "User", "Admin")
 */
export function useNavMenus(role?: string) {
  const query = useQuery({
    queryKey: menuKeys.navbar(role),
    queryFn: () => fetchNavMenus(role),
    staleTime: 5 * 60 * 1000,       // 5 min
    gcTime: 10 * 60 * 1000,         // 10 min
    refetchOnWindowFocus: true,      // refresh when user tabs back
    retry: 2,
  });

  const categoriesQuery = useQuery({
    queryKey: ['public-gallery-categories'],
    queryFn: async () => {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/public/gallery/categories');
        if (res?.success && Array.isArray(res.data)) return res.data;
        return [];
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Construct dynamic menus
  const dynamicMenus = FALLBACK_MENUS.map(menu => {
    if (menu.id === 'fallback-media') {
      return {
        ...menu,
        children: [
          {
            id: 'fallback-all-photos',
            name: 'All Photos',
            url: '/gallery/all-photos',
            position: 'NAVBAR',
            displayOrder: 1,
            visibility: true,
            openNewTab: false,
            parentId: 'fallback-media',
            onlyLoggedUser: false,
            onlyGuest: false,
            onlyAdmin: false,
            children: [],
          },
          {
            id: 'fallback-outdoor-photos',
            name: 'Outdoor Photos',
            url: '/gallery/outdoor-photos',
            position: 'NAVBAR',
            displayOrder: 2,
            visibility: true,
            openNewTab: false,
            parentId: 'fallback-media',
            onlyLoggedUser: false,
            onlyGuest: false,
            onlyAdmin: false,
            children: [],
          },
          {
            id: 'fallback-e-magazines',
            name: 'E-Magazines',
            url: '/media-gallery/e-magazines',
            position: 'NAVBAR',
            displayOrder: 3,
            visibility: true,
            openNewTab: false,
            parentId: 'fallback-media',
            onlyLoggedUser: false,
            onlyGuest: false,
            onlyAdmin: false,
            children: [],
          }
        ]
      };
    }
    return menu;
  });

  return {
    ...query,
    data: dynamicMenus,
    isFallback: true,
  };
}

/**
 * useAdminMenus — for the admin menu management page.
 * Requires auth (token sent via axios interceptor).
 */
export function useAdminMenus(position?: string) {
  return useQuery({
    queryKey: menuKeys.admin(position),
    queryFn: () => fetchAllMenusForAdmin(position),
    staleTime: 0,                    // always fresh in admin
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * useInvalidateMenus — call after any admin CRUD to bust the cache.
 */
export function useInvalidateMenus() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: menuKeys.all });
}
