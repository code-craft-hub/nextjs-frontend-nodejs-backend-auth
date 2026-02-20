"use client";
import { useState } from "react";
import { PasswordResetVerifyEmail } from "./PasswordResetVerifyEmail";
import { ResetPassword } from "./ResetPassword";

/**
 * Orchestrates the two-step password-reset flow:
 *  Step 1 — PasswordResetVerifyEmail: sends OTP via /auth/forgot-password and
 *            collects it from the user.  On success, calls handleStateChange(otp)
 *            to advance to step 2.
 *  Step 2 — ResetPassword: collects the new password and submits
 *            { email, otp, newPassword } to /auth/reset-password.
 */
const ResetPasswordClient = ({ email }: { email: string }) => {
  // null  → show OTP step
  // string → OTP verified; show new-password step
  const [verifiedOtp, setVerifiedOtp] = useState<string | null>(null);

  return (
    <div>
      {verifiedOtp === null ? (
        <PasswordResetVerifyEmail
          email={email}
          handleStateChange={(otp: string) => setVerifiedOtp(otp)}
        />
      ) : (
        <ResetPassword email={email} otp={verifiedOtp} />
      )}
    </div>
  );
};

export default ResetPasswordClient;
