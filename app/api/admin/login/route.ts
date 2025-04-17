import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials, createAdminSession } from "@/lib/supabase/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, apiKey } = await request.json()

    if (!username || !apiKey) {
      return NextResponse.json({ error: "Username and API key are required" }, { status: 400 })
    }

    const { success, error, admin } = await verifyAdminCredentials(username, apiKey)

    if (!success || !admin) {
      return NextResponse.json({ error: error || "Invalid credentials" }, { status: 401 })
    }

    // Create session
    await createAdminSession(admin.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
