import { type NextRequest, NextResponse } from "next/server"
import { signToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Simple login initiated")

    // Create a session token with admin privileges - no credentials needed
    const token = await signToken({
      id: "1",
      username: "admin",
      role: "admin",
    })

    console.log("Token generated successfully")

    // Set the auth cookie with a more explicit path and longer expiration
    const response = NextResponse.json({
      success: true,
      message: "Direct login successful",
      redirectUrl: "/", // Add explicit redirect URL
    })

    // Set the cookie with more explicit options
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Auth cookie set successfully")

    return response
  } catch (error) {
    console.error("Simple login error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Simple login initiated")

    const body = await request.json()
    const { username, password } = body

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check credentials
    let userId = ""
    let userRoles: string[] = []
    let isAuthenticated = false

    console.log(`Checking credentials for username: ${username}`)

    if (username === "admin" && password === "!July1872") {
      userId = "admin-user"
      userRoles = ["admin"]
      isAuthenticated = true
      console.log("Admin credentials verified")
    } else if (username === "editor" && password === "editor") {
      userId = "editor-user"
      userRoles = ["editor"]
      isAuthenticated = true
      console.log("Editor credentials verified")
    } else if (username === "viewer" && password === "viewer") {
      userId = "viewer-user"
      userRoles = ["viewer"]
      isAuthenticated = true
      console.log("Viewer credentials verified")
    }

    if (!isAuthenticated) {
      console.log("Authentication failed: Invalid credentials")
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Create token
    const token = await signToken({
      id: userId,
      username,
      roles: userRoles,
    })

    console.log("Token generated successfully")

    // Create response with explicit redirect URL
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { id: userId, username, roles: userRoles },
    })

    // Set the cookie with more explicit options
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Auth cookie set successfully")

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
