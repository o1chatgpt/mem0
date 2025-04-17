import { Memory } from "mem0ai"

// Initialize the Mem0 client
let memoryInstance: Memory | null = null

export function getMemoryClient() {
  if (!memoryInstance) {
    memoryInstance = new Memory({
      apiKey: process.env.MEM0_API_KEY,
      apiUrl: process.env.MEM0_API_URL || "https://api.mem0.ai",
    })
  }

  return memoryInstance
}

// Helper function to search memories
export async function searchMemories(query: string, userId: string, limit = 5, tag?: string | null) {
  const memory = getMemoryClient()

  try {
    // Build search options
    const searchOptions: any = {
      query,
      user_id: userId,
      limit,
    }

    // Add tag filter if provided
    if (tag) {
      searchOptions.filter = {
        tags: [tag],
      }
    }

    const results = await memory.search(searchOptions)

    return results
  } catch (error) {
    console.error("Error searching memories:", error)
    throw error
  }
}

// Helper function to add a memory
export async function addMemory(messages: any[], userId: string, tags?: string[]) {
  const memory = getMemoryClient()

  try {
    // Create memory options
    const options: any = { user_id: userId }

    // Add tags if provided
    if (tags && tags.length > 0) {
      options.metadata = {
        tags,
      }
    }

    await memory.add(messages, options)
    return true
  } catch (error) {
    console.error("Error adding memory:", error)
    throw error
  }
}

// Helper function to get user memories
export async function getUserMemories(userId: string, limit = 10, tag?: string | null) {
  const memory = getMemoryClient()

  try {
    // Build search options
    const searchOptions: any = {
      query: "*",
      user_id: userId,
      limit,
    }

    // Add tag filter if provided
    if (tag) {
      searchOptions.filter = {
        tags: [tag],
      }
    }

    const results = await memory.search(searchOptions)

    return results
  } catch (error) {
    console.error("Error getting user memories:", error)
    throw error
  }
}

// Helper function to get all user tags
export async function getUserTags(userId: string) {
  const memory = getMemoryClient()

  try {
    // First try to get all memories to extract tags
    const results = await memory.search({
      query: "*",
      user_id: userId,
      limit: 100,
    })

    // Extract unique tags from all memories
    const tags = new Set<string>()
    if (results && results.results) {
      results.results.forEach((memory: any) => {
        if (memory.metadata && memory.metadata.tags) {
          memory.metadata.tags.forEach((tag: string) => tags.add(tag))
        } else if (memory.tags) {
          // Handle different response formats
          memory.tags.forEach((tag: string) => tags.add(tag))
        }
      })
    }

    return Array.from(tags)
  } catch (error) {
    console.error("Error getting user tags:", error)
    // Return an empty array instead of throwing an error
    return []
  }
}
