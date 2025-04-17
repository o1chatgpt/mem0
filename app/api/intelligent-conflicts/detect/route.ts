import { type NextRequest, NextResponse } from "next/server"
import { intelligentConflictService } from "@/lib/intelligent-conflict-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, documentType, section, position, userEdits, context } = body

    const conflict = await intelligentConflictService.detectConflict(
      documentId,
      documentType,
      section,
      position,
      userEdits,
      context,
    )

    return NextResponse.json(conflict)
  } catch (error) {
    console.error("Error detecting conflict:", error)
    return NextResponse.json({ error: "Failed to detect conflict" }, { status: 500 })
  }
}
