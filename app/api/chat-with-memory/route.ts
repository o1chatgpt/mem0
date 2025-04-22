import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { searchMemories } from "@/lib/mem0"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, aiFamily, relevantMemories = [] } = await req.json()

    if (!aiFamily) {
      throw new Error("AI family member ID is required")
    }

    // Get the last user message for context
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || ""

    // If no relevant memories were provided, fetch them based on the last user message
    let memories = relevantMemories
    if (relevantMemories.length === 0 && lastUserMessage) {
      memories = await searchMemories(aiFamily, lastUserMessage, "default_user", 5)
    }

    // Format memories as a string
    const memoriesText =
      memories && memories.length > 0
        ? `Relevant memories:\n${memories.map((m) => `- ${m.memory}`).join("\n")}`
        : "No specific memories available."

    // Create system message with personality and memories
    const systemMessage = {
      role: "system",
      content: `You are Mem0, an AI assistant with enhanced memory capabilities. You can remember past conversations and user preferences.
      
${memoriesText}

Use these memories to provide personalized and contextually relevant responses. If the memories contain information that's relevant to the user's query, incorporate that information in your response. If you're not sure about something, you can acknowledge what you remember and what you don't.

Your personality is detail-oriented, personalized, contextual, and adaptive. You excel at remembering user preferences, past conversations, and providing highly personalized assistance.`,
    }

    // Add system message to the beginning of the messages array
    const augmentedMessages = [systemMessage, ...messages]

    const result = streamText({
      model: openai("gpt-4o"),
      messages: augmentedMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Error processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
