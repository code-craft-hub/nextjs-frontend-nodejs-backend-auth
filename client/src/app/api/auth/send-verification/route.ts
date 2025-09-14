// app/api/auth/send-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-utils';
import { generateVerificationCode, storeVerificationCode } from '@/lib/verification-codes';
import { sendVerificationEmail } from '@/lib/email';
import { adminAuth } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limiting';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = rateLimit(`verify-email:${ip}`, 3, 15 * 60 * 1000); // 3 attempts per 15 minutes

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many verification requests. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (session.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Get user details for name
    const user = await adminAuth.getUser(session.uid);
    
    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    storeVerificationCode(session.email, verificationCode);

    // Send verification email
    await sendVerificationEmail({
      email: session.email,
      name: user.displayName || undefined,
      verificationCode,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

