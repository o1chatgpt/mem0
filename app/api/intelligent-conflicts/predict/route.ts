import { type NextRequest, NextResponse } from "next/server"
import { intelligentConflictService } from "@/lib/intelligent-conflict-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get("documentId")
    const userId = searchParams.get("userId")
    const section = searchParams.get("section")

    if (!documentId || !userId || !section) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const prediction = await intelligentConflictService.predictConflicts(documentId, userId, section)

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error("Error predicting conflicts:", error)
    return NextResponse.json({ error: "Failed to predict conflicts" }, { status: 500 })
  }
}
