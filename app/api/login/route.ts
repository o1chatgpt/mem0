import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, apiKey } = await request.json()

    console.log("Login attempt:", { username, apiKey: "***" })

    if (!username || !apiKey) {
      return NextResponse.json({ error: "Username and API key are required" }, { status: 400 })
    }

    // For now, just check if username is 'admin' and apiKey is not empty
    // In production, you would verify against the database
    if (username === "admin" && apiKey) {
      // Set a simple cookie for authentication
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        redirect: "/admin/dashboard",
      })

      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return response
    }

    return NextResponse.json(
      {
        error: "Invalid credentials",
        message: "The username or API key you entered is incorrect.",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        message: "There was a problem processing your login. Please try again.",
      },
      { status: 500 },
    )
  }
}
