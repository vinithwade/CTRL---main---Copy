import { create } from 'zustand';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signOutUser, 
  getCurrentUser,
  createOrUpdateUser
} from '@/lib/firebase/config';
import { User } from 'firebase/auth';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  providerId?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  isLoading: false,
  error: null,

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, userData } = await signUpWithEmail(email, password);
      set({ user, userData, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, userData } = await signInWithEmail(email, password);
      set({ user, userData, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user, userData } = await signInWithGoogle();
      set({ user, userData, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOutUser();
      set({ user: null, userData: null, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await getCurrentUser();
      if (user) {
        const userData = await createOrUpdateUser(user);
        set({ user, userData, isLoading: false });
      } else {
        set({ user: null, userData: null, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, userData: null, isLoading: false });
    }
  },
})); 