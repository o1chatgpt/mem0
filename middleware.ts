import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Public paths that don't require authentication
  const publicPaths = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
    "/api/auth",
    "/direct-entry", // Add the direct entry path as public
  ]

  const path = request.nextUrl.pathname

  // Check if the path is public
  if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
    // If user is trying to access login page but is already authenticated, redirect to home
    if (path === "/auth/login") {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return res
  }

  // Check for static assets
  if (path.startsWith("/_next/") || path.includes(".")) {
    return res
  }

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to login if no authentication is found
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // User is authenticated, allow access
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
