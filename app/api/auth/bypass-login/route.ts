import { NextResponse } from "next/server"
import { bypassLogin } from "@/app/actions/auth-actions"

export async function GET() {
  const result = await bypassLogin()
  return NextResponse.json(result)
}
