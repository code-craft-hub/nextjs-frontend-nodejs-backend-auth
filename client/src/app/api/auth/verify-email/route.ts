import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromRequest,
  markEmailAsVerified,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth-utils";
import { verifyCode } from "@/lib/verification-codes";
import { rateLimit } from "@/lib/rate-limiting";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = rateLimit(`verify-code:${ip}`, 10, 15 * 60 * 1000); // 10 attempts per 15 minutes

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many verification attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Verify the code
    const verificationResult = verifyCode(session.email, code);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    // Mark email as verified in Firebase
    await markEmailAsVerified(session.uid);

    // Create new session token with email verified
    const updatedSession = {
      ...session,
      emailVerified: true,
    };

    const sessionToken = await createSessionToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      user: {
        uid: session.uid,
        email: session.email,
        emailVerified: true,
        onboardingComplete: session.onboardingComplete,
      },
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Email verification failed" },
      { status: 500 }
    );
  }
}
