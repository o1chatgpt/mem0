import { NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"

// This endpoint is for development/preview environments only
export async function GET() {
  // Create a session token with admin privileges
  const token = await signToken({
    id: "dev-user",
    username: "dev-user",
    role: "admin",
  })

  // Set the auth cookie
  const response = NextResponse.json({
    success: true,
    message: "Development login successful",
  })

  return setAuthCookie(response, token)
}
