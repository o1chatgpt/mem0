import { type NextRequest, NextResponse } from "next/server"
import { bypassLogin } from "@/app/actions/auth-actions"

export async function POST(request: NextRequest) {
  try {
    console.log("API bypass login attempt")

    const result = await bypassLogin()

    if (!result.success) {
      console.error("API bypass login failed:", result.error)
      return NextResponse.json(
        {
          error: result.error,
          hint: result.hint,
        },
        { status: 401 },
      )
    }

    console.log("API bypass login successful")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Bypass login error:", error)
    return NextResponse.json(
      {
        error: "Demo access failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
