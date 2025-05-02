import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import OpenAI from "openai"
import { searchMemoriesBySimilarity } from "@/services/vector-store"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createServerComponentClient({ cookies })
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Get the API key from the user_settings table
    const { data, error } = await supabase
      .from("user_settings")
      .select("openai_api_key")
      .eq("user_id", userData.user.id)
      .single()

    let apiKey = process.env.OPENAI_API_KEY // Fallback to environment variable

    if (!error && data && data.openai_api_key) {
      apiKey = data.openai_api_key // Use user's API key if available
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "OpenAI API key not configured" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()
    const { message, userId } = body

    // Initialize OpenAI client with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Search for relevant memories
    const memories = await searchMemoriesBySimilarity(message, userId)

    // Format memories for the prompt
    const memoriesText =
      memories.length > 0
        ? "Relevant memories:\n" + memories.map((m) => `- ${m.text}`).join("\n")
        : "No relevant memories found."

    // Create the chat completion
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
  } catch (error: any) {
    console.error("Error in chat API:", error)

    // Handle specific OpenAI API errors
    if (error.status === 401) {
      return NextResponse.json({ success: false, error: "Invalid OpenAI API key" }, { status: 401 })
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chat request" },
      { status: 500 },
    )
  }
}
