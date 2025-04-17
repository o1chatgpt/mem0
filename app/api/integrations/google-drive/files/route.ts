import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's Google Drive integration
    const { data: integrations } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("integration_id", "google")
      .eq("is_active", true)
      .single()

    if (!integrations || !integrations.config?.access_token) {
      return NextResponse.json({ error: "Google Drive integration not found or not configured" }, { status: 404 })
    }

    // Fetch files from Google Drive API
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,modifiedTime)",
      {
        headers: {
          Authorization: `Bearer ${integrations.config.access_token}`,
        },
      },
    )

    if (!response.ok) {
      // Token might be expired
      if (response.status === 401) {
        // In a real app, you would refresh the token here
        return NextResponse.json({ error: "Google Drive token expired" }, { status: 401 })
      }

      return NextResponse.json({ error: "Failed to fetch files from Google Drive" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Google Drive files:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
