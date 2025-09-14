import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Validate required environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

// Type-safe environment variable validation
const validateEnvVars = (): Record<string, string> => {
  const envVars: Record<string, string> = {};

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
    envVars[envVar] = value;
  }

  return envVars;
};

// Firebase configuration with error handling
const getFirebaseConfig = () => {
  try {
    const env = validateEnvVars();

    return {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      ...(env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
        measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      }),
    };
  } catch (error) {
    console.error("Firebase configuration error:", error);
    throw error;
  }
};

// Singleton pattern for Firebase app initialization
class FirebaseService {
  private app: FirebaseApp;
  private authInstance: Auth | null = null;
  private firestoreInstance: Firestore | null = null;

  constructor() {
    const config = getFirebaseConfig();

    // Use existing app if already initialized, otherwise create new one
    this.app = getApps().length === 0 ? initializeApp(config) : getApp();
  }

  // Lazy initialization of Auth with persistence configuration
  async getAuth(): Promise<Auth> {
    if (!this.authInstance) {
      this.authInstance = getAuth(this.app);

      // Set persistence strategy
      try {
        await setPersistence(this.authInstance, browserLocalPersistence);
      } catch (error) {
        console.warn("Failed to set auth persistence:", error);
      }
    }

    return this.authInstance;
  }

  // Lazy initialization of Firestore with advanced caching
  getFirestore(): Firestore {
    if (!this.firestoreInstance) {
      try {
        // Use advanced persistence settings for better performance
        this.firestoreInstance = initializeFirestore(this.app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch (error) {
        // Fallback to default initialization if advanced features fail
        console.warn(
          "Failed to initialize Firestore with advanced cache, falling back to default:",
          error
        );
        this.firestoreInstance = getFirestore(this.app);
      }

     
    }

    return this.firestoreInstance;
  }



  // Get the Firebase app instance
  getApp(): FirebaseApp {
    return this.app;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const auth = await this.getAuth();
      return !!auth;
    } catch (error) {
      console.error("Firebase health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

// Export convenient getters
export const getFirebaseAuth = () => firebaseService.getAuth();
export const getFirebaseFirestore = () => firebaseService.getFirestore();
export const getFirebaseApp = () => firebaseService.getApp();
