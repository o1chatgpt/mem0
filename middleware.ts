import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    // Public paths that don't require authentication
    const publicPaths = [
      "/login",
      "/api/auth",
      "/direct-entry", // Add the direct entry path as public
      "/auth-test", // Make auth test page public for testing
    ]

    const path = request.nextUrl.pathname

    // Debug logging
    console.log(`Middleware processing path: ${path}`)

    // Log all cookies for debugging
    const cookieString = request.cookies.toString()
    console.log(`Cookies: ${cookieString}`)

    // Check if the path is public
    if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
      console.log(`Path ${path} is public, allowing access`)

      // If user is trying to access login page but is already authenticated, redirect to home
      if (path === "/login") {
        const bypassAuth = request.cookies.get("bypass-auth")?.value
        const authToken = request.cookies.get("auth-token")?.value

        console.log(`Login page check - bypass: ${!!bypassAuth}, token: ${!!authToken}`)

        if (bypassAuth === "admin-access-granted" || authToken) {
          console.log("User already authenticated, redirecting to home")
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

    console.log(`Auth check for ${path} - bypass: ${!!bypassAuth}, token: ${!!authToken}`)

    if (bypassAuth === "admin-access-granted" || authToken) {
      // Allow access if either authentication method is present
      console.log("Authentication found, allowing access")
      return NextResponse.next()
    }

    // Redirect to login if no authentication is found
    console.log("No authentication found, redirecting to login")
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
