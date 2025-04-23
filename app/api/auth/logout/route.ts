import { type NextRequest, NextResponse } from "next/server"
import { logoutUser } from "@/app/actions/auth-actions"

export async function POST(request: NextRequest) {
  const result = await logoutUser()
  return NextResponse.json(result)
}
