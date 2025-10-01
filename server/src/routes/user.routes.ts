import { Router, Request } from "express";
import { userController } from "../controllers/1.user.controller";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const userRouter: Router = Router();

userRouter.get("/:uid", userController.getUserById.bind(userController));
userRouter.get(
  "/email/:email",
  userController.getUserByEmail.bind(userController)
);
userRouter.get(
  "/phone/:phoneNumber",
  userController.getUserByPhoneNumber.bind(userController)
);
userRouter.post("/bulk", userController.getUsers.bind(userController));
userRouter.post("/", userController.createUser.bind(userController));
userRouter.put("/:uid", userController.updateUser.bind(userController));
userRouter.delete("/:uid", userController.deleteUser.bind(userController));
userRouter.delete(
  "/bulk/delete",
  userController.deleteUsers.bind(userController)
);

// List users with pagination
userRouter.get("/", userController.listUsers.bind(userController));

// Custom claims
userRouter.put(
  "/:uid/claims",
  userController.setCustomUserClaims.bind(userController)
);

// Token operations
userRouter.post(
  "/verify-token",
  userController.verifyIdToken.bind(userController)
);
userRouter.post(
  "/:uid/custom-token",
  userController.createCustomToken.bind(userController)
);

// Email operations
userRouter.post(
  "/password-reset-link",
  userController.generatePasswordResetLink.bind(userController)
);
userRouter.post(
  "/email-verification-link",
  userController.generateEmailVerificationLink.bind(userController)
);

// NEW ROUTES ADDED FOR ADDITIONAL FUNCTIONALITY

import * as firebaseController from "../controllers/1.user.controller";

const router = Router();

// Custom Token Routes
router.post(
  "/auth/create-custom-token",
  firebaseController.createCustomTokenController
);

// ID Token Verification Routes
router.post(
  "/auth/verify-id-token",
  firebaseController.verifyIdTokenController
);

// Session Management Routes
router.post(
  "/auth/session-login",
  firebaseController.createSessionCookieController
);
router.post(
  "/auth/verify-session",
  firebaseController.verifySessionCookieController
);
router.post("/auth/session-logout", firebaseController.sessionLogoutController);

// Token Revocation Routes
router.post(
  "/auth/revoke-tokens",
  firebaseController.revokeRefreshTokensController
);

// Custom Claims Routes
router.post(
  "/auth/set-custom-claims",
  firebaseController.setCustomUserClaimsController
);
router.post(
  "/auth/set-custom-claims-from-token",
  firebaseController.setCustomClaimsFromTokenController
);
router.get(
  "/auth/custom-claims/:uid",
  firebaseController.getUserCustomClaimsController
);
router.post(
  "/auth/add-incremental-claims",
  firebaseController.addIncrementalCustomClaimController
);

// User Management Routes
router.get("/users/email/:email", firebaseController.getUserByEmailController);
router.get("/users/uid/:uid", firebaseController.getUserByIdController);

// Security Routes
router.post(
  "/secure/restricted-data",
  firebaseController.getRestrictedDataController
);

// Admin Routes
router.get("/admin/dashboard", firebaseController.adminOnlyController);
router.post("/admin/data", firebaseController.adminOnlyController);

// Metadata Routes
router.post("/users/metadata", firebaseController.updateUserMetadataController);
router.get(
  "/users/metadata/:uid",
  firebaseController.getUserMetadataController
);

// Protected Routes Middleware Example
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const sessionCookie = req.cookies?.session;
    const authHeader = req.headers.authorization;

    let token = null;

    if (sessionCookie) {
      // Verify session cookie
      const decodedClaims =
        await firebaseController.verifySessionCookieController;
      req.user = decodedClaims;
      token = sessionCookie;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      // Verify ID token
      token = authHeader.substring(7);
      const decodedToken = await firebaseController.verifyIdTokenController;
      req.user = decodedToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication" });
  }
};

// Protected Routes (Examples)
router.get(
  "/protected/profile",
  requireAuth,
  (req: Request<{ user: {} }>, res) => {
    res.json({
      status: "success",
      message: "Profile accessed successfully",
      user: req.user,
    });
  }
);

router.get("/protected/dashboard", requireAuth, (req, res) => {
  res.json({
    status: "success",
    message: "Dashboard accessed successfully",
    user: req.user,
  });
});

// Admin-only protected routes
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.admin !== true) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(403).json({ error: "Access denied" });
  }
};

router.use("/admin", requireAuth);
router.use("/admin", requireAdmin);

router.get("/admin/users", (req, res) => {
  res.json({
    status: "success",
    message: "Admin users list accessed successfully",
  });
});

router.post("/admin/manage-user", (req, res) => {
  res.json({
    status: "success",
    message: "User management action completed successfully",
  });
});

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Firebase Auth API is running",
    timestamp: new Date().toISOString(),
  });
});
