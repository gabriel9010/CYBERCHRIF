import { NextResponse } from "next/server";
export function middleware(req) {
  const url = req.nextUrl;
  if (url.pathname.startsWith("/admin")) {
    const isLogin = url.pathname.startsWith("/admin/login");
    const admin = req.cookies.get("admin")?.value === "1";
    if (!admin && !isLogin) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (admin && isLogin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };