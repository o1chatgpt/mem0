import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Simple validation
    if (!password) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    // Check if the password matches the admin password
    const isValid = password === config.adminPassword

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("Error in admin-check route:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}
