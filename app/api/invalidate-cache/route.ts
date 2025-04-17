"use server"

import { type NextRequest, NextResponse } from "next/server"
import { conflictAnalyticsService } from "@/lib/conflict-analytics-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id } = body

    if (!type) {
      return NextResponse.json({ error: "Cache type is required" }, { status: 400 })
    }

    switch (type) {
      case "all":
        await conflictAnalyticsService.invalidateAllCaches()
        break
      case "user":
        if (!id) {
          return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }
        await conflictAnalyticsService.invalidateUserCache(id)
        break
      case "document":
        if (!id) {
          return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
        }
        await conflictAnalyticsService.invalidateDocumentCache(id)
        break
      default:
        return NextResponse.json({ error: "Invalid cache type" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Cache invalidated successfully" })
  } catch (error) {
    console.error("Error invalidating cache:", error)
    return NextResponse.json({ error: "Failed to invalidate cache" }, { status: 500 })
  }
}
