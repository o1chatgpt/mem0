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
    // and use it to generate predictions

    // For now, let's generate a mock prediction using OpenAI
    const apiKey = process.env.OPENAI_API_KEY

    const prompt = `
      Generate a prediction of memory growth for a file management application.
      The prediction should include historical data, predicted future data, and category-specific predictions.
      
      Format the response as a JSON object with the following structure:
      {
        "historical": [
          { "month": "2023-01", "count": 45 },
          ...
        ],
        "predicted": [
          { "month": "2023-07", "count": 93, "isPrediction": true },
          ...
        ],
        "trend": "increasing|decreasing|stable",
        "confidence": 0.85,
        "averageGrowthRate": 0.12,
        "categoryPredictions": [
          { "category": "File Operations", "currentCount": 98, "predictedCount": 120, "growth": 22.4 },
          ...
        ]
      }
      
      Make the prediction realistic with 6 months of historical data and 3 months of predictions.
      Include 5 categories in the categoryPredictions array.
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        apiKey,
      })

      // Parse the JSON response
      const prediction = JSON.parse(text)

      return NextResponse.json({ prediction })
    } catch (error) {
      console.error("Error generating prediction with OpenAI:", error)
      return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in memory prediction API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
