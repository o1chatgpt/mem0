import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"

// Helper function to detect API provider based on key format
function detectApiProvider(apiKey: string): "openai" | "groq" | "unknown" {
  if (!apiKey) return "unknown"

  // Check for Groq API key formats first
  if (apiKey.startsWith("gsk_") || apiKey.startsWith("sk-proj-")) {
    return "groq"
  }

  // Then check for OpenAI API key formats
  if (apiKey.startsWith("sk-")) {
    return "openai"
  }

  return "unknown"
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Detect the API provider based on the key format
    const apiProvider = detectApiProvider(apiKey)
    console.log(`Detected API provider: ${apiProvider}`)

    if (apiProvider === "unknown") {
      return NextResponse.json({ error: "Unknown API key format. Please check your API key." }, { status: 400 })
    }

    // Define models to try based on the provider
    let modelsToTry: string[] = []

    if (apiProvider === "openai") {
      modelsToTry = ["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo-0125"]
    } else if (apiProvider === "groq") {
      modelsToTry = ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]
    }

    let lastError = null
    let workingModel = null

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing API key with ${apiProvider} model: ${modelName}`)

        if (apiProvider === "openai") {
          const { text } = await generateText({
            model: openai(modelName),
            prompt: "Hello, this is a test message to verify the API connection.",
            apiKey,
          })
          workingModel = modelName
          console.log(`API key is valid with ${apiProvider} model: ${modelName}`)
          break
        } else if (apiProvider === "groq") {
          const { text } = await generateText({
            model: groq(modelName),
            prompt: "Hello, this is a test message to verify the API connection.",
            apiKey,
          })
          workingModel = modelName
          console.log(`API key is valid with ${apiProvider} model: ${modelName}`)
          break
        }
      } catch (error) {
        console.warn(`Failed to connect using ${apiProvider} model ${modelName}:`, error)
        lastError = error
        // Continue to the next model
      }
    }

    if (workingModel) {
      return NextResponse.json({
        success: true,
        message: `API key is valid with ${apiProvider.toUpperCase()} model: ${workingModel}`,
        provider: apiProvider,
      })
    } else {
      // Provide a more helpful error message based on the provider
      let errorMessage = `Failed to validate ${apiProvider.toUpperCase()} API key with any model. `

      if (apiProvider === "openai") {
        errorMessage += "Please check your OpenAI API key and permissions. Make sure you have access to the models."
      } else if (apiProvider === "groq") {
        errorMessage += "Please check your Groq API key and permissions. Make sure you have access to the models."
      }

      if (lastError?.message) {
        errorMessage += ` Error: ${lastError.message}`
      }

      return NextResponse.json(
        {
          error: errorMessage,
          provider: apiProvider,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing API key:", error)

    let errorMessage = "Failed to validate API key"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
