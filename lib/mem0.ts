import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Mem0 if available
let mem0Client: any = null

// Try to initialize Mem0 client if the package is available
try {
  if (process.env.MEM0_API_KEY && process.env.MEM0_API_URL) {
    // Dynamic import to avoid issues if the package is not installed
    import("mem0ai")
      .then((mem0) => {
        if (mem0.default) {
          mem0Client = new mem0.default({
            apiKey: process.env.MEM0_API_KEY,
            apiUrl: process.env.MEM0_API_URL,
          })
          console.log("Mem0 client initialized successfully")
        } else {
          console.warn("mem0ai package does not have a default export")
        }
      })
      .catch((err) => {
        console.warn("Failed to initialize Mem0 client:", err)
      })
  }
} catch (error) {
  console.warn("Error initializing Mem0:", error)
}

export interface Memory {
  id: string
  memory: string
  created_at: string
  user_id: string
  ai_family_member_id: string
  relevance?: number
}

// Function to add a memory using Mem0
export async function addMemory(aiFamily: string, memory: string, userId = "default_user"): Promise<boolean> {
  try {
    // First try to use Mem0 API if configured and client is initialized
    if (mem0Client) {
      try {
        // Create a memory using Mem0
        await mem0Client.add(
          [
            { role: "system", content: `Memory for AI assistant ${aiFamily}` },
            { role: "user", content: memory },
          ],
          userId,
        )

        console.log(`Memory added with Mem0 for user ${userId} and AI ${aiFamily}: ${memory}`)
        return true
      } catch (mem0Error) {
        console.warn("Error using Mem0 client, falling back to database:", mem0Error)
      }
    }

    // Fall back to storing in our database
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamily,
        user_id: userId,
        memory,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding memory:", error)
    return false
  }
}

// Function to get memories
export async function getMemories(aiFamily: string, userId = "default_user", limit = 10): Promise<Memory[]> {
  try {
    // First try to use Mem0 API if client is initialized
    if (mem0Client) {
      try {
        // Get memories from Mem0
        const memories = await mem0Client.get(userId, limit)

        // Format memories to match our interface
        return memories.map((mem: any, index: number) => ({
          id: `mem0-${index}`,
          memory: mem.memory || mem.content,
          created_at: new Date(mem.created_at || Date.now()).toISOString(),
          user_id: userId,
          ai_family_member_id: aiFamily,
        }))
      } catch (mem0Error) {
        console.warn("Error using Mem0 client for retrieval, falling back to database:", mem0Error)
      }
    }

    // Fall back to retrieving from our database
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching memories:", error)
    return []
  }
}

// Function to search memories
export async function searchMemories(
  aiFamily: string,
  query: string,
  userId = "default_user",
  limit = 10,
): Promise<Memory[]> {
  try {
    // First try to use Mem0 API if client is initialized
    if (mem0Client) {
      try {
        // Search memories using Mem0
        const searchResults = await mem0Client.search({
          query,
          user_id: userId,
          limit,
        })

        // Format search results to match our interface
        return searchResults.results.map((result: any, index: number) => ({
          id: `mem0-search-${index}`,
          memory: result.memory || result.content,
          created_at: new Date(result.created_at || Date.now()).toISOString(),
          user_id: userId,
          ai_family_member_id: aiFamily,
          relevance: result.relevance || result.score,
        }))
      } catch (mem0Error) {
        console.warn("Error using Mem0 client for search, falling back to database:", mem0Error)
      }
    }

    // Fall back to searching in our database
    const { data, error } = await supabase
      .from("ai_family_member_memories")
      .select("*")
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)
      .ilike("memory", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error searching memories:", error)
    return []
  }
}
