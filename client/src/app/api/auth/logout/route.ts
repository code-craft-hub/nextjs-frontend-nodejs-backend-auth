import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromRequest } from '@/lib/auth-utils';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (session) {
      // Revoke all refresh tokens for this user (optional but more secure)
      await adminAuth.revokeRefreshTokens(session.uid);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}