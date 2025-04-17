import { type NextRequest, NextResponse } from "next/server"
import { conflictResolutionService } from "@/lib/conflict-resolution-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const conflictId = searchParams.get("conflictId")
    const userId = searchParams.get("userId")

    if (!conflictId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get the conflict by ID (simplified - in a real app, you'd fetch from a database)
    const searchResults = await conflictResolutionService.getConflictHistory("")
    const conflict = searchResults.find((c) => c.id === conflictId)

    if (!conflict) {
      return NextResponse.json({ error: "Conflict not found" }, { status: 404 })
    }

    const suggestion = await conflictResolutionService.suggestResolution(conflict, userId)

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("Error getting conflict suggestion:", error)
    return NextResponse.json({ error: "Failed to get conflict suggestion" }, { status: 500 })
  }
}
