import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        role: session.role,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication check failed",
      },
      { status: 500 },
    )
  }
}
