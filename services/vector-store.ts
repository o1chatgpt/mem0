import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Interface for memory entries
export interface MemoryEntry {
  id?: string
  ai_family_member_id: string
  user_id: string
  memory: string
  embedding?: number[]
  relevance?: number
  created_at?: string
  updated_at?: string
}

// Function to create embeddings using OpenAI
export async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-ada-002",
      }),
    })

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error("Error creating embedding:", error)
    return null
  }
}

// Function to add a memory with embedding
export async function addMemoryWithEmbedding(memory: MemoryEntry): Promise<boolean> {
  try {
    // Create embedding for the memory
    const embedding = await createEmbedding(memory.memory)

    if (!embedding) {
      throw new Error("Failed to create embedding")
    }

    // Add memory with embedding to the database
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ...memory,
        embedding,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding memory with embedding:", error)
    return false
  }
}

// Function to search memories by similarity
export async function searchMemoriesBySimilarity(aiFamily: string, query: string, limit = 5): Promise<MemoryEntry[]> {
  try {
    // Create embedding for the query
    const embedding = await createEmbedding(query)

    if (!embedding) {
      throw new Error("Failed to create embedding")
    }

    // Search for similar memories using vector similarity
    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      ai_family_id: aiFamily,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error searching memories by similarity:", error)
    return []
  }
}

// Function to get all memories for an AI family member
export async function getMemories(aiFamily: string, limit = 10): Promise<MemoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching memories:", error)
    return []
  }
}

// Function to delete a memory
export async function deleteMemory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_family_member_memories").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting memory:", error)
    return false
  }
}

// Function to update a memory
export async function updateMemory(id: string, memory: string): Promise<boolean> {
  try {
    // Create embedding for the updated memory
    const embedding = await createEmbedding(memory)

    if (!embedding) {
      throw new Error("Failed to create embedding")
    }

    // Update memory with new embedding
    const { error } = await supabase
      .from("ai_family_member_memories")
      .update({
        memory,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating memory:", error)
    return false
  }
}

// Function to get vector store statistics
export async function getVectorStoreStats(aiFamily: string): Promise<{
  totalMemories: number
  lastUpdated: string | null
  storageSize: number
}> {
  try {
    // Get total count of memories
    const { count, error: countError } = await supabase
      .from("ai_family_member_memories")
      .select("*", { count: "exact", head: true })
      .eq("ai_family_member_id", aiFamily)

    if (countError) throw countError

    // Get last updated memory
    const { data: lastMemory, error: lastError } = await supabase
      .from("ai_family_member_memories")
      .select("updated_at")
      .eq("ai_family_member_id", aiFamily)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (lastError) throw lastError

    // Estimate storage size (rough approximation)
    const storageSize = count ? (count * 1536 * 4) / 1024 / 1024 : 0 // in MB

    return {
      totalMemories: count || 0,
      lastUpdated: lastMemory && lastMemory.length > 0 ? lastMemory[0].updated_at : null,
      storageSize,
    }
  } catch (error) {
    console.error("Error getting vector store stats:", error)
    return {
      totalMemories: 0,
      lastUpdated: null,
      storageSize: 0,
    }
  }
}
