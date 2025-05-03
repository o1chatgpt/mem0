import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Public paths that don't require authentication
    const publicPaths = [
      "/login",
      "/api/auth",
      "/direct-entry", // Add the direct entry path as public
    ]

    const path = request.nextUrl.pathname

    // Check if the path is public
    if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
      // If user is trying to access login page but is already authenticated, redirect to home
      if (path === "/login") {
        const bypassAuth = request.cookies.get("bypass-auth")?.value
        const authToken = request.cookies.get("auth-token")?.value

        if (bypassAuth === "admin-access-granted" || authToken) {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }

      return NextResponse.next()
    }

    // Check for static assets
    if (path.startsWith("/_next/") || path.includes(".")) {
      return NextResponse.next()
    }

    // Check for either the bypass cookie or the regular auth token
    const bypassAuth = request.cookies.get("bypass-auth")?.value
    const authToken = request.cookies.get("auth-token")?.value

    console.log("Middleware auth check:", {
      path,
      bypassAuth: bypassAuth ? "present" : "missing",
      authToken: authToken ? "present" : "missing",
    })

    if (bypassAuth === "admin-access-granted" || authToken) {
      // Allow access if either authentication method is present
      return NextResponse.next()
    }

    // Redirect to login if no authentication is found
    return NextResponse.redirect(new URL("/login", request.url))
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of any error, redirect to login as a fallback
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
