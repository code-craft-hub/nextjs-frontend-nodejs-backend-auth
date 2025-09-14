import { Request, Response } from "express";
import {
  userService,
  CreateUserData,
  UpdateUserData,
  UserIdentifier,
} from "../services/1.user.service";

class UserController {
  /**
   * GET /api/users/:uid - Get user by UID
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: { message: "UID is required" },
        });
        return;
      }

      const user = await userService.getUserById(uid);

      res.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: {
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
              lastRefreshTime: user.metadata.lastRefreshTime,
            },
            customClaims: user.customClaims,
            providerData: user.providerData,
          },
        },
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * GET /api/users/email/:email - Get user by email
   */
  async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          error: { message: "Email is required" },
        });
        return;
      }

      const user = await userService.getUserByEmail(email);

      res.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          },
        },
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * GET /api/users/phone/:phoneNumber - Get user by phone number
   */
  async getUserByPhoneNumber(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.params;

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          error: { message: "Phone number is required" },
        });
        return;
      }

      const user = await userService.getUserByPhoneNumber(phoneNumber);

      res.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          },
        },
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users/bulk - Get multiple users by identifiers
   */
  async getUsers(req: Request, res: Response) {
    try {
      const { identifiers } = req.body as { identifiers: UserIdentifier[] };

      if (
        !identifiers ||
        !Array.isArray(identifiers) ||
        identifiers.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: {
            message: "Identifiers array is required and cannot be empty",
          },
        });
        return;
      }

      if (identifiers.length > 100) {
        res.status(400).json({
          success: false,
          error: { message: "Maximum 100 identifiers allowed per request" },
        });
        return;
      }

      const result = await userService.getUsers(identifiers);

      res.json({
        success: true,
        data: {
          users: result.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          })),
          notFound: result.notFound,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users - Create a new user
   */
  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;

      const user = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          },
        },
        message: "User created successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * PUT /api/users/:uid - Update a user
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const userData: UpdateUserData = req.body;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: { message: "UID is required" },
        });
        return;
      }

      const user = await userService.updateUser(uid, userData);

      res.json({
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          },
        },
        message: "User updated successfully",
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * DELETE /api/users/:uid - Delete a user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: { message: "UID is required" },
        });
        return;
      }

      await userService.deleteUser(uid);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * DELETE /api/users/bulk - Delete multiple users
   */
  async deleteUsers(req: Request, res: Response) {
    try {
      const { uids } = req.body as { uids: string[] };

      if (!uids || !Array.isArray(uids) || uids.length === 0) {
        res.status(400).json({
          success: false,
          error: { message: "UIDs array is required and cannot be empty" },
        });
        return;
      }

      const result = await userService.deleteUsers(uids);

      res.json({
        success: true,
        data: {
          successCount: result.successCount,
          failureCount: result.failureCount,
          errors: result.errors,
        },
        message: `Successfully deleted ${result.successCount} users, failed to delete ${result.failureCount} users`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * GET /api/users - List users with pagination
   */
  async listUsers(req: Request, res: Response) {
    try {
      const { maxResults, pageToken } = req.query;

      const options = {
        maxResults: maxResults ? parseInt(maxResults as string) : undefined,
        pageToken: pageToken as string,
      };

      const result = await userService.listUsers(options);

      res.json({
        success: true,
        data: {
          users: result.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData,
          })),
          pageToken: result.pageToken,
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * PUT /api/users/:uid/claims - Set custom user claims
   */
  async setCustomUserClaims(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const { customClaims } = req.body;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: { message: "UID is required" },
        });
        return;
      }

      if (!customClaims || typeof customClaims !== "object") {
        res.status(400).json({
          success: false,
          error: { message: "Custom claims object is required" },
        });
        return;
      }

      await userService.setCustomUserClaims(uid, customClaims);

      res.json({
        success: true,
        message: "Custom claims set successfully",
      });
    } catch (error: any) {
      res.status(error.code === "auth/user-not-found" ? 404 : 400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users/verify-token - Verify ID token
   */
  async verifyIdToken(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
          error: { message: "ID token is required" },
        });
        return;
      }

      const decodedToken = await userService.verifyIdToken(idToken);

      res.json({
        success: true,
        data: {
          decodedToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users/:uid/custom-token - Create custom token
   */
  async createCustomToken(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const { additionalClaims } = req.body;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: { message: "UID is required" },
        });
        return;
      }

      const customToken = await userService.createCustomToken(
        uid,
        additionalClaims
      );

      res.json({
        success: true,
        data: {
          customToken,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users/password-reset-link - Generate password reset link
   */
  async generatePasswordResetLink(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: { message: "Email is required" },
        });
        return;
      }

      const link = await userService.generatePasswordResetLink(email);

      res.json({
        success: true,
        data: {
          link,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }

  /**
   * POST /api/users/email-verification-link - Generate email verification link
   */
  async generateEmailVerificationLink(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: { message: "Email is required" },
        });
        return;
      }

      const link = await userService.generateEmailVerificationLink(email);

      res.json({
        success: true,
        data: {
          link,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
  }
}

export const userController = new UserController();

// ADDITIONAL FIREBASE AUTH CONTROLLERS

import * as firebaseService from "../services/1.user.service";

// Custom Token Controllers
export const createCustomTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid, additionalClaims } = req.body;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    const customToken = await firebaseService.createCustomToken(
      uid,
      additionalClaims
    );
    res.status(200).json({
      status: "success",
      customToken,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create custom token",
      message: error.message,
    });
  }
};

// ID Token Verification Controllers
export const verifyIdTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken, checkRevoked = false } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "ID token is required" });
      return;
    }

    const decodedToken = await firebaseService.verifyIdToken(
      idToken,
      checkRevoked
    );
    res.status(200).json({
      status: "success",
      decodedToken,
    });
  } catch (error: any) {
    if (error.code === "auth/id-token-revoked") {
      res.status(401).json({
        error: "Token has been revoked",
        code: "auth/id-token-revoked",
      });
    } else {
      res.status(401).json({
        error: "Invalid token",
        message: error.message,
      });
    }
  }
};

