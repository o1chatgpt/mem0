import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/api/auth/login" ||
    path === "/api/auth/bypass-login" ||
    path === "/unauthorized" ||
    path.startsWith("/api/debug") ||
    path.startsWith("/shared/")

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has("auth_token")

  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated and trying to access login page, redirect to home
  if (isAuthenticated && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Continue with the request
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
