import { NextResponse } from "next/server"
import { initializeCrewAITables } from "@/lib/crewai/crewai-service"
import { initializeBlogTables } from "@/lib/crewai/blog-creator"
import { createServerClient } from "@/lib/db"

// Enhanced initialization route with better error handling and fallbacks
export async function POST() {
  try {
    console.log("Starting CrewAI initialization...")

    // First, check if we can connect to the database
    const supabase = createServerClient()
    try {
      // Simple query to test connection - use a table that should exist
      const { data, error } = await supabase.from("fm_ai_members").select("*").limit(1)

      if (error) {
        console.error("Database connection test error:", error)
        // Try to create the table if it doesn't exist
        const { error: createError } = await supabase.rpc("create_table", {
          table_name: "fm_ai_members",
          table_definition: `
           id SERIAL PRIMARY KEY,
           name TEXT NOT NULL,
           role TEXT NOT NULL,
           specialty TEXT NOT NULL,
           description TEXT,
           user_id INTEGER NOT NULL,
           created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
           updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
         `,
        })

        if (createError) {
          console.error("Error creating fm_ai_members table:", createError)
        }
      } else {
        console.log("Database connection successful")
      }
    } catch (connectionError) {
      console.error("Database connection error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: String(connectionError),
        },
        { status: 500 },
      )
    }

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
    let blogResult = { success: true }
    try {
      if (typeof initializeBlogTables === "function") {
        blogResult = await initializeBlogTables()
        console.log("Blog tables initialization result:", blogResult)
      } else {
        console.log("Blog tables initialization skipped - function not available")
      }
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
