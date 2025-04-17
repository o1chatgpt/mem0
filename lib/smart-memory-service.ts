import { memoryStore } from "./memory-store"
import { vectorStore } from "./vector-store"
import type { FileInfo } from "./file-service"

// Define types for file memories
export interface FileMemory {
  fileId: string
  fileName: string
  filePath: string
  fileType: string
  lastAccessed: string
  accessCount: number
  tags: string[]
  notes: string[]
  relatedFiles: string[] // IDs of related files
  analysisResults?: {
    summary?: string
    insights?: string
    entities?: string[]
    keywords?: string[]
    sentiment?: string
    lastAnalyzed?: string
  }
}

export interface FileInteraction {
  fileId: string
  action: "open" | "edit" | "analyze" | "tag" | "download" | "share" | "delete"
  timestamp: string
  details?: string
}

export interface FileContext {
  recentFiles: FileInfo[]
  frequentFiles: FileInfo[]
  relatedFiles: FileInfo[]
  suggestedFiles: FileInfo[]
  currentWorkContext?: string
}

export class SmartMemoryService {
  private userId: string
  private initialized = false
  private memoryPrefix = "file_memory_"
  private contextPrefix = "file_context_"
  private interactionPrefix = "file_interaction_"
  private globalPrefix = "global_"

  constructor(userId = "default-user") {
    this.userId = userId
  }

  /**
   * Initialize the smart memory service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      // Initialize the underlying memory store
      await memoryStore.initialize()

      // Initialize vector store for semantic search
      await vectorStore.initialize()

      this.initialized = true
      return true
    } catch (error) {
      console.error("Failed to initialize SmartMemoryService:", error)
      return false
    }
  }

  /**
   * Get file memory by ID, creating a new one if it doesn't exist
   */
  async getFileMemory(fileId: string, fileInfo?: Partial<FileInfo>): Promise<FileMemory> {
    await this.ensureInitialized()

    try {
      // Try to get existing memory
      const existingMemory = await memoryStore.retrieveMemory<FileMemory>(`${this.memoryPrefix}${fileId}`)

      if (existingMemory) {
        return existingMemory
      }

      // Create new memory if it doesn't exist
      const newMemory: FileMemory = {
        fileId,
        fileName: fileInfo?.name || "Unknown File",
        filePath: fileInfo?.path || "/",
        fileType: fileInfo?.type || "unknown",
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        tags: [],
        notes: [],
        relatedFiles: [],
      }

      await memoryStore.storeMemory(`${this.memoryPrefix}${fileId}`, newMemory)
      return newMemory
    } catch (error) {
      console.error(`Error getting file memory for ${fileId}:`, error)

      // Return a default memory object if retrieval fails
      return {
        fileId,
        fileName: fileInfo?.name || "Unknown File",
        filePath: fileInfo?.path || "/",
        fileType: fileInfo?.type || "unknown",
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        tags: [],
        notes: [],
        relatedFiles: [],
      }
    }
  }

