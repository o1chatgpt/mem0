import { type NextRequest, NextResponse } from "next/server"
import { intelligentConflictService } from "@/lib/intelligent-conflict-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const conflictId = searchParams.get("conflictId")
    const userId = searchParams.get("userId")

    if (!conflictId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const suggestions = await intelligentConflictService.getSuggestions(conflictId, userId)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error getting conflict suggestions:", error)
    return NextResponse.json({ error: "Failed to get conflict suggestions" }, { status: 500 })
  }
}
