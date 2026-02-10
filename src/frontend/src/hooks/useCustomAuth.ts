import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ALLOWED_USERS = ['Aurelio', 'Ensar', 'Mohammed', 'Omar', 'Yassin', 'Steven'];

interface AuthState {
  username: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, isAdmin?: boolean) => boolean;
  logout: () => void;
}

export const useCustomAuth = create<AuthState>()(
  persist(
    (set) => ({
      username: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (username: string, isAdmin: boolean = false) => {
        if (!ALLOWED_USERS.includes(username)) {
          return false;
        }
        set({
          username,
          isAuthenticated: true,
          isAdmin,
        });
        return true;
      },
      logout: () => {
        set({
          username: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