  /**
   * Update file memory
   */
  async updateFileMemory(fileId: string, updates: Partial<FileMemory>): Promise<FileMemory> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)
      const updatedMemory = { ...memory, ...updates }

      await memoryStore.storeMemory(`${this.memoryPrefix}${fileId}`, updatedMemory)
      return updatedMemory
    } catch (error) {
      console.error(`Error updating file memory for ${fileId}:`, error)
      throw error
    }
  }

  /**
   * Record a file interaction
   */
  async recordInteraction(fileId: string, action: FileInteraction["action"], details?: string): Promise<void> {
    await this.ensureInitialized()

    try {
      // Get file info for context
      const memory = await this.getFileMemory(fileId)

      // Create interaction record
      const interaction: FileInteraction = {
        fileId,
        action,
        timestamp: new Date().toISOString(),
        details,
      }

      // Store in vector store for semantic search
      const interactionText = `File: ${memory.fileName} - Action: ${action} ${details ? `- Details: ${details}` : ""}`
      await vectorStore.storeEmbedding(interactionText, {
        interaction,
        userId: this.userId,
      })

      // Update file memory
      await this.updateFileMemory(fileId, {
        lastAccessed: new Date().toISOString(),
        accessCount: memory.accessCount + 1,
      })

      // Add to recent files list
      await this.addToRecentFiles(fileId, memory.fileName)

      // Record in general memory
      await memoryStore.addMemory(`User ${action} file: ${memory.fileName}${details ? ` (${details})` : ""}`)
    } catch (error) {
      console.error(`Error recording interaction for ${fileId}:`, error)
      // Continue without throwing to prevent UI disruption
    }
  }

  /**
   * Add or update a file tag
   */
  async addTag(fileId: string, tag: string): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)

      // Add tag if it doesn't exist
      if (!memory.tags.includes(tag)) {
        memory.tags.push(tag)
        await this.updateFileMemory(fileId, { tags: memory.tags })

        // Record this action
        await this.recordInteraction(fileId, "tag", `Added tag: ${tag}`)
      }

      return memory.tags
    } catch (error) {
      console.error(`Error adding tag to ${fileId}:`, error)
      throw error
    }
  }

  /**
   * Remove a file tag
   */
  async removeTag(fileId: string, tag: string): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)

      // Remove tag if it exists
      const updatedTags = memory.tags.filter((t) => t !== tag)
      await this.updateFileMemory(fileId, { tags: updatedTags })

      // Record this action
      await this.recordInteraction(fileId, "tag", `Removed tag: ${tag}`)

      return updatedTags
    } catch (error) {
      console.error(`Error removing tag from ${fileId}:`, error)
      throw error
    }
  }

  /**
   * Get all tags for a file
   */
  async getTags(fileId: string): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)
      return memory.tags
    } catch (error) {
      console.error(`Error getting tags for ${fileId}:`, error)
      return []
    }
  }

  /**
   * Add a note to a file
   */
  async addNote(fileId: string, note: string): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)

      // Add note
      memory.notes.push(note)
      await this.updateFileMemory(fileId, { notes: memory.notes })

      // Record this action
      await this.recordInteraction(
        fileId,
        "edit",
        `Added note: ${note.substring(0, 50)}${note.length > 50 ? "..." : ""}`,
      )

      return memory.notes
    } catch (error) {
      console.error(`Error adding note to ${fileId}:`, error)
      throw error
    }
  }

  /**
   * Get all notes for a file
   */
  async getNotes(fileId: string): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)
      return memory.notes
    } catch (error) {
      console.error(`Error getting notes for ${fileId}:`, error)
      return []
    }
  }

  /**
   * Store file analysis results
   */
  async storeAnalysisResults(fileId: string, results: NonNullable<FileMemory["analysisResults"]>): Promise<void> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)

      // Update analysis results
      await this.updateFileMemory(fileId, {
        analysisResults: {
          ...memory.analysisResults,
          ...results,
          lastAnalyzed: new Date().toISOString(),
        },
      })

      // Record this action
      await this.recordInteraction(fileId, "analyze", "File analysis completed")

      // Store analysis in vector store for semantic search
      if (results.summary) {
        await vectorStore.storeEmbedding(`File analysis summary for ${memory.fileName}: ${results.summary}`, {
          fileId,
          type: "analysis_summary",
          userId: this.userId,
        })
      }

      if (results.insights) {
        await vectorStore.storeEmbedding(`File analysis insights for ${memory.fileName}: ${results.insights}`, {
          fileId,
          type: "analysis_insights",
          userId: this.userId,
        })
      }
    } catch (error) {
      console.error(`Error storing analysis results for ${fileId}:`, error)
      throw error
    }
  }

  /**
   * Get file analysis results
   */
  async getAnalysisResults(fileId: string): Promise<FileMemory["analysisResults"] | undefined> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)
      return memory.analysisResults
    } catch (error) {
      console.error(`Error getting analysis results for ${fileId}:`, error)
      return undefined
    }
  }

  /**
   * Add a file to the recent files list
   */
  private async addToRecentFiles(fileId: string, fileName: string): Promise<void> {
    try {
      // Get current recent files
      const recentFiles =
        (await memoryStore.retrieveMemory<Array<{ id: string; name: string; timestamp: string }>>(
          `${this.globalPrefix}recent_files`,
        )) || []

      // Remove if already exists
      const filteredFiles = recentFiles.filter((file) => file.id !== fileId)

      // Add to beginning
      filteredFiles.unshift({
        id: fileId,
        name: fileName,
        timestamp: new Date().toISOString(),
      })

      // Keep only the most recent N files
      const updatedRecentFiles = filteredFiles.slice(0, 20)

      // Store updated list
      await memoryStore.storeMemory(`${this.globalPrefix}recent_files`, updatedRecentFiles)
    } catch (error) {
      console.error("Error updating recent files:", error)
      // Continue without throwing
    }
  }

  /**
   * Get recent files
   */
  async getRecentFiles(): Promise<Array<{ id: string; name: string; timestamp: string }>> {
    await this.ensureInitialized()

    try {
      return (
        (await memoryStore.retrieveMemory<Array<{ id: string; name: string; timestamp: string }>>(
          `${this.globalPrefix}recent_files`,
        )) || []
      )
    } catch (error) {
      console.error("Error getting recent files:", error)
      return []
    }
  }

  /**
   * Find related files based on content similarity
   */
  async findRelatedFiles(fileId: string, limit = 5): Promise<string[]> {
    await this.ensureInitialized()

    try {
      const memory = await this.getFileMemory(fileId)

      // If we have stored related files, return them
      if (memory.relatedFiles.length > 0) {
        return memory.relatedFiles
      }

      // Otherwise, try to find related files based on tags
      if (memory.tags.length > 0) {
        const allFileMemories = await this.getAllFileMemories()

        // Find files with matching tags
        const relatedByTags = allFileMemories
          .filter((m) => m.fileId !== fileId && m.tags.some((tag) => memory.tags.includes(tag)))
          .sort((a, b) => {
            // Count matching tags
            const aMatches = a.tags.filter((tag) => memory.tags.includes(tag)).length
            const bMatches = b.tags.filter((tag) => memory.tags.includes(tag)).length
            return bMatches - aMatches
          })
          .slice(0, limit)
          .map((m) => m.fileId)

        // Store these related files
        await this.updateFileMemory(fileId, { relatedFiles: relatedByTags })

        return relatedByTags
      }

      return []
    } catch (error) {
      console.error(`Error finding related files for ${fileId}:`, error)
      return []
    }
  }

  /**
   * Get all file memories
   */
  private async getAllFileMemories(): Promise<FileMemory[]> {
    try {
      // This is a simplified implementation
      // In a real app, you would use a database query

      // Get all keys from memory store that match the file memory prefix
      const allMemories = await memoryStore.retrieveMemory<Record<string, FileMemory>>(`${this.memoryPrefix}all`)

      if (!allMemories) return []

      return Object.values(allMemories)
    } catch (error) {
      console.error("Error getting all file memories:", error)
      return []
    }
  }

  /**
   * Search for files based on a query
   */
  async searchFiles(query: string, limit = 10): Promise<Array<{ fileId: string; score: number }>> {
    await this.ensureInitialized()

    try {
      // Search in vector store
      const results = await vectorStore.searchSimilar(query, limit)

      // Extract file IDs and scores
      return results
        .filter((result) => result.metadata && result.metadata.fileId)
        .map((result) => ({
          fileId: result.metadata.fileId as string,
          score: result.similarity || 0,
        }))
    } catch (error) {
      console.error(`Error searching files with query "${query}":`, error)
      return []
    }
  }

  /**
   * Get file context for the current user session
   */
  async getFileContext(): Promise<FileContext> {
    await this.ensureInitialized()

    try {
      return (
        (await memoryStore.retrieveMemory<FileContext>(`${this.contextPrefix}current`)) || {
          recentFiles: [],
          frequentFiles: [],
          relatedFiles: [],
          suggestedFiles: [],
        }
      )
    } catch (error) {
      console.error("Error getting file context:", error)
      return {
        recentFiles: [],
        frequentFiles: [],
        relatedFiles: [],
        suggestedFiles: [],
      }
    }
  }

  /**
   * Update file context
   */
  async updateFileContext(updates: Partial<FileContext>): Promise<FileContext> {
    await this.ensureInitialized()

    try {
      const context = await this.getFileContext()
      const updatedContext = { ...context, ...updates }

      await memoryStore.storeMemory(`${this.contextPrefix}current`, updatedContext)
      return updatedContext
    } catch (error) {
      console.error("Error updating file context:", error)
      throw error
    }
  }

  /**
   * Clear all file memories
   */
  async clearAllMemories(): Promise<void> {
    await this.ensureInitialized()

    try {
      // In a real implementation, you would use a database query to delete all records
      // For now, we'll just clear the memory store
      await memoryStore.clearMemory()
    } catch (error) {
      console.error("Error clearing all memories:", error)
      throw error
    }
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }
}

// Create a singleton instance
export const smartMemoryService = new SmartMemoryService()
