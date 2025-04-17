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
export async function searchMemories(query: string, userId: string, limit = 5) {
  const memory = getMemoryClient()

  try {
    const results = await memory.search({
      query,
      user_id: userId,
      limit,
    })

    return results
  } catch (error) {
    console.error("Error searching memories:", error)
    throw error
  }
}

// Helper function to add a memory
export async function addMemory(messages: any[], userId: string) {
  const memory = getMemoryClient()

  try {
    await memory.add(messages, { user_id: userId })
    return true
  } catch (error) {
    console.error("Error adding memory:", error)
    throw error
  }
}

// Helper function to get user memories
export async function getUserMemories(userId: string, limit = 10) {
  const memory = getMemoryClient()

  try {
    const results = await memory.search({
      query: "*",
      user_id: userId,
      limit,
    })

    return results
  } catch (error) {
    console.error("Error getting user memories:", error)
    throw error
  }
}
