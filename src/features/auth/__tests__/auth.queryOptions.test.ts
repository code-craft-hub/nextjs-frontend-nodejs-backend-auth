import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  authQueries,
  invalidateAuthSession,
  invalidateAuthProfile,
  invalidateAuth,
} from "../queries/auth.queryOptions";
import { authQueryKeys } from "../queries/auth.queryKeys";

describe("authQueries.session()", () => {
  it("returns query options with the correct queryKey", () => {
    const opts = authQueries.session();
    expect(opts.queryKey).toEqual(authQueryKeys.session());
  });

  it("has retry: false", () => {
    const opts = authQueries.session();
    expect(opts.retry).toBe(false);
  });

  it("has a non-zero staleTime", () => {
    const opts = authQueries.session();
    expect(opts.staleTime).toBeGreaterThan(0);
  });

  it("queryFn is a function", () => {
    const opts = authQueries.session();
    expect(typeof opts.queryFn).toBe("function");
  });
});

describe("authQueries.profile()", () => {
  it("returns query options with the correct queryKey", () => {
    const opts = authQueries.profile();
    expect(opts.queryKey).toEqual(authQueryKeys.profile());
  });

  it("has retry: false", () => {
    const opts = authQueries.profile();
    expect(opts.retry).toBe(false);
  });

  it("queryFn is a function", () => {
    const opts = authQueries.profile();
    expect(typeof opts.queryFn).toBe("function");
  });
});

describe("authQueries.verificationTokenStatus()", () => {
  it("returns query options with the correct queryKey", () => {
    const opts = authQueries.verificationTokenStatus();
    expect(opts.queryKey).toEqual(authQueryKeys.verificationTokenStatus());
  });

  it("has staleTime: 0 (always fresh)", () => {
    const opts = authQueries.verificationTokenStatus();
    expect(opts.staleTime).toBe(0);
  });

  it("has retry: false", () => {
    const opts = authQueries.verificationTokenStatus();
    expect(opts.retry).toBe(false);
  });

  it("queryFn is a function", () => {
    const opts = authQueries.verificationTokenStatus();
    expect(typeof opts.queryFn).toBe("function");
  });

  it("accepts an optional token argument", () => {
    const opts = authQueries.verificationTokenStatus("my-token");
    expect(opts.queryKey).toBeDefined();
    expect(typeof opts.queryFn).toBe("function");
  });
});

describe("invalidation helpers", () => {
  it("invalidateAuthSession calls invalidateQueries with session key prefix", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    invalidateAuthSession(qc);
    expect(spy).toHaveBeenCalledWith({
      queryKey: authQueryKeys.sessions(),
    });
  });

  it("invalidateAuthProfile calls invalidateQueries with profile key prefix", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    invalidateAuthProfile(qc);
    expect(spy).toHaveBeenCalledWith({
      queryKey: authQueryKeys.profiles(),
    });
  });

  it("invalidateAuth calls invalidateQueries with the root auth key", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    invalidateAuth(qc);
    expect(spy).toHaveBeenCalledWith({
      queryKey: authQueryKeys.all,
    });
  });
});
