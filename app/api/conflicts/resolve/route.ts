import { type NextRequest, NextResponse } from "next/server"
import { conflictResolutionService } from "@/lib/conflict-resolution-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conflictId, resolution, customContent, resolvedBy } = body

    // Get the conflict by ID (simplified - in a real app, you'd fetch from a database)
    const searchResults = await conflictResolutionService.getConflictHistory("")
    const conflict = searchResults.find((c) => c.id === conflictId)

    if (!conflict) {
      return NextResponse.json({ error: "Conflict not found" }, { status: 404 })
    }

    const resolvedConflict = await conflictResolutionService.resolveConflict(
      conflict,
      resolution,
      customContent,
      resolvedBy,
    )

    return NextResponse.json(resolvedConflict)
  } catch (error) {
    console.error("Error resolving conflict:", error)
    return NextResponse.json({ error: "Failed to resolve conflict" }, { status: 500 })
  }
}
