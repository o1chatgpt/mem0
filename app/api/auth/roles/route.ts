import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ roles: [] }, { status: 401 })
    }

    return NextResponse.json({ roles: session.roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
