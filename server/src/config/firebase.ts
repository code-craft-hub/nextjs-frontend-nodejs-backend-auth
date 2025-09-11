import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;

  private constructor() {
    this.app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  getAuth() {
    return getAuth(this.app);
  }

  getFirestore() {
    return getFirestore(this.app);
  }
}

export const firebaseAdmin = FirebaseAdmin.getInstance();
export const auth = firebaseAdmin.getAuth();
export const db = firebaseAdmin.getFirestore();

// Firestore Security Rules (firestore.rules)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        hasRole(['admin', 'super_admin']);
    }
    
    // Roles collection - admin only
    match /roles/{roleId} {
      allow read, write: if request.auth != null && 
        hasRole(['admin', 'super_admin']);
    }
    
    // Sessions collection - user can only access their own sessions
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        hasRole(['admin', 'super_admin']);
    }
    
    // Audit logs - admin only
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
        hasRole(['admin', 'super_admin']);
      allow write: if false; // Only server can write audit logs
    }
    
    // Helper function to check user roles
    function hasRole(roles) {
      return request.auth != null && 
        request.auth.token.roles != null &&
        request.auth.token.roles.hasAny(roles);
    }
    
    // Helper function to check permissions
    function hasPermission(permission) {
      return request.auth != null && 
        request.auth.token.permissions != null &&
        permission in request.auth.token.permissions;
    }
  }
}
*/