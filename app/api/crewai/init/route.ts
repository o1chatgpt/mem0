import { NextResponse } from "next/server"
import { initializeCrewAITables } from "@/lib/crewai/crewai-service"
import { initializeBlogTables } from "@/lib/crewai/blog-creator"

// Enhance the initialization route to be more robust
export async function POST() {
  try {
    // Initialize CrewAI tables with better error handling
    let crewResult
    try {
      crewResult = await initializeCrewAITables()
      console.log("CrewAI tables initialization result:", crewResult)
    } catch (crewError) {
      console.error("Error in CrewAI tables initialization:", crewError)
      crewResult = { success: false, error: String(crewError) }
    }

    // Initialize blog tables with better error handling
    let blogResult
    try {
      blogResult = await initializeBlogTables()
      console.log("Blog tables initialization result:", blogResult)
    } catch (blogError) {
      console.error("Error in blog tables initialization:", blogError)
      blogResult = { success: false, error: String(blogError) }
    }

    // Return detailed status
    return NextResponse.json({
      success: crewResult.success && blogResult.success,
      crewTables: crewResult,
      blogTables: blogResult,
      message: "CrewAI initialization completed with status details",
    })
  } catch (error) {
    console.error("Unhandled error in CrewAI initialization:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: "Unhandled error during initialization",
      },
      { status: 500 },
    )
  }
}
