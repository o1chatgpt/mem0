import { createClient } from "@supabase/supabase-js"
import { addFileMemory, getFileMemories, initializeMem0 } from "@/services/mem0-service.tsx"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Store a memory using Mem0 or fallback to database
 */
export async function storeMemory(
  userId: string,
  fileId: string,
  content: string,
  metadata: any = {},
): Promise<boolean> {
  try {
    // Try to initialize Mem0
    const mem0 = await initializeMem0()

    if (mem0) {
      // If Mem0 is available, use it to store the memory
      console.log(`Storing memory in Mem0 for user ${userId} and file ${fileId}`)

      // In a real implementation, we would use the Mem0 SDK here
      // For example: await mem0.add(content, { userId, fileId, ...metadata });

      // For now, we'll just log and store in our database as fallback
      console.log("Memory content:", content)
      console.log("Memory metadata:", { userId, fileId, ...metadata })
    }

    // Always store in our database as fallback or primary storage
    return await addFileMemory(userId, fileId, content, metadata)
  } catch (error) {
    console.error("Error storing memory:", error)
    return false
  }
}

/**
 * Retrieve memories using Mem0 or fallback to database
 */
export async function getMemories(userId: string, fileId: string, limit = 10): Promise<any[]> {
  try {
    // Try to initialize Mem0
    const mem0 = await initializeMem0()

    if (mem0) {
      // If Mem0 is available, use it to retrieve memories
      console.log(`Retrieving memories from Mem0 for user ${userId} and file ${fileId}`)

      // In a real implementation, we would use the Mem0 SDK here
      // For example: const memories = await mem0.search({ userId, fileId }, limit);

      // For now, we'll just retrieve from our database
    }

    // Retrieve from our database
    return await getFileMemories(userId, fileId, limit)
  } catch (error) {
    console.error("Error retrieving memories:", error)
    return []
  }
}

/**
 * Search memories using Mem0 or fallback to database
 */
export async function searchMemories(userId: string, query: string, limit = 10): Promise<any[]> {
  try {
    // Try to initialize Mem0
    const mem0 = await initializeMem0()

    if (mem0) {
      // If Mem0 is available, use it to search memories
      console.log(`Searching memories in Mem0 for user ${userId} with query: ${query}`)

      // In a real implementation, we would use the Mem0 SDK here
      // For example: const memories = await mem0.search(query, { userId }, limit);

      // For now, we'll just search in our database
    }

    // Search in our database
    const { data, error } = await supabase
      .from("file_memories")
      .select("*")
      .eq("user_id", userId)
      .ilike("content", `%${query}%`)
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
 * Process file content to extract memories
 */
export async function processFileContent(userId: string, fileId: string, content: string): Promise<boolean> {
  try {
    // Store the raw content as a memory
    await storeMemory(userId, fileId, `File content: ${content.substring(0, 500)}...`, { type: "raw_content" })

    // In a real implementation, we would use Mem0 or another service to extract key information
    // For now, we'll just store some basic metadata
    const wordCount = content.split(/\s+/).length
    const metadata = {
      type: "file_stats",
      wordCount,
      charCount: content.length,
      fileId,
    }

    await storeMemory(userId, fileId, `File statistics: ${wordCount} words, ${content.length} characters`, metadata)

    return true
  } catch (error) {
    console.error("Error processing file content:", error)
    return false
  }
}

/**
 * Create a memory from file activity
 */
export async function recordFileActivity(
  userId: string,
  fileId: string,
  action: string,
  details: any = {},
): Promise<boolean> {
  try {
    const content = `User performed action "${action}" on file ${fileId}`
    const metadata = {
      type: "file_activity",
      action,
      ...details,
    }

    return await storeMemory(userId, fileId, content, metadata)
  } catch (error) {
    console.error("Error recording file activity:", error)
    return false
  }
}
