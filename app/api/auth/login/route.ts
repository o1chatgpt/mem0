import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/app/actions/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const result = await loginUser(username, password)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          hint: result.hint,
        },
        { status: 401 },
      )
    }

    return NextResponse.json(result)
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
