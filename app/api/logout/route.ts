import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear the admin_session cookie
  cookies().delete("admin_session")

  // Return a JSON response
  return NextResponse.json({ success: true, message: "Logged out successfully" })
}

export async function POST() {
  // Clear the admin_session cookie
  cookies().delete("admin_session")

  // Return a JSON response
  return NextResponse.json({ success: true, message: "Logged out successfully" })
}
