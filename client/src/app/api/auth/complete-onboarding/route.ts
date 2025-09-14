import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, updateUserClaims, createSessionToken, setSessionCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Update custom claims
    await updateUserClaims(session.uid, {
      ...session.customClaims,
      onboardingComplete: true,
    });

    // Create new session token with updated claims
    const updatedSession = {
      ...session,
      onboardingComplete: true,
    };
    
    const sessionToken = await createSessionToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      user: {
        uid: session.uid,
        email: session.email,
        onboardingComplete: true,
      },
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}