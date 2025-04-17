import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("voice_service_config").select("*").order("id")

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ services: data })
  } catch (error) {
    console.error("Error fetching voice services:", error)
    return NextResponse.json({ error: "Failed to fetch voice services" }, { status: 500 })
  }
}
