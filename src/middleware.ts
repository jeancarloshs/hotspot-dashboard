import { canAccessPanel, routeAllowed } from "@/app/lib/acl";
import { NextRequest, NextResponse } from "next/server";

export const TOKEN_KEY = "token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY);
  const permission = request.cookies.get("permission")?.value ?? null;
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/home",
    "/providers",
    "/provider",
    "/users",
    "/user",
    "/clients",
    "/client",
    "/device",
    "/devices",
    "/hotspots",
    "/plans",
    "/plan",
    "/vouchers",
    "/voucher",
    "/payment-gateways",
    "/payment-gateway",
    "/orders",
    "/order",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute && token && !canAccessPanel(permission)) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    response.cookies.delete("permission");
    response.cookies.delete("userName");
    response.cookies.delete("userEmail");
    response.cookies.delete("ispID");
    response.cookies.delete("userID");
    return response;
  }

  if (isProtectedRoute && token && permission && !routeAllowed(permission, pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/providers/:path*",
    "/provider/:path*",
    "/users/:path*",
    "/user/:path*",
    "/clients/:path*",
    "/client/:path*",
    "/device/:path*",
    "/devices/:path*",
    "/hotspots/:path*",
    "/plans/:path*",
    "/plan/:path*",
    "/vouchers/:path*",
    "/voucher/:path*",
    "/payment-gateways/:path*",
    "/payment-gateway/:path*",
    "/orders/:path*",
    "/order/:path*",
  ],
};
