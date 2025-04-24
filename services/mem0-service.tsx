import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export interface Memory {
  id: string
  ai_family_member_id: string
  user_id: string
  memory: string
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string | null
}

export interface FileMemory {
  id: string
  file_id: string
  user_id: string
  content: string
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string | null
}

/**
 * Add a memory for an AI family member
 * @param userId User ID
 * @param aiFamily AI family member ID
 * @param memory Memory content
 * @param metadata Optional metadata
 * @returns Success status
 */
export async function addMemory(
  userId: string,
  aiFamily: string,
  memory: string,
  metadata?: Record<string, any>,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_family_member_memories").insert([
      {
        ai_family_member_id: aiFamily,
        user_id: userId,
        memory,
        metadata: metadata || null,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding memory:", error)
    return false
  }
}

/**
 * Add a memory for a file
 * @param userId User ID
 * @param fileId File ID
 * @param content Memory content
 * @param metadata Optional metadata
 * @returns Success status
 */
export async function addFileMemory(
  userId: string,
  fileId: string,
  content: string,
  metadata?: Record<string, any>,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("file_memories").insert([
      {
        user_id: userId,
        file_id: fileId,
        content,
        metadata: metadata || null,
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error adding file memory:", error)
    return false
  }
}

/**
 * Get memories for an AI family member
 * @param userId User ID
 * @param aiFamily AI family member ID
 * @param limit Maximum number of memories to retrieve
 * @returns Array of memories
 */
export async function getMemories(userId: string, aiFamily: string, limit = 10): Promise<Memory[]> {
  try {
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

/**
 * Get memories for a file
 * @param userId User ID
 * @param fileId File ID
 * @param limit Maximum number of memories to retrieve
 * @returns Array of file memories
 */
export async function getFileMemories(userId: string, fileId: string, limit = 10): Promise<FileMemory[]> {
  try {
    const { data, error } = await supabase
      .from("file_memories")
      .select("*")
      .eq("file_id", fileId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching file memories:", error)
    return []
  }
}

/**
 * Search memories for an AI family member
 * @param userId User ID
 * @param aiFamily AI family member ID
 * @param query Search query
 * @param limit Maximum number of memories to retrieve
 * @returns Array of memories sorted by relevance
 */
export async function searchMemories(userId: string, aiFamily: string, query: string, limit = 5): Promise<Memory[]> {
  try {
    // This is a simple search implementation
    // For production, consider using Supabase's full-text search capabilities
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

/**
 * Delete a memory
 * @param memoryId Memory ID
 * @returns Success status
 */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  try {
    // Try to delete from ai_family_member_memories first
    const { error } = await supabase.from("ai_family_member_memories").delete().eq("id", memoryId)

    // If there's an error (likely because the memory is in file_memories), try that table
    if (error) {
      const { error: fileMemoryError } = await supabase.from("file_memories").delete().eq("id", memoryId)
      if (fileMemoryError) throw fileMemoryError
    }

    return true
  } catch (error) {
    console.error("Error deleting memory:", error)
    return false
  }
}

/**
 * Update a memory
 * @param memoryId Memory ID
 * @param memory New memory content
 * @param metadata Optional metadata
 * @returns Success status
 */
export async function updateMemory(memoryId: string, memory: string, metadata?: Record<string, any>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("ai_family_member_memories")
      .update({
        memory,
        metadata: metadata || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memoryId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating memory:", error)
    return false
  }
}

/**
 * Get memory statistics for an AI family member
 * @param userId User ID
 * @param aiFamily AI family member ID
 * @returns Memory statistics
 */
export async function getMemoryStats(
  userId: string,
  aiFamily: string,
): Promise<{
  totalMemories: number
  lastUpdated: string | null
}> {
  try {
    // Get total count of memories
    const { count, error: countError } = await supabase
      .from("ai_family_member_memories")
      .select("*", { count: "exact", head: true })
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)

    if (countError) throw countError

    // Get last updated memory
    const { data: lastMemory, error: lastError } = await supabase
      .from("ai_family_member_memories")
      .select("updated_at")
      .eq("ai_family_member_id", aiFamily)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (lastError) throw lastError

    return {
      totalMemories: count || 0,
      lastUpdated: lastMemory && lastMemory.length > 0 ? lastMemory[0].updated_at : null,
    }
  } catch (error) {
    console.error("Error getting memory stats:", error)
    return {
      totalMemories: 0,
      lastUpdated: null,
    }
  }
}

/**
 * Process conversation for memory extraction
 * @param userId User ID
 * @param aiFamily AI family member ID
 * @param messages Array of chat messages
 * @returns Success status
 */
export async function processConversation(
  userId: string,
  aiFamily: string,
  messages: Array<{ role: string; content: string }>,
): Promise<boolean> {
  try {
    // Implement your conversation processing logic here
    // This is a placeholder implementation
    const conversationText = messages.map((message) => `${message.role}: ${message.content}`).join("\n")
    const memory = `Conversation summary: ${conversationText}`

    // Add the conversation summary as a memory
    const success = await addMemory(userId, aiFamily, memory)
    return success
  } catch (error) {
    console.error("Error processing conversation:", error)
    return false
  }
}

// Initialize Mem0 client
let mem0Client: any = null

/**
 * Initialize the Mem0 client
 */
export async function initializeMem0(): Promise<any | null> {
  if (mem0Client) return mem0Client

  try {
    // Check if Mem0 API key is available
    const apiKey = process.env.MEM0_API_KEY
    const apiUrl = process.env.MEM0_API_URL

    if (!apiKey || !apiUrl) {
      console.warn("Mem0 API key or URL not configured, using fallback storage")
      return null
    }

    // In a real implementation, we would initialize the Mem0 client here
    // For now, we'll just log that we're using Mem0
    console.log("Initializing Mem0 client with API key and URL")

    // Placeholder for actual Mem0 client initialization
    mem0Client = {
      initialized: true,
      apiKey,
      apiUrl,
    }

    return mem0Client
  } catch (error) {
    console.error("Error initializing Mem0:", error)
    return null
  }
}
