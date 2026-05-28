import { create } from 'zustand';
import { User } from '../types';
import { authApi, saveToken, removeToken, getToken } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    await saveToken(data.token);
    set({
      token: data.token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        photoUrl: data.photoUrl,
        matricula: data.matricula,
        subject: data.subject,
        isAiEnabled: data.isAiEnabled,
        isAdmin: data.isAdmin,
      },
      isAuthenticated: true,
    });
  },

  register: async (name, email, password, role) => {
    const data = await authApi.register(name, email, password, role);
    await saveToken(data.token);
    set({
      token: data.token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        photoUrl: data.photoUrl,
        matricula: data.matricula,
        subject: data.subject,
        isAiEnabled: data.isAiEnabled,
        isAdmin: data.isAdmin,
      },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await removeToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await authApi.me();
      set({
        token,
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          photoUrl: data.photoUrl,
          matricula: data.matricula,
          subject: data.subject,
          isAiEnabled: data.isAiEnabled,
          isAdmin: data.isAdmin,
        },
        isAuthenticated: true,
      });
    } catch {
      await removeToken();
    } finally {
      set({ isLoading: false });
    }
  },
}));
