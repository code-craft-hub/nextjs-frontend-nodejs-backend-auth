import { useEffect, useMemo, useState } from "react";

interface User {
  credit?: number | string | null;
}

interface AuthStatusResponse {
  success: boolean;
  data?: {
    isAuthorized: boolean;
  };
}

type CheckAuthStatusFn = () => Promise<AuthStatusResponse>;

interface UseCreditAuthorizationOptions {
  /**
   * User coming from TanStack Query:
   * const { data: user } = useQuery(...)
   */
  user: User | undefined;
  checkAuthStatus: CheckAuthStatusFn;
  /**
   * Optional escape hatch for edge cases
   */
  enabled?: boolean;
}

export function useCreditAuthorization({
  user,
  checkAuthStatus,
  enabled = true,
}: UseCreditAuthorizationOptions) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  /**
   * CREDIT DERIVATION
   * - No state
   * - Automatically reacts to refetches
   * - Safe against undefined / NaN
   */
  const hasValidCredit = useMemo(() => {
    if (!user) return false;

    const credit = Number(user.credit);
    return Number.isFinite(credit) && credit > 0;
  }, [user]);

  /**
   * AUTHORIZATION CHECK
   * Runs once unless explicitly disabled
   */
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const run = async () => {
      try {
        setIsCheckingAuth(true);
        const res = await checkAuthStatus();

        if (!isMounted) return;

        setIsAuthorized(Boolean(res?.success && res.data?.isAuthorized));
      } catch (err) {
        if (!isMounted) return;
        setAuthError(err as Error);
        setIsAuthorized(false);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus, enabled]);

  /**
   * SINGLE SOURCE OF TRUTH FOR UI
   */
  const showInsufficientCreditModal =
    enabled &&
    !isCheckingAuth &&
    isAuthorized &&
    user !== undefined && // user resolved
    !hasValidCredit;

  return {
    isAuthorized,
    hasValidCredit,
    showInsufficientCreditModal,
    isCheckingAuth,
    authError,
  };
}
