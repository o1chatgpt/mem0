import { NextResponse } from "next/server"
import { signToken, setAuthCookie } from "@/lib/auth"
import type { RoleName } from "@/lib/permissions"

export async function POST(request: Request) {
  try {
    // Check if demo mode is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "true") {
      return NextResponse.json({ error: "Demo mode is not enabled" }, { status: 403 })
    }

    const { role } = await request.json()

    // Validate the role
    const validRoles: RoleName[] = [
      "admin",
      "editor",
      "contributor",
      "viewer",
      "server-admin",
      "website-admin",
      "ai-admin",
    ]

    if (!validRoles.includes(role as RoleName)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Create a demo user with the specified role
    const token = await signToken({
      id: `demo-${role}`,
      username: `demo-${role}`,
      email: `demo-${role}@example.com`,
      roles: [role as RoleName],
    })

    const response = NextResponse.json({
      success: true,
      message: `Demo login successful as ${role}`,
    })

    return setAuthCookie(response, token)
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
