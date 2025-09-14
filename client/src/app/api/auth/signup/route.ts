import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Firebase signUp
  const signupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  ).then(r => r.json());

  if (signupRes.error) {
    return NextResponse.json({ error: signupRes.error }, { status: 400 });
  }

  // Auto login (signInWithPassword)
  const loginRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  ).then(r => r.json());

  await setSessionCookie(loginRes.localId);

  return NextResponse.json({ uid: loginRes.localId, email: loginRes.email });
}
