import { type NextRequest, NextResponse } from "next/server"
import { intelligentConflictService } from "@/lib/intelligent-conflict-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conflictId, strategy, content, resolvedBy, reasoning } = body

    const resolvedConflict = await intelligentConflictService.resolveConflict(conflictId, {
      strategy,
      content,
      resolvedBy,
      reasoning,
    })

    return NextResponse.json(resolvedConflict)
  } catch (error) {
    console.error("Error resolving conflict:", error)
    return NextResponse.json({ error: "Failed to resolve conflict" }, { status: 500 })
  }
}
