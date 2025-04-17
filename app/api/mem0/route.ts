import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"
import { searchMemories, addMemory, getUserMemories } from "@/lib/mem0-client"

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
    const { action, query, messages, limit } = body

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
      if (!query) {
        return NextResponse.json({ error: "Query is required for search" }, { status: 400 })
      }

      const results = await searchMemories(query, session.user.id, limit || 5)
      return NextResponse.json({ results })
    } else if (action === "add") {
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages array is required for adding memories" }, { status: 400 })
      }

      await addMemory(messages, session.user.id)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in Mem0 API:", error)
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

    const results = await getUserMemories(session.user.id, limit)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in Mem0 API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
