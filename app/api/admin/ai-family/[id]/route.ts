import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "AI family member not found" }, { status: 404 })
      }
      throw new Error(error.message)
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error("Error fetching AI family member:", error)
    return NextResponse.json({ error: "Failed to fetch AI family member" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.from("ai_family_members").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error("Error updating AI family member:", error)
    return NextResponse.json({ error: "Failed to update AI family member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("ai_family_members").delete().eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting AI family member:", error)
    return NextResponse.json({ error: "Failed to delete AI family member" }, { status: 500 })
  }
}
