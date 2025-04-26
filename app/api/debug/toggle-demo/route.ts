import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

// This is a temporary variable just for this demo
let demoModeEnabled = true

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Only allow admin users to access this endpoint
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Toggle demo mode
    demoModeEnabled = !demoModeEnabled

    // Update the environment variable (this is just for demonstration)
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = demoModeEnabled ? "true" : "false"

    return NextResponse.json({
      success: true,
      demoModeEnabled,
      message: `Demo mode ${demoModeEnabled ? "enabled" : "disabled"}`,
    })
  } catch (error) {
    console.error("Demo toggle error:", error)
    return NextResponse.json(
      {
        error: "Failed to toggle demo mode",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
