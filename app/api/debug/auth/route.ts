import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value

    // Get the session
    const session = await getSession()

    return NextResponse.json({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      session: session
        ? {
            id: session.id,
            username: session.username,
            role: session.role,
            exp: session.exp,
          }
        : null,
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value.substring(0, 10) + "..."])),
    })
  } catch (error) {
    console.error("Auth debug error:", error)
    return NextResponse.json(
      {
        error: "Auth debug failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
