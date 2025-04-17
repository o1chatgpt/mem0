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

    const body = await request.json()
    const { action, query, messages, limit, tags, tag } = body

    // Check if Mem0 is configured for this user
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("integration_id", "mem0")
      .eq("is_active", true)
      .single()

    if (!integration) {
      return NextResponse.json({ error: "Mem0 integration not found or not active" }, { status: 404 })
    }

    // Handle different actions
    if (action === "search") {
      // Search can now include tag filtering
      const results = await searchMemories(query || "", session.user.id, limit || 5, tag)
      return NextResponse.json({ results })
    } else if (action === "add") {
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages array is required for adding memories" }, { status: 400 })
      }

      // Add memory with optional tags
      await addMemory(messages, session.user.id, tags)
      return NextResponse.json({ success: true })
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
    // For getTags action, return empty array instead of error
    const body = await request.json().catch(() => ({}))
    if (body && body.action === "getTags") {
      return NextResponse.json({ tags: [] })
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
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("integration_id", "mem0")
      .eq("is_active", true)
      .single()

    if (!integration) {
      return NextResponse.json({ error: "Mem0 integration not found or not active" }, { status: 404 })
    }

    // Get user memories
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const tag = searchParams.get("tag")

    const results = await getUserMemories(session.user.id, limit, tag)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in Mem0 API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
