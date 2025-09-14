import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
//   response.cookies.delete("__refresh_iCnIeNQS");
  const url = request.nextUrl.clone();
  const token = request.cookies.get("__refresh_iCnIeNQS");

  console.log("URL:", url, token);
console.log(request.geo)
  response.cookies.set({
    name: "__refresh_iCnIeNQS",
    value: "work hard",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
