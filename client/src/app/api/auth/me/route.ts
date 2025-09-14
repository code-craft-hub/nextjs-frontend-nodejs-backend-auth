import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        uid: session.uid,
        email: session.email,
        emailVerified: session.emailVerified,
        onboardingComplete: session.onboardingComplete,
      },
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
