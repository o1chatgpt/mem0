import { createClient } from "@supabase/supabase-js"
import { createEmbedding } from "./vector-store"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Interface for memory entries
export interface Mem0Memory {
  id?: string
  user_id: string
  ai_family_member_id: string
  memory: string
  embedding?: number[]
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Function to store a memory with Mem0
export async function storeMemoryWithMem0(memory: Mem0Memory): Promise<boolean> {
  try {
    // Check if Mem0 API key is available
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured, falling back to local storage")

      // Create embedding for the memory
      const embedding = await createEmbedding(memory.memory)

      if (!embedding) {
        throw new Error("Failed to create embedding")
      }

      // Store in local database
      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ...memory,
          embedding,
        },
      ])

      if (error) throw error
      return true
    }

    // If Mem0 API is configured, use it
    try {
      // This would be the actual Mem0 API integration
      console.log(`Mem0 integration: Storing memory for user ${memory.user_id} and AI ${memory.ai_family_member_id}`)

      // For now, we'll still store in our database
      const embedding = await createEmbedding(memory.memory)

      if (!embedding) {
        throw new Error("Failed to create embedding")
      }

      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ...memory,
          embedding,
        },
      ])

      if (error) throw error
      return true
    } catch (mem0Error) {
      console.error("Error with Mem0 API, falling back to local storage:", mem0Error)

      // Fall back to local storage
      const embedding = await createEmbedding(memory.memory)

      if (!embedding) {
        throw new Error("Failed to create embedding")
      }

      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ...memory,
          embedding,
        },
      ])

      if (error) throw error
      return true
    }
  } catch (error) {
    console.error("Error storing memory:", error)
    return false
  }
}

// Function to retrieve memories from Mem0
export async function getMemoriesFromMem0(
  userId: string,
  aiFamily: string,
  query?: string,
  limit = 10,
): Promise<Mem0Memory[]> {
  try {
    // Check if Mem0 API key is available
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured, falling back to local storage")

      if (query) {
        // If query is provided, use vector search
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
      } else {
        // Otherwise, just get recent memories
        const { data, error } = await supabase
          .from("ai_family_member_memories")
          .select("*")
          .eq("ai_family_member_id", aiFamily)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      }
    }

    // If Mem0 API is configured, use it
    try {
      // This would be the actual Mem0 API integration
      console.log(`Mem0 integration: Retrieving memories for user ${userId} and AI ${aiFamily}`)

      // For now, we'll still retrieve from our database
      if (query) {
        // If query is provided, use vector search
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
      } else {
        // Otherwise, just get recent memories
        const { data, error } = await supabase
          .from("ai_family_member_memories")
          .select("*")
          .eq("ai_family_member_id", aiFamily)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      }
    } catch (mem0Error) {
      console.error("Error with Mem0 API, falling back to local storage:", mem0Error)

      // Fall back to local storage
      if (query) {
        // If query is provided, use vector search
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
      } else {
        // Otherwise, just get recent memories
        const { data, error } = await supabase
          .from("ai_family_member_memories")
          .select("*")
          .eq("ai_family_member_id", aiFamily)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      }
    }
  } catch (error) {
    console.error("Error retrieving memories:", error)
    return []
  }
}
