import { getMemoriesForAIFamily } from "@/lib/mem0-integration"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, aiFamily } = await req.json()

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key is missing. Please add it in the settings.",
        }),
        { status: 400 },
      )
    }

    // Get memories for this AI family member if available
    let memories = []
    if (aiFamily && process.env.MEM0_API_KEY && process.env.MEM0_API_URL) {
      try {
        memories = await getMemoriesForAIFamily(aiFamily)
      } catch (error) {
        console.error("Error fetching memories:", error)
        // Continue without memories if there's an error
      }
    }

    // Create a system message with the AI family context and memories
    let systemMessage = "You are a helpful AI assistant."

    if (aiFamily) {
      // Add memories to the system message if available
      if (memories && memories.length > 0) {
        systemMessage += "\n\nHere are some memories that might be relevant to our conversation:\n\n"
        memories.forEach((memory: any, index: number) => {
          systemMessage += `Memory ${index + 1}: ${memory.content}\n`
        })
      }
    }

    // Add the system message to the beginning of the messages array
    const messagesWithSystem = [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ]

    // Request the OpenAI API for the response
    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   stream: true,
    //   messages: messagesWithSystem,
    // })

    // // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response)

    // // Respond with the stream
    // return new StreamingTextResponse(stream)
    const result = streamText({
      model: openai("gpt-4-turbo"),
      system: "You are a helpful assistant.",
      messages: messagesWithSystem,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "There was an error processing your request. Please try again.",
      }),
      { status: 500 },
    )
  }
}
