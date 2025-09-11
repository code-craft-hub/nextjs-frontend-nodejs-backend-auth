"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = exports.firebaseAdmin = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
class FirebaseAdmin {
    constructor() {
        this.app = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI ||
                    "https://accounts.google.com/o/oauth2/auth",
                token_uri: process.env.FIREBASE_TOKEN_URI ||
                    "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
                    "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
                universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
            }),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }
    static getInstance() {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
        }
        return FirebaseAdmin.instance;
    }
    getAuth() {
        return (0, auth_1.getAuth)(this.app);
    }
    getFirestore() {
        return (0, firestore_1.getFirestore)(this.app);
    }
}
exports.firebaseAdmin = FirebaseAdmin.getInstance();
exports.auth = exports.firebaseAdmin.getAuth();
exports.db = exports.firebaseAdmin.getFirestore();
//# sourceMappingURL=firebase.js.map