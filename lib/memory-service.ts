import { createServerClient } from "@/lib/db"
import { addMemory, searchMemories } from "@/lib/mem0"
import { hasValidOpenAIKey } from "@/lib/api-key-utils"

/**
 * Service for handling memory operations throughout the application
 */
export const memoryService = {
  /**
   * Stores a memory when a file operation occurs
   */
  async recordFileOperation(
    operation: "create" | "update" | "delete" | "view" | "download",
    fileDetails: {
      id: number
      name: string
      path?: string
      size?: number
      mime_type?: string
    },
    userId: number,
    aiMemberId?: number,
  ): Promise<void> {
    try {
      // Create memory content based on operation type
      let content = ""
      switch (operation) {
        case "create":
          content = `Created file: "${fileDetails.name}" (${fileDetails.mime_type || "unknown type"}, ${formatBytes(fileDetails.size || 0)})`
          break
        case "update":
          content = `Updated file: "${fileDetails.name}"`
          break
        case "delete":
          content = `Deleted file: "${fileDetails.name}"`
          break
        case "view":
          content = `Viewed file: "${fileDetails.name}"`
          break
        case "download":
          content = `Downloaded file: "${fileDetails.name}"`
          break
      }

      // Add path information if available
      if (fileDetails.path) {
        content += ` at path: ${fileDetails.path}`
      }

      // Store the memory
      await addMemory(content, userId, aiMemberId, "File Operations")
    } catch (error) {
      console.error(`Error recording file operation memory:`, error)
      // Don't throw - we don't want file operations to fail if memory recording fails
    }
  },

  /**
   * Stores a memory when a folder operation occurs
   */
  async recordFolderOperation(
    operation: "create" | "update" | "delete" | "navigate",
    folderDetails: {
      id: number
      name: string
      path?: string
    },
    userId: number,
    aiMemberId?: number,
  ): Promise<void> {
    try {
      // Create memory content based on operation type
      let content = ""
      switch (operation) {
        case "create":
          content = `Created folder: "${folderDetails.name}"`
          break
        case "update":
          content = `Updated folder: "${folderDetails.name}"`
          break
        case "delete":
          content = `Deleted folder: "${folderDetails.name}"`
          break
        case "navigate":
          content = `Navigated to folder: "${folderDetails.name}"`
          break
      }

      // Add path information if available
      if (folderDetails.path) {
        content += ` at path: ${folderDetails.path}`
      }

      // Store the memory
      await addMemory(content, userId, aiMemberId, "File Operations")
    } catch (error) {
      console.error(`Error recording folder operation memory:`, error)
      // Don't throw - we don't want folder operations to fail if memory recording fails
    }
  },

  /**
   * Records a search operation in memory
   */
  async recordSearchOperation(query: string, resultCount: number, userId: number, aiMemberId?: number): Promise<void> {
    try {
      const content = `Searched for "${query}" and found ${resultCount} results`
      await addMemory(content, userId, aiMemberId, "Search")
    } catch (error) {
      console.error(`Error recording search operation memory:`, error)
    }
  },

  /**
   * Gets file operation memories for a specific file
   */
  async getFileMemories(fileId: number, userId: number, limit = 5): Promise<any[]> {
    try {
      // Check if Supabase environment variables are available
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn("Supabase environment variables are not set. Cannot get file memories.")
        return []
      }

      const supabase = createServerClient()

      // Get file details first
      const { data: file } = await supabase.from("fm_files").select("name").eq("id", fileId).single()

      if (!file) return []

      // Search for memories related to this file
      const memories = await searchMemories(file.name, userId, undefined, limit)
      return memories
    } catch (error) {
      console.error(`Error getting file memories:`, error)
      return []
    }
  },

  /**
   * Checks if memory features are available (API key is valid)
   */
  async isMemoryAvailable(): Promise<boolean> {
    return await hasValidOpenAIKey()
  },

  /**
   * Gets memory usage statistics
   */
  async getMemoryUsageStats(userId: number): Promise<{
    totalMemories: number
    fileOperationMemories: number
    searchMemories: number
    chatMemories: number
    otherMemories: number
  }> {
    try {
      // Check if Supabase environment variables are available
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn("Supabase environment variables are not set. Cannot get memory usage stats.")
        return {
          totalMemories: 0,
          fileOperationMemories: 0,
          searchMemories: 0,
          chatMemories: 0,
          otherMemories: 0,
        }
      }

      const supabase = createServerClient()

      // Get total count
      const { count: totalCount } = await supabase
        .from("fm_memories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      // Get category counts
      const { data: categoryData } = await supabase.from("fm_memories").select("category").eq("user_id", userId)

      // Count by category
      const categoryCounts = {
        "File Operations": 0,
        Search: 0,
        Chat: 0,
        Other: 0,
      }

      categoryData?.forEach((memory) => {
        const category = memory.category || "Other"
        if (category in categoryCounts) {
          categoryCounts[category]++
        } else {
          categoryCounts["Other"]++
        }
      })

      return {
        totalMemories: totalCount || 0,
        fileOperationMemories: categoryCounts["File Operations"],
        searchMemories: categoryCounts["Search"],
        chatMemories: categoryCounts["Chat"],
        otherMemories: categoryCounts["Other"],
      }
    } catch (error) {
      console.error(`Error getting memory usage stats:`, error)
      return {
        totalMemories: 0,
        fileOperationMemories: 0,
        searchMemories: 0,
        chatMemories: 0,
        otherMemories: 0,
      }
    }
  },
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
