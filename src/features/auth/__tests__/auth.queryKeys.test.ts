import { describe, it, expect } from "vitest";
import { authQueryKeys } from "../queries/auth.queryKeys";

describe("authQueryKeys", () => {
  it('all equals ["auth"]', () => {
    expect(authQueryKeys.all).toEqual(["auth"]);
  });

  it('sessions() returns ["auth", "session"]', () => {
    expect(authQueryKeys.sessions()).toEqual(["auth", "session"]);
  });

  it('session() returns ["auth", "session", "current"]', () => {
    expect(authQueryKeys.session()).toEqual(["auth", "session", "current"]);
  });

  it('profiles() returns ["auth", "profile"]', () => {
    expect(authQueryKeys.profiles()).toEqual(["auth", "profile"]);
  });

  it('profile() returns ["auth", "profile", "me"]', () => {
    expect(authQueryKeys.profile()).toEqual(["auth", "profile", "me"]);
  });

  it('verificationTokenStatus() returns ["auth", "verification-token-status"]', () => {
    expect(authQueryKeys.verificationTokenStatus()).toEqual([
      "auth",
      "verification-token-status",
    ]);
  });

  it("session key is a prefix of its parent keys", () => {
    const sessionKey = authQueryKeys.session();
    const sessionsKey = authQueryKeys.sessions();
    const allKey = authQueryKeys.all;
    // Hierarchical prefix invariant
    expect(sessionKey.slice(0, allKey.length)).toEqual([...allKey]);
    expect(sessionKey.slice(0, sessionsKey.length)).toEqual([...sessionsKey]);
  });
});
