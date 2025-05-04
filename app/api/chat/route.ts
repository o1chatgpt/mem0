import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import OpenAI from "openai"
import { searchMemoriesBySimilarity } from "@/services/vector-store"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body first to get the message
    const body = await request.json()
    const { message, aiFamily } = body

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    if (!aiFamily) {
      return NextResponse.json({ success: false, error: "AI family member ID is required" }, { status: 400 })
    }

    // Get the current user
    const supabase = createServerComponentClient({ cookies })
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      )
    }

    if (!userData.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      )
    }

    // Get the API key from the user_settings table
    let apiKey = process.env.OPENAI_API_KEY // Fallback to environment variable

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("openai_api_key")
        .eq("user_id", userData.user.id)
        .maybeSingle()

      if (!error && data && data.openai_api_key) {
        apiKey = data.openai_api_key // Use user's API key if available
      }
    } catch (settingsError) {
      console.error("Error fetching user settings:", settingsError)
      // Continue with environment variable API key
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured", code: "API_KEY_MISSING" },
        { status: 400 },
      )
    }

    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Search for relevant memories
    const memories = await searchMemoriesBySimilarity(aiFamily, message, 5)

    // Format memories for the prompt
    const memoriesText =
      memories.length > 0
        ? "Relevant memories:\n" + memories.map((m) => `- ${m.memory}`).join("\n")
        : "No relevant memories found."

    // Create the chat completion
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use a more widely available model
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant with access to the user's memories. 
            Use these memories to provide personalized responses.
            ${memoriesText}`,
          },
          { role: "user", content: message },
        ],
      })

      return NextResponse.json({
        success: true,
        response: completion.choices[0].message.content,
        memories: memories,
      })
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError)

      // Handle specific OpenAI API errors
      if (openaiError.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid OpenAI API key", code: "INVALID_API_KEY" },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: openaiError.message || "Failed to generate response from OpenAI",
          code: "OPENAI_ERROR",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)

    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chat request" },
      { status: 500 },
    )
  }
}
