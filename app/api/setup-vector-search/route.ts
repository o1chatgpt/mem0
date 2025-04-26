import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Create the match_memories function for vector similarity search
    const { error } = await supabase.rpc("create_match_memories_function", {})

    if (error) {
      console.error("Error creating match_memories function:", error)
      return NextResponse.json({ success: false, error: "Failed to create match_memories function" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Vector search function created successfully" })
  } catch (error) {
    console.error("Error setting up vector search:", error)
    return NextResponse.json({ success: false, error: "Failed to set up vector search" }, { status: 500 })
  }
}
