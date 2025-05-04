import { NextResponse } from "next/server"
import { signToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple validation
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check credentials
    let userId = ""
    let userRoles: string[] = []
    let userEmail = ""
    let isAuthenticated = false

    if (username === "admin" && password === "!July1872") {
      userId = "admin-user"
      userRoles = ["admin"]
      userEmail = "admin@example.com"
      isAuthenticated = true
    } else if (username === "editor" && password === "editor") {
      userId = "editor-user"
      userRoles = ["editor"]
      userEmail = "editor@example.com"
      isAuthenticated = true
    } else if (username === "viewer" && password === "viewer") {
      userId = "viewer-user"
      userRoles = ["viewer"]
      userEmail = "viewer@example.com"
      isAuthenticated = true
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Create token
    const token = await signToken({
      id: userId,
      username,
      email: userEmail,
      roles: userRoles,
    })

    // Create response with redirect
    const response = NextResponse.json({
      success: true,
      redirect: "/",
    })

    // Set cookie directly
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
