import { NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple validation
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check credentials (in a real app, you would check against a database)
    if (username === "admin" && password === "!July1872") {
      // Create session for admin user
      const token = await signToken({
        id: "admin-user",
        username: "admin",
        email: "admin@example.com",
        roles: ["admin"], // Admin role
      })

      const response = NextResponse.json({ success: true })
      return setAuthCookie(response, token)
    } else if (username === "editor" && password === "editor") {
      // Demo editor user
      const token = await signToken({
        id: "editor-user",
        username: "editor",
        email: "editor@example.com",
        roles: ["editor"], // Editor role
      })

      const response = NextResponse.json({ success: true })
      return setAuthCookie(response, token)
    } else if (username === "viewer" && password === "viewer") {
      // Demo viewer user
      const token = await signToken({
        id: "viewer-user",
        username: "viewer",
        email: "viewer@example.com",
        roles: ["viewer"], // Viewer role
      })

      const response = NextResponse.json({ success: true })
      return setAuthCookie(response, token)
    }

    // Invalid credentials
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