// Session Cookie Controllers
export const createSessionCookieController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      idToken,
      csrfToken,
      expiresIn = 60 * 60 * 24 * 5 * 1000,
    } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "ID token is required" });
      return;
    }

    // CSRF protection
    if (csrfToken !== req.cookies?.csrfToken) {
      res.status(401).json({ error: "UNAUTHORIZED REQUEST!" });
      return;
    }

    const sessionCookie = await firebaseService.createSessionCookie(
      idToken,
      expiresIn
    );

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res.cookie("session", sessionCookie, options);
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    res.status(401).json({
      error: "UNAUTHORIZED REQUEST!",
      message: error.message,
    });
  }
};

export const verifySessionCookieController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionCookie = req.cookies?.session || "";
    const { checkRevoked = true } = req.body;

    if (!sessionCookie) {
      res.status(401).json({ error: "Session cookie is required" });
      return;
    }

    const decodedClaims = await firebaseService.verifySessionCookie(
      sessionCookie,
      checkRevoked
    );
    res.status(200).json({
      status: "success",
      decodedClaims,
    });
  } catch (error: any) {
    res.status(401).json({
      error: "Session cookie is unavailable or invalid",
      message: error.message,
    });
  }
};

export const sessionLogoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionCookie = req.cookies?.session || "";
    const { revokeTokens = false } = req.body;

    res.clearCookie("session");

    if (revokeTokens && sessionCookie) {
      const decodedClaims = await firebaseService.verifySessionCookie(
        sessionCookie
      );
      await firebaseService.revokeRefreshTokens(decodedClaims.sub);
    }

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error: any) {
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  }
};

// Token Revocation Controllers
export const revokeRefreshTokensController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid } = req.body;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    const result = await firebaseService.revokeRefreshTokens(uid);
    await firebaseService.setTokenRevocationTime(uid, result.timestamp);

    res.status(200).json({
      status: "success",
      message: "Refresh tokens revoked successfully",
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to revoke refresh tokens",
      message: error.message,
    });
  }
};

// Custom Claims Controllers
export const setCustomUserClaimsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid, customClaims } = req.body;

    if (!uid || !customClaims) {
      res.status(400).json({ error: "UID and custom claims are required" });
      return;
    }

    await firebaseService.setCustomUserClaims(uid, customClaims);
    await firebaseService.setRefreshTime(uid);

    res.status(200).json({
      status: "success",
      message: "Custom claims set successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to set custom claims",
      message: error.message,
    });
  }
};

