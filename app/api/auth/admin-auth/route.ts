import { type NextRequest, NextResponse } from "next/server"
import { config, serverConfig } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Check if the provided credentials match the admin credentials
    if (username === config.adminUsername && password === serverConfig.adminPassword) {
      return NextResponse.json({
        success: true,
        message: "Admin authentication successful",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Admin authentication error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Admin authentication failed",
      },
      { status: 500 },
    )
  }
}
