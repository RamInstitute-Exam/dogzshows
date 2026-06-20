import { create } from 'zustand';

export type AuthView =
  | 'LOGIN'
  | 'REGISTER'
  | 'MOBILE_OTP'
  | 'EMAIL_OTP'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD';

interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  openModal: (view?: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'LOGIN',
  openModal: (view = 'LOGIN') => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
