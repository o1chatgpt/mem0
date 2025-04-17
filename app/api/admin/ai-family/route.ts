import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("ai_family_members").select("*").order("name")

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ members: data })
  } catch (error) {
    console.error("Error fetching AI family members:", error)
    return NextResponse.json({ error: "Failed to fetch AI family members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const member = await request.json()

    // Validate required fields
    if (!member.id || !member.name || !member.specialty) {
      return NextResponse.json({ error: "ID, name, and specialty are required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.from("ai_family_members").insert(member).select().single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error("Error creating AI family member:", error)
    return NextResponse.json({ error: "Failed to create AI family member" }, { status: 500 })
  }
}
