import { create } from 'zustand';
import { auth, db, isFirebaseConfigValid } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../utils';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  
  // Methods
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserProfile: (uid: string) => Promise<UserData | null>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isDemoMode: !isFirebaseConfigValid,

  signUp: async (email: string, password: string, displayName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (!isFirebaseConfigValid || process.env.NODE_ENV === 'development') {
        console.log('Creating demo user in development mode');
        // Create a demo user without Firebase
        const demoUser: UserData = {
          uid: 'demo-user-' + Date.now(),
          email,
          displayName,
          photoURL: null,
          role: 'developer', // Default role
        };
        
        // Set a timeout to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
        
        return;
      }
      
      // Only try to use Firebase if config is valid
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;
        
        // Create user profile
        const userData: UserData = {
          uid,
          email,
          displayName,
          photoURL: null,
          role: 'developer', // Default role
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', uid), userData);
        
        set({ 
          user: userData,
          isLoading: false,
          error: null
        });
      } catch (firebaseError) {
        console.error('Firebase Auth error:', firebaseError);
        // Fall back to demo mode if Firebase auth fails
        const demoUser: UserData = {
          uid: 'demo-user-' + Date.now(),
          email,
          displayName,
          photoURL: null,
          role: 'developer', // Default role
        };
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (!isFirebaseConfigValid || process.env.NODE_ENV === 'development') {
        console.log('Signing in with demo user');
        // Create a demo user without Firebase
        const demoUser: UserData = {
          uid: 'demo-user-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: 'developer', // Default role
        };
        
        // Set a timeout to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
        
        return;
      }
      
      // Only try to use Firebase if config is valid
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userData = await get().getUserProfile(userCredential.user.uid);
        
        set({ 
          user: userData,
          isLoading: false,
          error: null
        });
      } catch (firebaseError) {
        console.error('Firebase Auth error:', firebaseError);
        // Fall back to demo mode if Firebase auth fails
        const demoUser: UserData = {
          uid: 'demo-user-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: 'developer',
        };
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if in demo mode
      if (!isFirebaseConfigValid || process.env.NODE_ENV === 'development') {
        console.log('Signing in with demo Google user');
        // Create a demo user without Firebase
        const demoUser: UserData = {
          uid: 'demo-google-user-' + Date.now(),
          email: 'demo-google-user@example.com',
          displayName: 'Demo Google User',
          photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocLOxjBXhIhmMfa-LYYOxP4xbHXkR88nPjnSwjm8HKEV=s96-c',
          role: 'developer', // Default role
        };
        
        // Set a timeout to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
        
        return;
      }
      
      // Only try to use Firebase if config is valid
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const { uid, email, displayName, photoURL } = userCredential.user;
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (!userDoc.exists()) {
          // Create new user profile
          const userData: UserData = {
            uid,
            email,
            displayName,
            photoURL,
            role: 'developer', // Default role
          };
          
          await setDoc(doc(db, 'users', uid), userData);
          set({ user: userData });
        } else {
          set({ user: userDoc.data() as UserData });
        }
        
        set({ isLoading: false, error: null });
      } catch (firebaseError) {
        console.error('Firebase Auth error:', firebaseError);
        // Fall back to demo mode if Firebase auth fails
        const demoUser: UserData = {
          uid: 'demo-google-user-' + Date.now(),
          email: 'demo-google-user@example.com',
          displayName: 'Demo Google User',
          photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocLOxjBXhIhmMfa-LYYOxP4xbHXkR88nPjnSwjm8HKEV=s96-c',
          role: 'developer',
        };
        
        set({
          user: demoUser,
          isLoading: false,
          error: null,
          isDemoMode: true
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      // Only call Firebase signOut if not in demo mode
      if (!get().isDemoMode) {
        await firebaseSignOut(auth);
      }
      set({ user: null, error: null });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: errorMessage });
      throw error;
    }
  },

  getUserProfile: async (uid: string): Promise<UserData | null> => {
    try {
      // Return mock data for demo mode
      if (get().isDemoMode) {
        return {
          uid,
          email: 'demo@example.com',
          displayName: 'Demo User',
          photoURL: null,
          role: 'developer'
        };
      }
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;
      
      return userDoc.data() as UserData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  checkAuth: () => {
    // If in demo mode, don't try to check auth
    if (get().isDemoMode) {
      set({ isLoading: false });
      return;
    }
    
    try {
      // This will trigger the auth state listener below
      // If Firebase is not properly configured, this will fail gracefully
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        const { getUserProfile } = get();
        
        if (user) {
          const userData = await getUserProfile(user.uid);
          set({ user: userData, isLoading: false });
        } else {
          set({ user: null, isLoading: false });
        }
        
        unsubscribe(); // Only check once when explicitly called
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isLoading: false, isDemoMode: true });
    }
  }
}));

// Set up initial auth state listener
if (typeof window !== 'undefined') {
  try {
    // Only set up auth listener if not in demo mode
    if (!isFirebaseConfigValid) {
      console.log('Firebase config is invalid. Running in demo mode.');
      useAuthStore.setState({ isDemoMode: true, isLoading: false });
    } else {
      onAuthStateChanged(auth, async (user) => {
        const { getUserProfile } = useAuthStore.getState();
        
        if (user) {
          const userData = await getUserProfile(user.uid);
          useAuthStore.setState({ user: userData, isLoading: false });
        } else {
          useAuthStore.setState({ user: null, isLoading: false });
        }
      });
    }
  } catch (error) {
    console.error('Initial auth state listener error:', error);
    useAuthStore.setState({ isLoading: false, isDemoMode: true });
  }
} 