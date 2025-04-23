import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check if api_keys table exists
    try {
      const { count, error: countError } = await supabase.from("api_keys").select("*", { count: "exact", head: true })

      // If there's an error, the table might not exist
      if (countError) {
        console.error("Error checking api_keys table:", countError)
        // Create the table
        await supabase.rpc("create_table", {
          table_name: "api_keys",
          table_definition: `
            id SERIAL PRIMARY KEY,
            service VARCHAR(255) NOT NULL,
            key TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE
          `,
        })
      }
    } catch (error) {
      console.error("Error checking api_keys table:", error)
      return NextResponse.json({ error: "Failed to check api_keys table" }, { status: 500 })
    }

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
