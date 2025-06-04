"use client";

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, User, Unsubscribe } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-PLACEHOLDER',
};

// Validate Firebase configuration to check if it's properly set up
const isFirebaseConfigValid = Object.values(firebaseConfig).every(
  (value) => {
    if (typeof value === 'string') {
      return value !== "" && !value.includes("placeholder");
    }
    return true;
  }
);

// Initialize Firebase safely
let app;
let auth: Auth;
let db: Firestore;

// Create mock Firebase implementations for development
const createMockAuth = () => {
  console.log('Using mock Firebase Auth implementation for development');
  
  return {
    currentUser: null,
    onAuthStateChanged: (callback: (user: User | null) => void): Unsubscribe => {
      // Create a mock user to simulate being logged in
      const mockUser = {
        uid: 'demo-user-123',
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: null
      } as User;
      
      // Call with mock user to simulate logged in
      setTimeout(() => callback(mockUser), 100);
      return () => {};
    },
    createUserWithEmailAndPassword: () => {
      return Promise.reject(new Error('Firebase Auth is in mock mode. Please configure valid Firebase credentials.'));
    },
    signInWithEmailAndPassword: () => {
      return Promise.reject(new Error('Firebase Auth is in mock mode. Please configure valid Firebase credentials.'));
    },
    signInWithPopup: () => {
      return Promise.reject(new Error('Firebase Auth is in mock mode. Please configure valid Firebase credentials.'));
    },
    signOut: () => Promise.resolve(),
    unsubscribe: () => {}
  } as unknown as Auth;
};

const createMockFirestore = () => {
  console.log('Using mock Firebase implementation for development');
  
  // Create a proper mock that returns the same object types that Firestore expects
  // Using any here is necessary for the mock implementation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockFirestore = {} as any;
  
  // Mock storage for document data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockData: Record<string, any> = {};
  
  // Create a mock collection reference constructor
  const mockCollectionReference = (path: string) => {
    // This object represents a CollectionReference
    const collectionRef = {
      id: path.split('/').pop(),
      path: path,
      
      // Collection methods
      doc: (docId?: string) => {
        const docPath = docId ? `${path}/${docId}` : `${path}/${Math.random().toString(36).substring(2, 15)}`;
        return mockDocumentReference(docPath);
      },
      
      // Query methods
      where: () => {
        return {
          ...collectionRef,
          orderBy: () => ({
            ...collectionRef,
            get: () => Promise.resolve({
              docs: [],
              // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
              forEach: (_callback: (doc: any) => void) => {},
              empty: true,
              size: 0
            })
          }),
          get: () => Promise.resolve({
            docs: [],
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            forEach: (_callback: (doc: any) => void) => {},
            empty: true,
            size: 0
          })
        };
      },
      
      orderBy: () => ({
        ...collectionRef,
        get: () => Promise.resolve({
          docs: [],
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          forEach: (_callback: (doc: any) => void) => {},
          empty: true,
          size: 0
        })
      }),
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      add: (data: any) => {
        const newId = Math.random().toString(36).substring(2, 15);
        const docRef = mockDocumentReference(`${path}/${newId}`);
        // Store the data in a mock document
        mockData[docRef.path] = { ...data, id: newId };
        return Promise.resolve(docRef);
      },
      
      get: () => Promise.resolve({
        docs: [],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        forEach: (_callback: (doc: any) => void) => {},
        empty: true,
        size: 0
      })
    };
    
    return collectionRef;
  };
  
  // Create a mock document reference constructor
  const mockDocumentReference = (path: string) => {
    // This object represents a DocumentReference
    return {
      id: path.split('/').pop(),
      path: path,
      
      // Document methods
      collection: (collectionPath: string) => {
        return mockCollectionReference(`${path}/${collectionPath}`);
      },
      
      get: () => Promise.resolve({
        exists: mockData[path] !== undefined,
        id: path.split('/').pop(),
        data: () => mockData[path] || {
          name: 'Mock Document',
          description: 'This is a mock document'
        },
        ref: {
          path: path
        }
      }),
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: (data: any) => {
        mockData[path] = data;
        return Promise.resolve();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: (data: any) => {
        mockData[path] = { ...(mockData[path] || {}), ...data };
        return Promise.resolve();
      },
      delete: () => {
        delete mockData[path];
        return Promise.resolve();
      }
    };
  };
  
  // Attach the primary methods to the Firestore mock
  mockFirestore.collection = (collectionPath: string) => {
    return mockCollectionReference(collectionPath);
  };
  
  mockFirestore.doc = (docPath: string) => {
    return mockDocumentReference(docPath);
  };
  
  // Return the mock with the correct type
  return mockFirestore as Firestore;
};

// Use mock implementations by default in development or when config is invalid
if (!isFirebaseConfigValid || process.env.NODE_ENV === 'development') {
  console.log('Using mock Firebase implementation for development');
  auth = createMockAuth() as Auth;
  db = createMockFirestore() as Firestore;
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Using mock Firebase implementation instead');
    
    // Use mock implementations as fallback
    auth = createMockAuth() as Auth;
    db = createMockFirestore() as Firestore;
  }
}

export { app, auth, db, isFirebaseConfigValid }; 