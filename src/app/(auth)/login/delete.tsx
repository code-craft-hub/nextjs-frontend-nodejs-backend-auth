"use client";

// App.tsx
// Minimal demo showing EVERY major feature of @react-oauth/google
// npm install @react-oauth/google

import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
  useGoogleOneTapLogin,
  googleLogout,
  hasGrantedAllScopesGoogle,
  hasGrantedAnyScopeGoogle,
  type CredentialResponse,
  type TokenResponse,
  type CodeResponse,
} from "@react-oauth/google";
import { useEffect } from "react";

// ────────────────────────────────────────────────
//  Paste your OWN Google Client ID here
//  (create one at https://console.cloud.google.com/apis/credentials)
// ────────────────────────────────────────────────

function GoogleAuthDemo() {
  // ── A. Ready-made button (implicit flow + id_token) ───────────────────────
  const handleGoogleLoginSuccess = (response: CredentialResponse) => {
    console.log("GoogleLogin (button) success ── CredentialResponse:");
    console.log(response);
    // Most common fields:
    console.log("id_token (JWT):", response.credential);
    console.log("clientId:", response.clientId);
    console.log("select_by:", response.select_by);
  };

  const handleGoogleLoginError = () => {
    console.log("GoogleLogin (button) failed");
  };

  // ── B. useGoogleLogin – implicit flow (access_token) ───────────────────────
  const loginImplicit = useGoogleLogin({
    onSuccess: (tokenResponse: TokenResponse) => {
      console.log("useGoogleLogin (implicit) success ── TokenResponse:");
      console.log(tokenResponse);
      console.log("access_token:", tokenResponse.access_token);
      console.log("scope:", tokenResponse.scope);
      console.log("expires_in:", tokenResponse.expires_in);

      // Example scope checks
      console.log(
        "Has ALL these scopes?",
        hasGrantedAllScopesGoogle(
          tokenResponse,
          "email",
          "profile",
          "https://www.googleapis.com/auth/drive.readonly",
        ),
      );
      console.log(
        "Has ANY of these scopes?",
        hasGrantedAnyScopeGoogle(
          tokenResponse,
          "email",
          "https://www.googleapis.com/auth/calendar",
        ),
      );
    },
    onError: (errorResponse) => {
      console.log("useGoogleLogin (implicit) error:", errorResponse);
    },
    onNonOAuthError: (nonOAuthErr) => {
      console.log(
        "useGoogleLogin non-OAuth error (popup issue etc):",
        nonOAuthErr,
      );
    },
    scope: "email profile https://www.googleapis.com/auth/drive.readonly", // example scopes
    prompt: "select_account", // or 'consent' / 'none'
  });

  // ── C. useGoogleLogin – authorization code flow ────────────────────────────
  const loginAuthCode = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse: CodeResponse) => {
      console.log("useGoogleLogin (auth-code) success ── CodeResponse:");
      console.log(codeResponse);
      console.log("authorization code (send to backend):", codeResponse.code);
      // You must exchange this code on your SERVER for tokens
    },
    onError: (err) => console.log("useGoogleLogin (auth-code) error:", err),
    ux_mode: "popup", // or 'redirect'
    // redirect_uri: 'http://localhost:3000/callback', // only if ux_mode='redirect'
    scope: "email profile",
  });

  // ── D. One-Tap login (automatic prompt) ────────────────────────────────────
  useGoogleOneTapLogin({
    onSuccess: (response: CredentialResponse) => {
      console.log("One-Tap success ── CredentialResponse:");
      console.log(response);
      console.log("One-Tap id_token:", response.credential);
    },
    onError: () => {
      console.log("One-Tap failed / dismissed");
    },
    promptMomentNotification: (notification) => {
      console.log("One-Tap prompt moment:", notification);
      // 'promptDisplayed', 'promptSkipped', 'promptDismissed', etc.
    },
    cancel_on_tap_outside: false,
    // disabled: true, // you can disable it conditionally
  });

  // ── E. Manual logout from Google session (important when using One-Tap) ────
  const handleLogout = () => {
    googleLogout();
    console.log("googleLogout() called – Google session cookie cleared");
    // → Put your own app logout / clear local state here
  };

  useEffect(() => {
    console.log("Google Identity Services script should now be loaded");
  }, []);

  // can enable here too
  // type="standard"
  // size="large"
  // text="signin_with"
  // shape="rectangular"
  // prompt="select_account"
  // login_uri="http://..."  // advanced
  // use_fedcm_for_prompt={true} // enables FedCM for One Tap / prompt
  // use_fedcm_for_button={true} // enables FedCM for the classic button
  // containerProps={{
  //   allow: "identity-credentials-get", // critical when inside iframe
  // }}

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Google OAuth Demo – just logging everything</h2>

      <hr />

      <h3>A. GoogleLogin component (ready-made button)</h3>
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
        useOneTap={true}
      />

      <hr />

      <h3>B. Custom button – implicit flow (access_token)</h3>
      <button onClick={() => loginImplicit()}>
        Custom: Sign in with Google (implicit + scopes)
      </button>

      <hr />

      <h3>C. Custom button – auth-code flow (code → backend)</h3>
      <button onClick={() => loginAuthCode()}>
        Custom: Login with redirect/popup (auth-code flow)
      </button>

      <hr />

      <h3>D. One-Tap is already running above (look at the top of page)</h3>
      <p>
        (check console for prompt moments and credential if you are signed in)
      </p>

      <hr />

      <h3>E. Logout from Google</h3>
      <button onClick={handleLogout}>
        Log out from Google (clear session)
      </button>

      <hr />

      <small>
        Tip: After logout, refresh page → One-Tap should appear again (if
        enabled in Google account)
      </small>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      onScriptLoadSuccess={() => console.log("GSI script loaded OK")}
      onScriptLoadError={() => console.error("GSI script failed to load")}
    >
      <GoogleAuthDemo />
    </GoogleOAuthProvider>
  );
}
