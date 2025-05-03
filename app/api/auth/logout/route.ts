import { type NextRequest, NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  return removeAuthCookie(response)
}
