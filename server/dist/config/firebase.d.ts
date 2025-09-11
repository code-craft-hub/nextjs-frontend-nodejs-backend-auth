declare class FirebaseAdmin {
    private static instance;
    private app;
    private constructor();
    static getInstance(): FirebaseAdmin;
    getAuth(): import("firebase-admin/auth").Auth;
    getFirestore(): FirebaseFirestore.Firestore;
}
export declare const firebaseAdmin: FirebaseAdmin;
export declare const auth: import("firebase-admin/auth").Auth;
export declare const db: FirebaseFirestore.Firestore;
export {};
//# sourceMappingURL=firebase.d.ts.map