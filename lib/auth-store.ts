import { create } from 'zustand'

interface User {
  id: string
  email: string
  username: string
  avatar?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          username: email.split('@')[0],
          avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + email,
        }
        set({ user: mockUser, isAuthenticated: true })
      }
    } finally {
      set({ isLoading: false })
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },
}))
