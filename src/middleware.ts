// import { NextRequest, NextResponse } from "next/server";
// import Cookies from "js-cookie";

// export const TOKEN_KEY = "token";

// export async function middleware(request: NextRequest) {
//   // const token = Cookies.get(TOKEN_KEY);
//   const token = request.cookies.get(TOKEN_KEY);

//   const protectedRoutes = ['/dashboard', '/analytics', '/playlist', '/settings', '/subtitles', '/video', '/videos'];

//   // const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname);
//   const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));


//   if (isProtectedRoute && !token) {
//     const url = new URL('/', request.url);
//     // url.searchParams.set('unanthorized', 'true')
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/analytics/:path*',
//     '/playlist/:path*',
//     '/settings/:path*',
//     '/subtitles/:path*',
//     '/video/:path*',
//     '/videos/:path*'
//   ]
// }