export const setCustomClaimsFromTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: "ID token is required" });
      return;
    }

    const claims = await firebaseService.verifyIdToken(idToken);

    // Verify user is eligible for additional privileges
    const isEligible = await firebaseService.validateUserForAdminClaims(
      claims.email,
      claims.email_verified
    );

    if (isEligible) {
      await firebaseService.setCustomUserClaims(claims.sub, { admin: true });
      await firebaseService.setRefreshTime(claims.sub);

      res.status(200).json({ status: "success" });
    } else {
      res.status(200).json({ status: "ineligible" });
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to set custom claims from token",
      message: error.message,
    });
  }
};

export const getUserCustomClaimsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    const customClaims = await firebaseService.getUserCustomClaims(uid);
    res.status(200).json({
      status: "success",
      customClaims,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get custom claims",
      message: error.message,
    });
  }
};

export const addIncrementalCustomClaimController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid, newClaims } = req.body;

    if (!uid || !newClaims) {
      res.status(400).json({ error: "UID and new claims are required" });
      return;
    }

    await firebaseService.addIncrementalCustomClaim(uid, newClaims);
    await firebaseService.setRefreshTime(uid);

    res.status(200).json({
      status: "success",
      message: "Incremental custom claims added successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to add incremental custom claims",
      message: error.message,
    });
  }
};

// User Management Controllers
export const getUserByEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const userRecord = await firebaseService.getUserByEmail(email);
    res.status(200).json({
      status: "success",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        customClaims: userRecord.customClaims,
        tokensValidAfterTime: userRecord.tokensValidAfterTime,
      },
    });
  } catch (error: any) {
    res.status(404).json({
      error: "User not found",
      message: error.message,
    });
  }
};

export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    const userRecord = await firebaseService.getUserById(uid);
    res.status(200).json({
      status: "success",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        customClaims: userRecord.customClaims,
        tokensValidAfterTime: userRecord.tokensValidAfterTime,
      },
    });
  } catch (error: any) {
    res.status(404).json({
      error: "User not found",
      message: error.message,
    });
  }
};

// Security Controllers
export const getRestrictedDataController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = req.body;
    const requestIpAddress = req.connection.remoteAddress || req.ip;

    if (!idToken) {
      res.status(400).json({ error: "ID token is required" });
      return;
    }

    const claims = await firebaseService.verifyIdToken(idToken, true);
    const previousIpAddresses =
      await firebaseService.getPreviousUserIpAddresses(claims.sub);

    const isValidIp = await firebaseService.isValidIpAddress(
      previousIpAddresses,
      requestIpAddress
    );

    if (!isValidIp) {
      await firebaseService.revokeRefreshTokens(claims.uid);
      res.status(401).json({
        error: "Unauthorized access. Please login again!",
      });
      return;
    }

    // Update IP address for future requests
    await firebaseService.updateUserIpAddress(claims.sub, requestIpAddress);

    // Return restricted data (implement your data retrieval logic)
    const restrictedData = {
      message: "This is restricted data",
      userId: claims.uid,
    };

    res.status(200).json({
      status: "success",
      data: restrictedData,
    });
  } catch (error: any) {
    res.status(401).json({
      error: "Unauthorized access. Please login again!",
      message: error.message,
    });
  }
};

// Admin Controllers
export const adminOnlyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionCookie = req.cookies?.session || "";

    if (!sessionCookie) {
      res.status(401).json({ error: "Session cookie required" });
      return;
    }

    const decodedClaims = await firebaseService.verifySessionCookie(
      sessionCookie,
      true
    );

    if (decodedClaims.admin !== true) {
      res.status(401).json({ error: "UNAUTHORIZED REQUEST!" });
      return;
    }

    // Serve admin content
    res.status(200).json({
      status: "success",
      message: "Admin content accessed successfully",
      adminData: {
        /* your admin data */
      },
    });
  } catch (error: any) {
    res.status(401).json({
      error: "Session cookie is unavailable or invalid",
      message: error.message,
    });
  }
};

// Metadata Controllers
export const updateUserMetadataController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid, metadata } = req.body;

    if (!uid || !metadata) {
      res.status(400).json({ error: "UID and metadata are required" });
      return;
    }

    await firebaseService.updateUserMetadata(uid, metadata);
    res.status(200).json({
      status: "success",
      message: "User metadata updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update user metadata",
      message: error.message,
    });
  }
};

export const getUserMetadataController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      res.status(400).json({ error: "UID is required" });
      return;
    }

    const metadata = await firebaseService.getUserMetadata(uid);
    res.status(200).json({
      status: "success",
      metadata,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get user metadata",
      message: error.message,
    });
  }
};
