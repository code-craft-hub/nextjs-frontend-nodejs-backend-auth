interface VerificationCode {
  code: string;
  email: string;
  createdAt: number;
  attempts: number;
}

const verificationCodes = new Map<string, VerificationCode>();

export function generateVerificationCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function storeVerificationCode(email: string, code: string): void {
  verificationCodes.set(email.toLowerCase(), {
    code,
    email: email.toLowerCase(),
    createdAt: Date.now(),
    attempts: 0,
  });
}

export function verifyCode(
  email: string,
  inputCode: string
): {
  success: boolean;
  error?: string;
} {
  const stored = verificationCodes.get(email.toLowerCase());

  if (!stored) {
    return { success: false, error: "No verification code found" };
  }

  // Check if code expired (10 minutes)
  if (Date.now() - stored.createdAt > 10 * 60 * 1000) {
    verificationCodes.delete(email.toLowerCase());
    return { success: false, error: "Verification code expired" };
  }

  // Check attempts (max 5)
  if (stored.attempts >= 5) {
    verificationCodes.delete(email.toLowerCase());
    return { success: false, error: "Too many attempts" };
  }

  stored.attempts++;

  if (stored.code !== inputCode) {
    return { success: false, error: "Invalid verification code" };
  }

  // Success - remove the code
  verificationCodes.delete(email.toLowerCase());
  return { success: true };
}

export function hasValidVerificationCode(email: string): boolean {
  const stored = verificationCodes.get(email.toLowerCase());
  if (!stored) return false;

  // Check if not expired
  return Date.now() - stored.createdAt <= 10 * 60 * 1000;
}