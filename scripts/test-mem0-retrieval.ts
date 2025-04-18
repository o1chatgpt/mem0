// Script to test memory retrieval functionality
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Test queries
const testQueries = [
  "How do I organize my files?",
  "What's my preference for viewing files?",
  "Tell me about the API rate limits",
  "When is my presentation due?",
  "What project am I working on?",
  "How do I share files with my team?",
  "What file types do I work with most often?",
  "What's my storage limit?",
  "How do I batch rename files?",
  "What's my preference for the interface theme?",
]

// Function to search memories
async function searchMemories(query: string, userId: number) {
  // Get all memories for this user
  const { data: allMemories, error } = await supabase.from("fm_memories").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching memories:", error)
    return []
  }

  if (!allMemories || allMemories.length === 0) {
    return []
  }

  // Calculate relevance scores for each memory
  const scoredMemories = allMemories.map((memory) => {
    // Base score starts at 0
    let score = 0

    // Content relevance - check if query terms appear in the memory
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2)
    const memoryContent = memory.content.toLowerCase()

    // Score based on term matches
    for (const term of queryTerms) {
      if (memoryContent.includes(term)) {
        // More points for exact matches
        score += 5

        // Additional points for matches at the beginning of the content
        if (memoryContent.startsWith(term)) {
          score += 3
        }
      }
    }

    // Recency factor - newer memories get higher scores
    const memoryAge = Date.now() - new Date(memory.created_at).getTime()
    const recencyScore = Math.max(10 - Math.floor(memoryAge / (1000 * 60 * 60 * 24)), 0) // 0-10 points based on days old
    score += recencyScore

    return {
      ...memory,
      relevance_score: score,
    }
  })

  // Sort by relevance score (highest first) and take the top results
  return scoredMemories.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0)).slice(0, 5)
}

// Function to generate a response with memory context
async function generateResponseWithMemory(query: string, userId: number) {
  // Get relevant memories
  const relevantMemories = await searchMemories(query, userId)

  // Format memories for context
  const formattedMemories = relevantMemories
    .map((memory, index) => {
      const date = new Date(memory.created_at).toLocaleDateString()
      const relevance = memory.relevance_score ? ` (relevance: ${memory.relevance_score})` : ""
      const category = memory.category ? ` [Category: ${memory.category}]` : ""
      return `[Memory ${index + 1}]${relevance}${category} ${date}: ${memory.content}`
    })
    .join("\n\n")

  // Create system prompt
  const systemPrompt = `You are a helpful AI assistant with memory capabilities.
You have access to the following relevant memories from past interactions:

${formattedMemories || "No specific memories found for this query."}

Guidelines for using memories:
1. Prioritize memories with higher relevance scores when they're available
2. Reference specific memories when they directly answer the user's question
3. Use memories to personalize your response and maintain continuity
4. If memories contradict each other, prefer more recent ones
5. If the memories don't contain relevant information, respond based on your general knowledge
6. Don't explicitly mention "Memory 1", "Memory 2", etc. in your response - integrate the information naturally

Current user query: "${query}"
`

  // Generate response
  const { text } = await generateText({
    model: openai(process.env.OPENAI_MODEL || "gpt-3.5-turbo"),
    system: systemPrompt,
    prompt: query,
  })

  return {
    query,
    response: text,
    memories: relevantMemories,
    memoryCount: relevantMemories.length,
  }
}

// Main function to run tests
async function runTests() {
  console.log("Testing mem0 retrieval functionality...\n")

  const userId = 1 // Assuming user ID 1 exists

  for (const query of testQueries) {
    console.log(`\n----- Testing query: "${query}" -----`)

    try {
      const result = await generateResponseWithMemory(query, userId)

      console.log(`\nFound ${result.memoryCount} relevant memories:`)
      result.memories.forEach((memory, index) => {
        console.log(`${index + 1}. [Score: ${memory.relevance_score}] ${memory.content}`)
      })

      console.log("\nGenerated response:")
      console.log(result.response)
      console.log("\n" + "-".repeat(80))
    } catch (error) {
      console.error(`Error processing query "${query}":`, error)
    }
  }

  console.log("\nTest completed!")
}

// Run the tests
runTests()
