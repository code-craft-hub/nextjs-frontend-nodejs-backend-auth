import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { createSessionToken, setSessionCookie, signInWithPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user with Firebase Admin
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Set initial custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      onboardingComplete: false,
    });

    // Sign in immediately using Firebase REST API
    const signInResponse = await signInWithPassword(email, password);
    console.log('Sign-in response:', signInResponse);

    // Create session token
    const sessionToken = await createSessionToken({
      uid: userRecord.uid,
      email: userRecord.email!,
      emailVerified: false,
      onboardingComplete: false,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        onboardingComplete: false,
      },
    });

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
