import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"

export async function POST() {
  try {
    // Check if we have the required environment variables
    // Using MEM0_API_KEY (without NEXT_PUBLIC_) to keep it server-side only
    if (!process.env.MEM0_API_URL || !process.env.MEM0_API_KEY) {
      return NextResponse.json(
        { error: "Missing Mem0 API configuration. Please check your environment variables." },
        { status: 500 },
      )
    }

    // Check if we can connect to the database
    const supabase = createServerClient()

    // Simple query to test the connection
    const { error: connectionError } = await supabase.from("fm_memories").select("count").limit(1)

    if (connectionError) {
      // If the table doesn't exist, it's not necessarily an error - we'll create it
      if (!connectionError.message.includes("does not exist")) {
        return NextResponse.json({ error: `Database connection error: ${connectionError.message}` }, { status: 500 })
      }
    }

    // Initialize the tables
    try {
      // Create the memories table if it doesn't exist
      await supabase.rpc("create_memories_table_if_not_exists")

      // Create the memory categories table if it doesn't exist
      await supabase.rpc("create_memory_categories_table_if_not_exists")
    } catch (initError) {
      // If the RPC functions don't exist, we'll try to create the tables directly
      console.error("Error initializing tables via RPC:", initError)

      // Fallback to direct SQL (this is less ideal but works as a fallback)
      try {
        await supabase.from("fm_memories").select("count").limit(1)
      } catch (tableError) {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS fm_memories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            content TEXT NOT NULL,
            user_id TEXT NOT NULL,
            ai_member_id TEXT,
            category TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            embedding VECTOR(1536)
          )
        `)

        if (createError) {
          return NextResponse.json(
            { error: `Failed to create memories table: ${createError.message}` },
            { status: 500 },
          )
        }
      }

      try {
        await supabase.from("fm_memory_categories").select("count").limit(1)
      } catch (tableError) {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS fm_memory_categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            icon TEXT,
            user_id TEXT NOT NULL,
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `)

        if (createError) {
          return NextResponse.json(
            { error: `Failed to create memory categories table: ${createError.message}` },
            { status: 500 },
          )
        }
      }
    }

    return NextResponse.json({ success: true, message: "Mem0 integration initialized successfully" })
  } catch (error) {
    console.error("Error in Mem0 initialization:", error)
    return NextResponse.json(
      { error: `Failed to initialize Mem0 integration: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
