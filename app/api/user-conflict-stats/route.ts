import { type NextRequest, NextResponse } from "next/server"
import { conflictAnalyticsService } from "@/lib/conflict-analytics-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const userStats = await conflictAnalyticsService.getUserConflictStats(userId)

    return NextResponse.json(userStats)
  } catch (error) {
    console.error("Error fetching user conflict stats:", error)
    return NextResponse.json({ error: "Failed to fetch user conflict stats" }, { status: 500 })
  }
}
