import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setMockRole: (role: string) => set({ 
        user: { id: 'mock-1', email: 'mock@juzdog.com', firstName: role, lastName: 'User', roles: [role] },
        isAuthenticated: true 
      }),
    }),
    {
      name: 'juzdog-auth-storage',
    }
  )
);
