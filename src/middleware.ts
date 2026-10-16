import { NextRequest, NextResponse } from "next/server";
// import Cookies from "js-cookie";

export const TOKEN_KEY = "token";

export async function middleware(request: NextRequest) {
  // const token = Cookies.get(TOKEN_KEY);
  const token = request.cookies.get(TOKEN_KEY);

  const protectedRoutes = [
    "/home",
    "/providers",
    "/provider",
    "/users",
    "/user",
    "/clients",
    "/client",
    "/device",
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

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
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