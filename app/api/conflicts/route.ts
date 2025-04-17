import { type NextRequest, NextResponse } from "next/server"
import { conflictResolutionService } from "@/lib/conflict-resolution-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 })
    }

    const conflicts = await conflictResolutionService.getConflictHistory(documentId)

    return NextResponse.json(conflicts)
  } catch (error) {
    console.error("Error getting conflicts:", error)
    return NextResponse.json({ error: "Failed to get conflicts" }, { status: 500 })
  }
}
