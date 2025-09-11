import { initializeApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;

  private constructor() {
    this.app = initializeApp({
      credential: cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID!,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
        private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"), // Handle escaped newlines
        client_email: process.env.FIREBASE_CLIENT_EMAIL!,
        client_id: process.env.FIREBASE_CLIENT_ID!,
        auth_uri:
          process.env.FIREBASE_AUTH_URI ||
          "https://accounts.google.com/o/oauth2/auth",
        token_uri:
          process.env.FIREBASE_TOKEN_URI ||
          "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
        universe_domain:
          process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
      } as ServiceAccount),
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
