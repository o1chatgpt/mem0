"use server"

import { type NextRequest, NextResponse } from "next/server"
import { conflictAnalyticsService } from "@/lib/conflict-analytics-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const documentStats = await conflictAnalyticsService.getDocumentConflictStats(documentId)

    // Add cache control headers
    const response = NextResponse.json(documentStats)
    response.headers.set("Cache-Control", "public, max-age=600") // 10 minutes
    return response
  } catch (error) {
    console.error("Error fetching document conflict stats:", error)
    return NextResponse.json({ error: "Failed to fetch document conflict stats" }, { status: 500 })
  }
}
