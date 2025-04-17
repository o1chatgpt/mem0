import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Check if the admin_session cookie exists
  const sessionCookie = request.cookies.get("admin_session")

  // Return authentication status
  return NextResponse.json({
    authenticated: !!sessionCookie,
  })
}
