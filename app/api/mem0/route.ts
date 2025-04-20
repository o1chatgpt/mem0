import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"
import { searchMemories, addMemory, getUserMemories } from "@/lib/mem0-client"
import { getUserTags } from "@/lib/mem0-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { action, query, messages, limit, tags, tag } = body

    // Check if Mem0 is configured for this user
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("integration_id", "mem0")
      .eq("is_active", true)
      .single()

    if (integrationError || !integration) {
      console.warn("Mem0 integration not found or not active:", integrationError)

      // For getTags action, return empty array instead of error
      if (action === "getTags") {
        return NextResponse.json({ tags: [] })
      }

      // For search action, return empty results instead of error
      if (action === "search") {
        return NextResponse.json({ results: { results: [] } })
      }

      return NextResponse.json({ error: "Mem0 integration not found or not active" }, { status: 404 })
    }

    // Handle different actions
    if (action === "search") {
      try {
        // Search can now include tag filtering
        const results = await searchMemories(query || "", session.user.id, limit || 5, tag)
        return NextResponse.json({ results })
      } catch (searchError) {
        console.error("Error searching memories:", searchError)
        // Return empty results instead of error
        return NextResponse.json({ results: { results: [] } })
      }
    } else if (action === "add") {
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages array is required for adding memories" }, { status: 400 })
      }

      try {
        // Add memory with optional tags
        await addMemory(messages, session.user.id, tags)
        return NextResponse.json({ success: true })
      } catch (addError) {
        console.error("Error adding memory:", addError)
        return NextResponse.json({ error: "Failed to add memory" }, { status: 500 })
      }
    } else if (action === "getTags") {
      try {
        // New action to get all user tags
        const tags = await getUserTags(session.user.id)
        return NextResponse.json({ tags })
      } catch (tagError) {
        console.error("Error getting tags:", tagError)
        // Return empty tags array instead of error
        return NextResponse.json({ tags: [] })
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in Mem0 API:", error)

    // Determine the action from the request to provide appropriate fallback
    let action = "unknown"
    try {
      const body = await request.json()
      action = body.action
    } catch (e) {
      // Ignore parsing errors
    }

    // For getTags action, return empty array instead of error
    if (action === "getTags") {
      return NextResponse.json({ tags: [] })
    }

    // For search action, return empty results instead of error
    if (action === "search") {
      return NextResponse.json({ results: { results: [] } })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Mem0 is configured for this user
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("integration_id", "mem0")
      .eq("is_active", true)
      .single()

    if (integrationError || !integration) {
      console.warn("Mem0 integration not found or not active:", integrationError)
      return NextResponse.json({ results: { results: [] } })
    }

    // Get user memories
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const tag = searchParams.get("tag")

    try {
      const results = await getUserMemories(session.user.id, limit, tag)
      return NextResponse.json({ results })
    } catch (memoryError) {
      console.error("Error getting user memories:", memoryError)
      return NextResponse.json({ results: { results: [] } })
    }
  } catch (error) {
    console.error("Error in Mem0 API:", error)
    return NextResponse.json({ results: { results: [] } })
  }
}
