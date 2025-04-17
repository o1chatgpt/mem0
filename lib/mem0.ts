// Mem0 integration library
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient } from "@/lib/db"

export type Memory = {
  id: number
  content: string
  created_at: string
  ai_member_id: number | null
}

export async function addMemory(content: string, userId: number, aiMemberId?: number) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("fm_memories")
    .insert({
      content,
      user_id: userId,
      ai_member_id: aiMemberId || null,
    })
    .select()

  if (error) {
    console.error("Error adding memory:", error)
    throw new Error("Failed to add memory")
  }

  return data[0]
}

export async function getMemories(userId: number, aiMemberId?: number, limit = 10) {
  const supabase = createServerClient()

  let query = supabase
    .from("fm_memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (aiMemberId) {
    query = query.eq("ai_member_id", aiMemberId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching memories:", error)
    throw new Error("Failed to fetch memories")
  }

  return data as Memory[]
}

export async function searchMemories(query: string, userId: number, aiMemberId?: number, limit = 5) {
  // In a real implementation, this would use vector search or semantic search
  // For now, we'll use a simple text search
  const supabase = createServerClient()

  let dbQuery = supabase
    .from("fm_memories")
    .select("*")
    .eq("user_id", userId)
    .ilike("content", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (aiMemberId) {
    dbQuery = dbQuery.eq("ai_member_id", aiMemberId)
  }

  const { data, error } = await dbQuery

  if (error) {
    console.error("Error searching memories:", error)
    throw new Error("Failed to search memories")
  }

  return data as Memory[]
}

export async function generateResponseWithMemory(prompt: string, userId: number, aiMemberId?: number) {
  // Get relevant memories
  const memories = await searchMemories(prompt, userId, aiMemberId)

  // Format memories for context
  const memoriesContext = memories.map((m) => `- ${m.content}`).join("\n")

  // Generate response with context
  const systemPrompt = `You are a helpful AI assistant with memory capabilities. 
Use the following memories to provide a personalized response:

${memoriesContext}

If the memories don't contain relevant information, respond based on your general knowledge.`

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    prompt,
  })

  // Store the interaction as a new memory
  await addMemory(`User asked: ${prompt}. Assistant responded about: ${text.substring(0, 100)}...`, userId, aiMemberId)

  return { text, memories }
}
