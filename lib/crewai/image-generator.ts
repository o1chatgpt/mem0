import { put } from "@vercel/blob"
import { addMemory } from "@/lib/mem0"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface GeneratedImage {
  url: string
  prompt: string
  width: number
  height: number
  model: string
  created_at: string
}

// Generate image prompt from text
export async function generateImagePrompt(
  text: string,
  style?: string,
  userId?: number,
  aiMemberId?: number,
): Promise<string> {
  try {
    // Get a valid API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("No valid OpenAI API key available")
    }

    // Create prompt for AI
    const prompt = `
      I need you to create a detailed image generation prompt based on the following text.
      
      TEXT: ${text}
      
      ${style ? `STYLE GUIDANCE: ${style}` : ""}
      
      Create a detailed, descriptive prompt that would work well for image generation.
      The prompt should be specific, visual, and include details about style, mood, lighting, and composition.
      
      Return ONLY the image generation prompt, nothing else.
    `

    // Generate image prompt using AI
    const { text: generatedPrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      apiKey,
    })

    // Store memory of prompt generation
    if (userId) {
      await addMemory(
        `Generated image prompt from text: "${text.substring(0, 100)}...". Prompt: "${generatedPrompt.substring(0, 100)}..."`,
        userId,
        aiMemberId,
        "Image Generation",
      )
    }

    return generatedPrompt.trim()
  } catch (error) {
    console.error("Error generating image prompt:", error)
    throw new Error(`Failed to generate image prompt: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Generate image using external API (placeholder for actual implementation)
export async function generateImage(
  prompt: string,
  userId: number,
  aiMemberId?: number,
  options?: {
    width?: number
    height?: number
    model?: string
  },
): Promise<GeneratedImage> {
  try {
    // This is a placeholder for actual image generation
    // In a real implementation, you would call an image generation API like DALL-E, Midjourney, etc.

    // For now, we'll use a placeholder image service
    const width = options?.width || 512
    const height = options?.height || 512
    const model = options?.model || "placeholder"

    // Create a placeholder image URL with the prompt encoded
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://placehold.co/${width}x${height}/png/ffffff?text=${encodedPrompt.substring(0, 50)}`

    // In a real implementation, you would upload the generated image to Vercel Blob
    // For now, we'll just return the placeholder URL

    // Store memory of image generation
    await addMemory(
      `Generated image from prompt: "${prompt.substring(0, 100)}...". Model: ${model}.`,
      userId,
      aiMemberId,
      "Image Generation",
    )

    return {
      url: imageUrl,
      prompt,
      width,
      height,
      model,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error generating image:", error)
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Upload a generated image to blob storage
export async function saveGeneratedImage(imageUrl: string, userId: number, prompt: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const imageBlob = await response.blob()

    // Generate a filename based on the prompt
    const safePrompt = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `${Date.now()}-${safePrompt}.png`
    const blobPath = `generated-images/${userId}/${fileName}`

    // Upload to Vercel Blob
    const blob = await put(blobPath, imageBlob, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error saving generated image:", error)
    throw new Error(`Failed to save generated image: ${error instanceof Error ? error.message : String(error)}`)
  }
}
