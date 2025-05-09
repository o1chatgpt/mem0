import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"

export async function GET() {
  try {
    // Create a simple response object
    const response = {
      status: "disconnected",
      message: "",
    }

    // Check if we have the required environment variables
    if (!process.env.MEM0_API_URL || !process.env.MEM0_API_KEY) {
      response.message = "Missing Mem0 API configuration. Please check your environment variables."
      return NextResponse.json(response)
    }

    // Get the Supabase client
    const supabase = createServerClient()

    // Simple ping to check if Supabase is connected
    try {
      // Use a simple query that doesn't depend on specific tables
      const { data, error } = await supabase.rpc("get_server_version")

      if (error) {
        response.message = "Database connection error: Unable to connect to Supabase"
        return NextResponse.json(response)
      }

      // If we got here, the connection is working
      response.status = "connected"
      response.message = "Memory system is properly configured"
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      response.message = "Database connection error: " + (dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json(response)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in Mem0 status check:", error)
    return NextResponse.json({
      status: "error",
      message: "An unexpected error occurred: " + (error instanceof Error ? error.message : String(error)),
    })
  }
}
