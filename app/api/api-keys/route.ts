import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import { ensureApiKeysTable } from "@/lib/api-key-utils"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Ensure the api_keys table exists
    await ensureApiKeysTable()

    // Fetch all API keys
    const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching API keys:", error)
      return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
    }

    return NextResponse.json({ keys: data })
  } catch (error) {
    console.error("Error in API keys GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, key } = body

    if (!service || !key) {
      return NextResponse.json({ error: "Service and key are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Ensure the api_keys table exists
    await ensureApiKeysTable()

    // Insert the new API key
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        service,
        key,
      })
      .select()

    if (error) {
      console.error("Error adding API key:", error)
      return NextResponse.json({ error: "Failed to add API key" }, { status: 500 })
    }

    return NextResponse.json({ key: data[0] })
  } catch (error) {
    console.error("Error in API keys POST route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
