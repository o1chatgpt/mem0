import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Using in-memory database fallback",
    timestamp: new Date().toISOString(),
  })
}
