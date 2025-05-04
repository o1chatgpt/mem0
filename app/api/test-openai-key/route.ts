import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

export async function POST() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Try to get the user's API key
    let apiKey: string | null = null

    try {
      // First ensure the user_settings table exists
      await fetch("/api/setup-user-settings", {
        method: "POST",
      })

      // Now try to get the API key
      const { data, error } = await supabase
        .from("user_settings")
        .select("openai_api_key")
        .eq("user_id", userData.user.id)
        .maybeSingle()

      if (!error && data && data.openai_api_key) {
        apiKey = data.openai_api_key
      }
    } catch (error) {
      console.error("Error getting API key from user settings:", error)
      // Continue with fallback to environment variable
    }

    // Fallback to environment variable if no user API key
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY || null
    }

    if (!apiKey) {
      return NextResponse.json({ error: "No OpenAI API key found" }, { status: 400 })
    }

    // Test the API key with a simple request
    try {
      const openai = new OpenAI({ apiKey })

      // Make a simple request to test the API key
      const response = await openai.models.list()

      // If we get here, the API key is valid
      return NextResponse.json({ success: true })
    } catch (error: any) {
      console.error("OpenAI API error:", error)

      // Return a more specific error message
      if (error.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 400 })
      } else {
        return NextResponse.json({ error: error.message || "OpenAI API error" }, { status: 400 })
      }
    }
  } catch (error) {
    console.error("Error testing OpenAI API key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
