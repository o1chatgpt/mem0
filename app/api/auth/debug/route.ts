import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false, message: "No session found" })
    }

    // Return session info without sensitive data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        username: session.username,
        email: session.email,
        roles: session.roles,
      },
    })
  } catch (error) {
    console.error("Auth debug error:", error)
    return NextResponse.json({ error: "Failed to check authentication status" }, { status: 500 })
  }
}
