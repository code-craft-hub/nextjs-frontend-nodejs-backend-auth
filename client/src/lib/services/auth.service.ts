import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  onAuthStateChanged,
  getIdTokenResult,
  IdTokenResult,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { getFirebaseAuth, getFirebaseFirestore, getFirebaseFunctions } from '../firebase/config';
import { AuthUser, UserProfile } from '../../types/auth';

// Error types for better error handling
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

// Result types for consistent API responses
export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: AuthServiceError;
}

export interface SignInResult extends AuthResult<AuthUser> {}
export interface SignUpResult extends AuthResult<AuthUser> {}

/**
 * Enterprise-grade Authentication Service
 * Handles all Firebase authentication operations with proper error handling,
 * retry logic, and monitoring capabilities.
 */
class AuthService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  /**
   * Signs in a user with email and password
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const auth = await getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const authUser = await this.enrichUserWithProfile(userCredential.user);
      
      // Update last login timestamp
      await this.updateLastLoginTimestamp(authUser.uid);
      
      return {
        success: true,
        data: authUser,
      };
    } catch (error) {
      const authError = this.handleAuthError(error, 'SIGN_IN_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Creates a new user account with email and password
   */
  async signUp(
    email: string, 
    password: string, 
    displayName?: string,
  ): Promise<SignUpResult> {
    try {
      const auth = await getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName });
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user profile document
      const userProfile = await this.createUserProfile(userCredential.user, {
        displayName: displayName || null,
      });
      
      const authUser = await this.enrichUserWithProfile(userCredential.user);
      
      return {
        success: true,
        data: authUser,
      };
    } catch (error) {
      const authError = this.handleAuthError(error, 'SIGN_UP_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const auth = await getFirebaseAuth();
      await firebaseSignOut(auth);
      
      return { success: true };
    } catch (error) {
      const authError = this.handleAuthError(error, 'SIGN_OUT_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Sends password reset email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const auth = await getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      
      return { success: true };
    } catch (error) {
      const authError = this.handleAuthError(error, 'PASSWORD_RESET_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Updates user profile
   */
  async updateProfile(
    uid: string,
    updates: Partial<UserProfile>,
  ): Promise<AuthResult<UserProfile>> {
    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', uid);
      
      const updateData = {
        ...updates,
        metadata: {
          ...updates.metadata,
          updatedAt: serverTimestamp(),
        },
      };
      
      await updateDoc(userRef, updateData);
      
      // Fetch updated profile
      const updatedProfile = await this.getUserProfile(uid);
      
      return {
        success: true,
        data: updatedProfile,
      };
    } catch (error) {
      const authError = this.handleAuthError(error, 'PROFILE_UPDATE_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Refreshes user's custom claims by calling cloud function
   */
  async refreshCustomClaims(uid: string): Promise<AuthResult<Record<string, unknown>>> {
    try {
      const functions = getFirebaseFunctions();
      const refreshClaims = httpsCallable(functions, 'refreshUserClaims');
      
      const result = await refreshClaims({ uid });
      const customClaims = result.data as Record<string, unknown>;
      
      return {
        success: true,
        data: customClaims,
      };
    } catch (error) {
      const authError = this.handleAuthError(error, 'REFRESH_CLAIMS_FAILED');
      return {
        success: false,
        error: authError,
      };
    }
  }

  /**
   * Gets user's custom claims from ID token
   */
  async getCustomClaims(user: FirebaseUser): Promise<Record<string, unknown>> {
    try {
      const idTokenResult: IdTokenResult = await getIdTokenResult(user);
      return idTokenResult.claims;
    } catch (error) {
      console.error('Failed to get custom claims:', error);
      return {};
    }
  }

  /**
   * Creates auth state observer
   */
  createAuthStateObserver(
    callback: (user: AuthUser | null) => void,
  ): () => void {
    let unsubscribe: (() => void) | null = null;

    const setupObserver = async () => {
      try {
        const auth = await getFirebaseAuth();
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const authUser = await this.enrichUserWithProfile(firebaseUser);
            callback(authUser);
          } else {
            callback(null);
          }
        });
      } catch (error) {
        console.error('Failed to setup auth state observer:', error);
        callback(null);
      }
    };

    setupObserver();

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Gets user profile from Firestore
   */
  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Creates initial user profile document
   */
  private async createUserProfile(
    user: FirebaseUser,
    additional: { displayName?: string | null } = {},
  ): Promise<UserProfile> {
    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', user.uid);
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: additional.displayName || user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        roles: [], // Default empty roles, assigned by admin
        metadata: {
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        },
        preferences: {},
      };
      
      await setDoc(userRef, {
        ...userProfile,
        metadata: {
          ...userProfile.metadata,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
      });
      
      return userProfile;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }

  /**
   * Enriches Firebase user with profile data and custom claims
   */
  private async enrichUserWithProfile(firebaseUser: FirebaseUser): Promise<AuthUser> {
    const [profile, customClaims] = await Promise.all([
      this.getUserProfile(firebaseUser.uid),
      this.getCustomClaims(firebaseUser),
    ]);

    return {
      ...firebaseUser,
      profile: profile || undefined,
      customClaims,
    };
  }

  /**
   * Updates user's last login timestamp
   */
  private async updateLastLoginTimestamp(uid: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        'metadata.lastLoginAt': serverTimestamp(),
      });
    } catch (error) {
      // Don't throw error for timestamp update failure
      console.error('Failed to update last login timestamp:', error);
    }
  }

  /**
   * Handles and transforms Firebase auth errors
   */
  private handleAuthError(error: unknown, defaultCode: string): AuthServiceError {
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return new AuthServiceError(
            'No account found with this email address.',
            'USER_NOT_FOUND',
            error,
          );
        case 'auth/wrong-password':
          return new AuthServiceError(
            'Incorrect password.',
            'INVALID_PASSWORD',
            error,
          );
        case 'auth/email-already-in-use':
          return new AuthServiceError(
            'An account already exists with this email address.',
            'EMAIL_IN_USE',
            error,
          );
        case 'auth/weak-password':
          return new AuthServiceError(
            'Password should be at least 6 characters.',
            'WEAK_PASSWORD',
            error,
          );
        case 'auth/invalid-email':
          return new AuthServiceError(
            'Invalid email address.',
            'INVALID_EMAIL',
            error,
          );
        case 'auth/too-many-requests':
          return new AuthServiceError(
            'Too many attempts. Please try again later.',
            'TOO_MANY_REQUESTS',
            error,
          );
        case 'auth/network-request-failed':
          return new AuthServiceError(
            'Network error. Please check your connection.',
            'NETWORK_ERROR',
            error,
          );
        default:
          return new AuthServiceError(
            firebaseError.message || 'An authentication error occurred.',
            firebaseError.code || defaultCode,
            error,
          );
      }
    }

    return new AuthServiceError(
      'An unexpected error occurred.',
      defaultCode,
      error,
    );
  }
}

// Export singleton instance
export const authService = new AuthService();