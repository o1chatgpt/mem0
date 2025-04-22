import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const aiFamily = url.searchParams.get("aiFamily")

    if (!aiFamily) {
      return NextResponse.json({ success: false, error: "AI family member ID is required" }, { status: 400 })
    }

    // Get count of memories for the AI family member
    const { count, error } = await supabase
      .from("ai_family_member_memories")
      .select("*", { count: "exact", head: true })
      .eq("ai_family_member_id", aiFamily)

    if (error) {
      console.error("Error counting memories:", error)
      return NextResponse.json({ success: false, error: "Failed to count memories" }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (error) {
    console.error("Error in memory count API:", error)
    return NextResponse.json({ success: false, error: "Error processing your request" }, { status: 500 })
  }
}
