import { UserRecord } from "firebase-admin/auth";
import { auth, db } from "../config/firebase";

export interface CreateUserData {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  password?: string;
  displayName?: string;
  photoURL?: string;
  disabled?: boolean;
}

export interface UpdateUserData {
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  password?: string;
  displayName?: string | null;
  photoURL?: string | null;
  disabled?: boolean;
}

export interface UserIdentifier {
  uid?: string;
  email?: string;
  phoneNumber?: string;
  providerId?: string;
  providerUid?: string;
}

export interface ListUsersOptions {
  maxResults?: number;
  pageToken?: string;
}

export class UserService {
  /**
   * Get user by UID
   */
  async getUserById(uid: string): Promise<UserRecord> {
    try {
      const userRecord = await auth.getUser(uid);
      return userRecord;
    } catch (error) {
      console.error("Error fetching user by UID:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserRecord> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      return userRecord;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord> {
    try {
      const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
      return userRecord;
    } catch (error) {
      console.error("Error fetching user by phone number:", error);
      throw error;
    }
  }

  /**
   * Bulk retrieve users by identifiers
   */
  async getUsers(identifiers: UserIdentifier[]) {
    try {
      const result = await auth.getUsers(identifiers);
      return {
        users: result.users,
        notFound: result.notFound,
      };
    } catch (error) {
      console.error("Error bulk fetching users:", error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<UserRecord> {
    try {
      const userRecord = await auth.createUser(userData);
      console.log("Successfully created new user:", userRecord.uid);
      return userRecord;
    } catch (error) {
      console.error("Error creating new user:", error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(uid: string, userData: UpdateUserData): Promise<UserRecord> {
    try {
      const userRecord = await auth.updateUser(uid, userData);
      console.log("Successfully updated user:", uid);
      return userRecord;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      await auth.deleteUser(uid);
      console.log("Successfully deleted user:", uid);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Delete multiple users
   */
  async deleteUsers(uids: string[]) {
    try {
      const result = await auth.deleteUsers(uids);
      console.log(`Successfully deleted ${result.successCount} users`);
      console.log(`Failed to delete ${result.failureCount} users`);

      if (result.errors.length > 0) {
        result.errors.forEach((err) => {
          console.error("Delete error:", err.error);
        });
      }

      return {
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors,
      };
    } catch (error) {
      console.error("Error deleting multiple users:", error);
      throw error;
    }
  }

  /**
   * List all users with pagination
   */
  async listUsers(options: ListUsersOptions = {}) {
    try {
      const { maxResults = 1000, pageToken } = options;
      const result = await auth.listUsers(maxResults, pageToken);

      return {
        users: result.users,
        pageToken: result.pageToken,
        hasMore: !!result.pageToken,
      };
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  }

  /**
   * List all users (helper method that fetches all pages)
   */
  async listAllUsers(): Promise<UserRecord[]> {
    const allUsers: UserRecord[] = [];
    let pageToken: string | undefined;

    try {
      do {
        const result = await this.listUsers({ pageToken });
        allUsers.push(...result.users);
        pageToken = result.pageToken;
      } while (pageToken);

      return allUsers;
    } catch (error) {
      console.error("Error listing all users:", error);
      throw error;
    }
  }

  /**
   * Set custom user claims
   */
  async setCustomUserClaims(uid: string, customClaims: object): Promise<void> {
    try {
      await auth.setCustomUserClaims(uid, customClaims);
      console.log("Successfully set custom claims for user:", uid);
    } catch (error) {
      console.error("Error setting custom user claims:", error);
      throw error;
    }
  }

  /**
   * Verify ID token
   */
  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error("Error verifying ID token:", error);
      throw error;
    }
  }

  /**
   * Create custom token
   */
  async createCustomToken(
    uid: string,
    additionalClaims?: object
  ): Promise<string> {
    try {
      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error("Error creating custom token:", error);
      throw error;
    }
  }

  /**
   * Generate password reset link
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const link = await auth.generatePasswordResetLink(email);
      return link;
    } catch (error) {
      console.error("Error generating password reset link:", error);
      throw error;
    }
  }

  /**
   * Generate email verification link
   */
  async generateEmailVerificationLink(email: string): Promise<string> {
    try {
      const link = await auth.generateEmailVerificationLink(email);
      return link;
    } catch (error) {
      console.error("Error generating email verification link:", error);
      throw error;
    }
  }
}

export const userService = new UserService();

// Custom Token Services
export const createCustomToken = async (
  uid: string,
  additionalClaims?: object
): Promise<string> => {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw new Error("Failed to create custom token");
  }
};

// ID Token Verification Services
export const verifyIdToken = async (
  idToken: string,
  checkRevoked: boolean = false
): Promise<any> => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken, checkRevoked);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Failed to verify ID token");
  }
};

// Session Cookie Services
export const createSessionCookie = async (
  idToken: string,
  expiresIn: number = 60 * 60 * 24 * 5 * 1000
): Promise<string> => {
  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    return sessionCookie;
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw new Error("Failed to create session cookie");
  }
};

export const verifySessionCookie = async (
  sessionCookie: string,
  checkRevoked: boolean = false
): Promise<any> => {
  try {
    const decodedClaims = await auth.verifySessionCookie(
      sessionCookie,
      checkRevoked
    );
    return decodedClaims;
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    throw new Error("Failed to verify session cookie");
  }
};

// Token Revocation Services
export const revokeRefreshTokens = async (
  uid: string
): Promise<{ timestamp: number }> => {
  try {
    await auth.revokeRefreshTokens(uid);
    const userRecord = await auth.getUser(uid);
    const timestamp = userRecord.tokensValidAfterTime
      ? new Date(userRecord.tokensValidAfterTime).getTime() / 1000
      : new Date().getTime() / 1000;
    console.log(`Tokens revoked at: ${timestamp}`);
    return { timestamp };
  } catch (error) {
    console.error("Error revoking refresh tokens:", error);
    throw new Error("Failed to revoke refresh tokens");
  }
};

// Custom Claims Services
export const setCustomUserClaims = async (
  uid: string,
  customClaims: object
): Promise<void> => {
  try {
    await auth.setCustomUserClaims(uid, customClaims);
    console.log("Custom claims set successfully for user:", uid);
  } catch (error) {
    console.error("Error setting custom user claims:", error);
    throw new Error("Failed to set custom user claims");
  }
};

export const getUserCustomClaims = async (
  uid: string
): Promise<object | undefined> => {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord.customClaims;
  } catch (error) {
    console.error("Error getting user custom claims:", error);
    throw new Error("Failed to get user custom claims");
  }
};

export const addIncrementalCustomClaim = async (
  uid: string,
  newClaims: object
): Promise<void> => {
  try {
    const userRecord = await auth.getUser(uid);
    const currentCustomClaims = userRecord.customClaims || {};
    const updatedClaims = { ...currentCustomClaims, ...newClaims };

    await auth.setCustomUserClaims(uid, updatedClaims);
    console.log("Incremental custom claims added successfully for user:", uid);
  } catch (error) {
    console.error("Error adding incremental custom claims:", error);
    throw new Error("Failed to add incremental custom claims");
  }
};

// User Management Services
export const getUserByEmail = async (email: string): Promise<UserRecord> => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw new Error("Failed to get user by email");
  }
};

export const getUserById = async (uid: string): Promise<UserRecord> => {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw new Error("Failed to get user by ID");
  }
};

