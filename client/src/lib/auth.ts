import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE_NAME = "session";

export const setSessionCookie = async (uid: string) => {
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  (await cookies()).set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
};

export const getSession = async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { uid: string };
  } catch {
    return null;
  }
};

export const clearSessionCookie = async () => {
  (await cookies()).delete(COOKIE_NAME);
};
