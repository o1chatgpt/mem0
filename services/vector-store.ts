import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate Supabase configuration
let supabase: ReturnType<typeof createClient>
try {
  if (!supabaseUrl) {
    console.error("Supabase URL is missing. Please check your environment variables.")
  }

  if (!supabaseKey) {
    console.error("Supabase key is missing. Please check your environment variables.")
  }

  // Only create the client if we have both URL and key
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
  } else {
    // Create a mock client that logs errors instead of throwing them
    supabase = {
      from: () => {
        console.error("Supabase client not initialized. Database operations will fail.")
        return {
          select: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          insert: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          update: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          delete: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          eq: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          order: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          limit: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          or: () => ({ data: null, error: new Error("Supabase client not initialized") }),
        }
      },
      rpc: () => ({ data: null, error: new Error("Supabase client not initialized") }),
    } as any
  }
} catch (error) {
  console.error("Error initializing Supabase client:", error)
  // Create a mock client that logs errors instead of throwing them
  supabase = {
    from: () => {
      console.error("Supabase client initialization failed. Database operations will fail.")
      return {
        select: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        insert: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        update: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        delete: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        eq: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        order: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        limit: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
        or: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
      }
    },
    rpc: () => ({ data: null, error: new Error("Supabase client initialization failed") }),
  } as any
}

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

// Function to check if Supabase is properly initialized
export function isSupabaseInitialized(): boolean {
  return !!(supabaseUrl && supabaseKey)
}

// Function to create embeddings using OpenAI
export async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing")
      return null
    }

    // Validate API key format to avoid unnecessary API calls
    if (!process.env.OPENAI_API_KEY.startsWith("sk-") || process.env.OPENAI_API_KEY.includes("*")) {
      console.error("OpenAI API key appears to be invalid or placeholder")
      return null
    }

    // Try to use the local embedding model first (if available)
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("OpenAI API error:", response.status, errorData)

        // If it's an API key error, log it clearly
        if (response.status === 401) {
          console.error("Invalid OpenAI API key. Please check your API key configuration.")
        }

        return null
      }

      const data = await response.json()

      // Validate the response structure
      if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.error("Unexpected API response structure:", data)
        return null
      }

      // Check if embedding exists in the response
      if (!data.data[0].embedding) {
        console.error("No embedding found in API response:", data.data[0])
        return null
      }

      return data.data[0].embedding
    } catch (error) {
      console.error("Error creating embedding:", error)
      return null
    }
  } catch (error) {
    console.error("Error in createEmbedding function:", error)
    return null
  }
}

// Function to add a memory with embedding
export async function addMemoryWithEmbedding(memory: MemoryEntry): Promise<boolean> {
  try {
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot add memory: Supabase is not initialized")
      return false
    }

    // Create embedding for the memory
    const embedding = await createEmbedding(memory.memory)

    // If embedding creation fails, still add the memory without embedding
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ...memory,
        embedding: embedding || null,
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
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot search memories: Supabase is not initialized")
      return []
    }

    // Create embedding for the query
    const embedding = await createEmbedding(query)

    // If embedding creation fails, fall back to keyword search
    if (!embedding) {
      console.log("Falling back to regular memory fetch due to embedding creation failure")
      return fallbackToDatabase(aiFamily, query, limit)
    }

    // Search for similar memories using vector similarity
    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      ai_family_id: aiFamily,
    })

    if (error) {
      console.error("Error in vector similarity search:", error)
      return fallbackToDatabase(aiFamily, query, limit)
    }

    return data || []
  } catch (error) {
    console.error("Error searching memories by similarity:", error)
    return fallbackToDatabase(aiFamily, query, limit)
  }
}

// Fallback function for when vector search fails
async function fallbackToDatabase(aiFamily: string, query: string, limit = 5): Promise<MemoryEntry[]> {
  try {
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot perform fallback search: Supabase is not initialized")
      return []
    }

    // Simple keyword search using ILIKE
    const keywords = query
      .split(" ")
      .filter((word) => word.length > 3)
      .map((word) => `%${word}%`)

    if (keywords.length === 0) {
      // If no good keywords, just get recent memories
      const { data, error } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    }

    // Try to find memories containing any of the keywords
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .or(keywords.map((keyword) => `memory.ilike.${keyword}`).join(","))
      .limit(limit)

    if (error) throw error

    // If no results with keywords, get recent memories
    if (!data || data.length === 0) {
      const { data: recentData, error: recentError } = await supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamily)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (recentError) throw recentError
      return recentData || []
    }

    return data
  } catch (error) {
    console.error("Error in fallback database search:", error)
    return []
  }
}

// Function to get all memories for an AI family member
export async function getMemories(aiFamily: string, limit = 10): Promise<MemoryEntry[]> {
  try {
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot get memories: Supabase is not initialized")
      return []
    }

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
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot delete memory: Supabase is not initialized")
      return false
    }

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
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot update memory: Supabase is not initialized")
      return false
    }

    // Create embedding for the updated memory
    const embedding = await createEmbedding(memory)

    // Update memory with new embedding if available
    const { error } = await supabase
      .from("ai_family_member_memories")
      .update({
        memory,
        embedding: embedding || null,
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
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      console.error("Cannot get vector store stats: Supabase is not initialized")
      return {
        totalMemories: 0,
        lastUpdated: null,
        storageSize: 0,
      }
    }

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
