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
