import { RouteProtection, ROLES, PERMISSIONS } from '../types/auth';

/**
 * Centralized route protection configurations
 * Define protection rules for all application routes
 */
export const ROUTE_PROTECTIONS: Record<string, RouteProtection> = {
  // Public routes - no protection
  '/': {
    requireAuth: false,
  },
  '/auth/signin': {
    requireAuth: false,
  },
  '/auth/signup': {
    requireAuth: false,
  },
  '/auth/forgot-password': {
    requireAuth: false,
  },

  // Protected routes - authentication required
  '/dashboard': {
    requireAuth: true,
    fallbackUrl: '/auth/signin',
  },
  
  '/profile': {
    requireAuth: true,
    fallbackUrl: '/auth/signin',
  },

  // Role-based protected routes
  '/admin': {
    requireAuth: true,
    requiredRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    fallbackUrl: '/auth/signin',
  },

  '/admin/users': {
    requireAuth: true,
    requiredRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    requiredPermissions: [
      {
        resource: 'users',
        action: 'read',
        scope: 'global',
      },
    ],
    fallbackUrl: '/auth/signin',
  },

  '/admin/settings': {
    requireAuth: true,
    requiredRoles: [ROLES.SUPER_ADMIN],
    requiredPermissions: [
      {
        resource: 'settings',
        action: 'manage',
        scope: 'global',
      },
    ],
    fallbackUrl: '/auth/signin',
  },

  // Manager-level routes
  '/management': {
    requireAuth: true,
    requiredRoles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    fallbackUrl: '/auth/signin',
  },

  '/management/reports': {
    requireAuth: true,
    requiredRoles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    requiredPermissions: [
      {
        resource: 'reports',
        action: 'read',
        scope: 'team',
      },
    ],
    fallbackUrl: '/auth/signin',
  },

  // User settings with specific permissions
  '/settings': {
    requireAuth: true,
    requiredPermissions: [
      {
        resource: 'user',
        action: 'update',
        scope: 'own',
      },
    ],
    fallbackUrl: '/auth/signin',
  },

  '/settings/security': {
    requireAuth: true,
    requiredPermissions: [
      {
        resource: 'user',
        action: 'manage',
        scope: 'own',
      },
    ],
    fallbackUrl: '/auth/signin',
  },
} as const;

/**
 * Helper function to get route protection config
 */
export function getRouteProtection(path: string): RouteProtection {
  // Direct match
  if (ROUTE_PROTECTIONS[path]) {
    return ROUTE_PROTECTIONS[path];
  }

  // Pattern matching for dynamic routes
  for (const [routePattern, protection] of Object.entries(ROUTE_PROTECTIONS)) {
    if (matchRoute(routePattern, path)) {
      return protection;
    }
  }

  // Default protection for unknown routes
  return {
    requireAuth: false,
  };
}

/**
 * Simple route pattern matching
 * Supports basic wildcards and parameters
 */
function matchRoute(pattern: string, path: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, '([^/]+)') // [id] -> ([^/]+)
    .replace(/\*/g, '.*') // * -> .*
    .replace(/\//g, '\\/'); // escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Utility to check if route requires authentication
 */
export function routeRequiresAuth(path: string): boolean {
  const protection = getRouteProtection(path);
  return protection.requireAuth;
}

/**
 * Utility to get required roles for a route
 */
export function getRequiredRoles(path: string): string[] {
  const protection = getRouteProtection(path);
  return protection.requiredRoles || [];
}

/**
 * Utility to get required permissions for a route
 */
export function getRequiredPermissions(path: string) {
  const protection = getRouteProtection(path);
  return protection.requiredPermissions || [];
}

/**
 * Route navigation helper with protection checks
 */
export interface NavigationHelper {
  canAccess: (path: string, userRoles: string[], userPermissions: any[]) => boolean;
  getAccessibleRoutes: (userRoles: string[], userPermissions: any[]) => string[];
  getRedirectUrl: (path: string, isAuthenticated: boolean) => string | null;
}

export function createNavigationHelper(): NavigationHelper {
  return {
    canAccess: (path: string, userRoles: string[], userPermissions: any[]): boolean => {
      const protection = getRouteProtection(path);
      
      if (!protection.requireAuth) return true;
      
      if (protection.requiredRoles && protection.requiredRoles.length > 0) {
        const hasRole = protection.requiredRoles.some(role => userRoles.includes(role));
        if (!hasRole) return false;
      }
      
      if (protection.requiredPermissions && protection.requiredPermissions.length > 0) {
        const hasPermission = protection.requiredPermissions.every(reqPerm =>
          userPermissions.some(perm =>
            perm.resource === reqPerm.resource &&
            perm.action === reqPerm.action &&
            (!reqPerm.scope || perm.scope === reqPerm.scope || perm.scope === 'global')
          )
        );
        if (!hasPermission) return false;
      }
      
      return true;
    },

    getAccessibleRoutes: (userRoles: string[], userPermissions: any[]): string[] => {
      return Object.keys(ROUTE_PROTECTIONS).filter(path =>
        createNavigationHelper().canAccess(path, userRoles, userPermissions)
      );
    },

    getRedirectUrl: (path: string, isAuthenticated: boolean): string | null => {
      const protection = getRouteProtection(path);
      
      if (protection.requireAuth && !isAuthenticated) {
        return protection.fallbackUrl || '/auth/signin';
      }
      
      return null;
    },
  };
}