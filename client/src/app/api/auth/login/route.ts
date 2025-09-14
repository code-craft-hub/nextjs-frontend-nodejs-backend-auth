import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { createSessionToken, setSessionCookie, signInWithPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in using Firebase REST API
    const signInResponse = await signInWithPassword(email, password);
    console.log('signInResponse:', signInResponse);
    
    if (signInResponse.error) {
      return NextResponse.json({ error: signInResponse.error }, { status: 401 });
    }

    // Get user details from Firebase Admin
    const user = await adminAuth.getUserByEmail(email);

    // Create session token
    const sessionToken = await createSessionToken({
      uid: user.uid,
      email: user.email!,
      emailVerified: user.emailVerified,
      onboardingComplete: user.customClaims?.onboardingComplete || false,
      customClaims: user.customClaims,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        onboardingComplete: user.customClaims?.onboardingComplete || false,
      },
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}