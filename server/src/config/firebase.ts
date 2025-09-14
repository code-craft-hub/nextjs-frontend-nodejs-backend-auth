import { initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseCert } from "./firebase-cert";

class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private app: App;

  private constructor() {
    this.app = initializeApp({
      credential: cert(firebaseCert),
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
