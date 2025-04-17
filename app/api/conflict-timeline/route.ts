import { type NextRequest, NextResponse } from "next/server"
import { conflictAnalyticsService } from "@/lib/conflict-analytics-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = (searchParams.get("timeRange") as "week" | "month" | "year") || "month"
    const userId = searchParams.get("userId") || undefined
    const documentId = searchParams.get("documentId") || undefined

    const timeline = await conflictAnalyticsService.getConflictTimeline(timeRange, userId)

    return NextResponse.json(timeline)
  } catch (error) {
    console.error("Error fetching conflict timeline:", error)
    return NextResponse.json({ error: "Failed to fetch conflict timeline" }, { status: 500 })
  }
}
