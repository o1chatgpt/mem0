import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has("admin_session")

  // If it's the login path and the user is already authenticated, redirect to home
  if (path === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For all other paths, let Next.js handle the routing
  return NextResponse.next()
}

// Only run middleware on the login path
export const config = {
  matcher: ["/login"],
}
