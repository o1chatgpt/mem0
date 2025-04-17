import { type NextRequest, NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"
import { config } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("Login attempt:", {
      username,
      providedPasswordLength: password ? password.length : 0,
      expectedUsername: config.adminUsername,
      expectedEmail: config.adminEmail,
      // Don't log the actual passwords, just if they match
      passwordMatchesApiKey: password === config.serverApiKey,
      passwordMatchesAdminPassword: password === config.adminPassword,
    })

    // Check for demo mode with default credentials
    if (config.enableDemoMode && username === "demo" && password === "demo") {
      console.log("Demo login successful")
      const token = await signToken({
        id: "demo",
        username: "demo",
        role: "admin",
      })
      const response = NextResponse.json({ success: true, message: "Demo login successful" })
      return setAuthCookie(response, token)
    }

    // Check if username is admin/email and password matches API key or admin password
    const isValidUsername =
      username === config.adminUsername ||
      username === config.adminEmail ||
      username === "admin@andiegogiap.com" ||
      username === "admin"

    const isValidPassword =
      password === config.serverApiKey ||
      password === config.adminPassword ||
      password === process.env.ANDIEGOGIAP_API_KEY

    if (!isValidUsername || !isValidPassword) {
      return NextResponse.json(
        {
          error: "Invalid username or password",
          hint: "Use 'admin', your email, or 'admin@andiegogiap.com' as username and your API key as password",
        },
        { status: 401 },
      )
    }

    // Create a session token
    const token = await signToken({
      id: "1",
      username: username,
      role: "admin",
    })

    // Set the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    })
    return setAuthCookie(response, token)
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
