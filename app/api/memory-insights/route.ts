import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { hasValidOpenAIKey } from "@/lib/api-key-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, aiMemberId } = body

    // Check if we have a valid OpenAI API key
    const isValidKey = await hasValidOpenAIKey()

    if (!isValidKey) {
      return NextResponse.json({ error: "No valid OpenAI API key available" }, { status: 400 })
    }

    // In a real implementation, we would fetch memory data from the database
    // and use it to generate insights

    // For now, let's generate some mock insights using OpenAI
    const apiKey = process.env.OPENAI_API_KEY

    const prompt = `
      Generate 5 insightful observations about a user's memory data in a file management application.
      The insights should be varied and include patterns, trends, recommendations, and analysis.
      
      Format the response as a JSON array with the following structure:
      [
        {
          "id": 1,
          "title": "Short insight title",
          "description": "Detailed description of the insight",
          "type": "pattern|trend|recommendation|analysis",
          "confidence": 0.85,
          "category": "Category name"
        }
      ]
      
      Make the insights realistic and specific to file management, memory usage, and user behavior.
      Include insights about file operations, memory growth, content organization, and feature usage.
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        apiKey,
      })

      // Parse the JSON response
      const insights = JSON.parse(text)

      return NextResponse.json({ insights })
    } catch (error) {
      console.error("Error generating insights with OpenAI:", error)
      return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in memory insights API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
