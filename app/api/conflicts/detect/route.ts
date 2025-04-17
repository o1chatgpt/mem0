import { type NextRequest, NextResponse } from "next/server"
import { conflictResolutionService } from "@/lib/conflict-resolution-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, section, userA, userB } = body

    const conflict = await conflictResolutionService.detectConflict(
      documentId,
      section,
      userA.id,
      userA.name,
      userA.content,
      userB.id,
      userB.name,
      userB.content,
    )

    return NextResponse.json(conflict)
  } catch (error) {
    console.error("Error detecting conflict:", error)
    return NextResponse.json({ error: "Failed to detect conflict" }, { status: 500 })
  }
}
