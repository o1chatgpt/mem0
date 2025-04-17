import { type NextRequest, NextResponse } from "next/server"
import { searchMemories } from "@/lib/db/memories"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const aiFamilyMemberId = searchParams.get("aiFamilyMemberId")
    const query = searchParams.get("query")
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    if (!userId || !aiFamilyMemberId || !query) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const results = await searchMemories(userId, aiFamilyMemberId, query, limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching memories:", error)
    return NextResponse.json({ error: "Failed to search memories" }, { status: 500 })
  }
}
