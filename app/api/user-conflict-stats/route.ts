"use server"

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

    // Add cache control headers
    const response = NextResponse.json(userStats)
    response.headers.set("Cache-Control", "public, max-age=600") // 10 minutes
    return response
  } catch (error) {
    console.error("Error fetching user conflict stats:", error)
    return NextResponse.json({ error: "Failed to fetch user conflict stats" }, { status: 500 })
  }
}
