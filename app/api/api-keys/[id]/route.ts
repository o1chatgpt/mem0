import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { is_active } = body

    if (is_active === undefined) {
      return NextResponse.json({ error: "is_active is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update the API key
    const { data, error } = await supabase.from("api_keys").update({ is_active }).eq("id", id).select()

    if (error) {
      console.error("Error updating API key:", error)
      return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
    }

    return NextResponse.json({ key: data[0] })
  } catch (error) {
    console.error("Error in API keys PATCH route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const supabase = createServerClient()

    // Delete the API key
    const { error } = await supabase.from("api_keys").delete().eq("id", id)

    if (error) {
      console.error("Error deleting API key:", error)
      return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in API keys DELETE route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
