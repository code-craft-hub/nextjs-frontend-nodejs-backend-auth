import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import {
  authenticateToken,
  requirePermissions,
  requireRoles,
  // authRateLimit,
} from "../middleware/auth.middleware";
import { Permission, UserRoles } from "../types";

const router: Router = Router();
const authController = new AuthController();
const userController = new UserController();

// Public routes (with rate limiting)
router.post(
  "/register",
  // authRateLimit,
  AuthController.registerValidation,
  authController.register
);
router.post(
  "/login",
  // authRateLimit,
  AuthController.loginValidation,
  authController.login
);
router.post("/refresh-token", 
  // authRateLimit,
   authController.refreshToken);
router.post(
  "/forgot-password",
  // authRateLimit,
  authController.requestPasswordReset
);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// User profile routes
router.get("/profile", authController.getProfile);
router.put(
  "/change-password",
  AuthController.changePasswordValidation,
  authController.changePassword
);

// Session management
router.get("/sessions", authController.getSessions);
router.delete("/sessions/:sessionId", authController.revokeSession);
router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAllSessions);

// User management routes (admin only)
router.get(
  "/users",
  requirePermissions([Permission.ADMIN_READ]),
  userController.getAllUsers
);
router.get(
  "/users/:uid",
  requirePermissions([Permission.ADMIN_READ]),
  userController.getUserById
);
router.put(
  "/users/:uid",
  requirePermissions([Permission.ADMIN_WRITE]),
  userController.updateUser
);
router.post(
  "/users/:uid/assign-role",
  requirePermissions([Permission.ROLE_WRITE]),
  userController.assignRole
);
router.delete(
  "/users/:uid/remove-role",
  requirePermissions([Permission.ROLE_WRITE]),
  userController.removeRole
);
router.put(
  "/users/:uid/deactivate",
  requirePermissions([Permission.ADMIN_WRITE]),
  userController.deactivateUser
);
router.put(
  "/users/:uid/activate",
  requirePermissions([Permission.ADMIN_WRITE]),
  userController.activateUser
);

// Role management routes (super admin only)
router.get(
  "/roles",
  requirePermissions([Permission.ROLE_READ]),
  userController.getAllRoles
);
router.post(
  "/roles",
  requireRoles([UserRoles.SUPER_ADMIN]),
  userController.createRole
);
router.put(
  "/roles/:roleId",
  requireRoles([UserRoles.SUPER_ADMIN]),
  userController.updateRole
);
router.delete(
  "/roles/:roleId",
  requireRoles([UserRoles.SUPER_ADMIN]),
  userController.deleteRole
);

// Audit routes (admin only)
router.get(
  "/audit-logs",
  requirePermissions([Permission.SYSTEM_LOGS]),
  userController.getAuditLogs
);
router.get(
  "/security-events",
  requirePermissions([Permission.SYSTEM_LOGS]),
  userController.getSecurityEvents
);

export default router;
