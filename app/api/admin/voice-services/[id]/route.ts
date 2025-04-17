import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin-auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await request.json()

    // Validate the ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // If setting this service as default, first unset all others
    if (updates.is_default) {
      await supabase.from("voice_service_config").update({ is_default: false }).neq("id", Number(id))
    }

    // Update the specified service
    const { data, error } = await supabase
      .from("voice_service_config")
      .update(updates)
      .eq("id", Number(id))
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ service: data })
  } catch (error) {
    console.error("Error updating voice service:", error)
    return NextResponse.json({ error: "Failed to update voice service" }, { status: 500 })
  }
}
