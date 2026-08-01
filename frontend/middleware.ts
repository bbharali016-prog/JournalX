import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /home (and variations) to root landing page /
  if (
    pathname === "/home" ||
    pathname === "/HOME" ||
    pathname === "/Home"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case-sensitive checks to redirect uppercase/mixedcase URLs to lowercase
  if (pathname === "/LOGIN" || pathname === "/Login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/REGISTER" || pathname === "/Register") {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/HOME",
    "/Home",
    "/LOGIN",
    "/Login",
    "/REGISTER",
    "/Register",
  ],
};
