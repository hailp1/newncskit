import { create } from 'zustand'

interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'register'
  openLogin: () => void
  openRegister: () => void
  close: () => void
  setMode: (mode: 'login' | 'register') => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',
  openLogin: () => set({ isOpen: true, mode: 'login' }),
  openRegister: () => set({ isOpen: true, mode: 'register' }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}))