// Firestore Metadata Services
export const updateUserMetadata = async (
  uid: string,
  metadata: object
): Promise<void> => {
  try {
    const metadataRef = db.collection("metadata").doc(uid);
    await metadataRef.set(metadata, { merge: true });
    console.log("User metadata updated successfully");
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw new Error("Failed to update user metadata");
  }
};

export const getUserMetadata = async (uid: string): Promise<any> => {
  try {
    const metadataRef = db.collection("metadata").doc(uid);
    const doc = await metadataRef.get();

    if (doc.exists) {
      return doc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user metadata:", error);
    throw new Error("Failed to get user metadata");
  }
};

export const setTokenRevocationTime = async (
  uid: string,
  revokeTime: number
): Promise<void> => {
  try {
    const metadataRef = db.collection("metadata").doc(uid);
    await metadataRef.set({ revokeTime }, { merge: true });
    console.log("Token revocation time set successfully");
  } catch (error) {
    console.error("Error setting token revocation time:", error);
    throw new Error("Failed to set token revocation time");
  }
};

export const setRefreshTime = async (uid: string): Promise<void> => {
  try {
    const metadataRef = db.collection("metadata").doc(uid);
    await metadataRef.set(
      {
        refreshTime: new Date().getTime(),
      },
      { merge: true }
    );
    console.log("Refresh time set successfully");
  } catch (error) {
    console.error("Error setting refresh time:", error);
    throw new Error("Failed to set refresh time");
  }
};

// Security and Validation Services
export const validateUserForAdminClaims = async (
  email: string,
  emailVerified: boolean
): Promise<boolean> => {
  return email?.endsWith("@admin.example.com") && emailVerified;
};

export const isValidIpAddress = async (
  previousIpAddresses: string[],
  requestIpAddress: string
): Promise<boolean> => {
  // Implement your IP validation logic here
  // This is a placeholder implementation
  return previousIpAddresses.includes(requestIpAddress);
};

export const getPreviousUserIpAddresses = async (
  uid: string
): Promise<string[]> => {
  try {
    const userDoc = db.collection("userSessions").doc(uid);
    const doc = await userDoc.get();

    if (doc.exists) {
      const data = doc.data();
      return data?.ipAddresses || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting previous IP addresses:", error);
    throw new Error("Failed to get previous IP addresses");
  }
};

export const updateUserIpAddress = async (
  uid: string,
  ipAddress: string
): Promise<void> => {
  try {
    const userDoc = db.collection("userSessions").doc(uid);
    const doc = await userDoc.get();

    let ipAddresses: string[] = [];
    if (doc.exists) {
      const data = doc.data();
      ipAddresses = data?.ipAddresses || [];
    }

    if (!ipAddresses.includes(ipAddress)) {
      ipAddresses.push(ipAddress);
      // Keep only last 10 IP addresses
      if (ipAddresses.length > 10) {
        ipAddresses = ipAddresses.slice(-10);
      }
    }

    await userDoc.set(
      {
        ipAddresses,
        lastAccess: new Date().getTime(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating user IP address:", error);
    throw new Error("Failed to update user IP address");
  }
};
