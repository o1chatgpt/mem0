import { NextResponse } from "next/server"
import { initializeCrewAITables } from "@/lib/crewai/crewai-service"
import { initializeBlogTables } from "@/lib/crewai/blog-creator"

export async function POST() {
  try {
    // Initialize CrewAI tables
    const crewResult = await initializeCrewAITables()

    // Initialize blog tables
    const blogResult = await initializeBlogTables()

    if (crewResult.success && blogResult.success) {
      return NextResponse.json({ success: true, message: "CrewAI tables initialized successfully" })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: crewResult.error || blogResult.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initializing CrewAI tables:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
