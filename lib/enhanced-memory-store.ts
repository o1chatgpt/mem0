import { Mem0Client } from "./mem0-client"
import { MemoryStoreFallback } from "./memory-store-fallback"

export interface FileAccessPattern {
  fileId: string
  accessCount: number
  lastAccessed: string
  timeOfDayPattern: Record<string, number> // hour -> count
  dayOfWeekPattern: Record<string, number> // day -> count
}

export interface ActivityRecord {
  timestamp: string
  action: string
  fileId?: string
  fileName?: string
  filePath?: string
  metadata?: Record<string, any>
}

export interface SuggestionContext {
  recentActivity?: ActivityRecord[]
  accessPatterns?: Record<string, FileAccessPattern>
  currentContext?: {
    hour?: number
    day?: number
    date?: string
    tags?: string[]
    currentFileId?: string
    currentFolderId?: string
  }
  limit?: number
}

export class EnhancedMemoryStore {
  private mem0Client: Mem0Client
  private fallback: MemoryStoreFallback
  private isConnected = false
  private userId: string | null = null

  constructor() {
    this.mem0Client = new Mem0Client()
    this.fallback = new MemoryStoreFallback()
  }

  async initialize(userId: string): Promise<boolean> {
    this.userId = userId
    try {
      const status = await this.mem0Client.checkStatus()
      this.isConnected = status.connected
      return this.isConnected
    } catch (error) {
      console.error("Failed to initialize memory store:", error)
      this.isConnected = false
      return false
    }
  }

  async remember(key: string, value: any): Promise<void> {
    try {
      if (this.isConnected) {
        await this.mem0Client.storeMemory({
          userId: this.userId,
          key,
          value,
          timestamp: new Date().toISOString(),
        })
      } else {
        this.fallback.remember(key, value)
      }
    } catch (error) {
      console.error("Error storing memory:", error)
      this.fallback.remember(key, value)
    }
  }

  async recall(key: string): Promise<any> {
    try {
      if (this.isConnected) {
        const memory = await this.mem0Client.getMemory(this.userId!, key)
        return memory?.value
      } else {
        return this.fallback.recall(key)
      }
    } catch (error) {
      console.error("Error recalling memory:", error)
      return this.fallback.recall(key)
    }
  }

  async forget(key: string): Promise<void> {
    try {
      if (this.isConnected) {
        await this.mem0Client.deleteMemory(this.userId!, key)
      } else {
        this.fallback.forget(key)
      }
    } catch (error) {
      console.error("Error forgetting memory:", error)
    }
  }

  async rememberFileAccess(fileId: string, fileName: string, filePath: string): Promise<void> {
    const accessKey = `file_access:${fileId}`
    const accessRecord = {
      timestamp: new Date().toISOString(),
      fileId,
      fileName,
      filePath,
    }

    // Store the individual access record
    await this.remember(`file_access_record:${Date.now()}`, accessRecord)

    // Update access patterns
    const existingPattern = (await this.recall(accessKey)) || {
      fileId,
      accessCount: 0,
      firstAccessed: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      timeOfDayPattern: {},
      dayOfWeekPattern: {},
    }

    const hour = new Date().getHours().toString()
    const day = new Date().getDay().toString()

    existingPattern.accessCount += 1
    existingPattern.lastAccessed = new Date().toISOString()
    existingPattern.timeOfDayPattern[hour] = (existingPattern.timeOfDayPattern[hour] || 0) + 1
    existingPattern.dayOfWeekPattern[day] = (existingPattern.dayOfWeekPattern[day] || 0) + 1

    await this.remember(accessKey, existingPattern)
  }

  async recordFileAccess(fileId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    const record: ActivityRecord = {
      timestamp: new Date().toISOString(),
      action,
      fileId,
      metadata,
    }

    await this.remember(`activity:${Date.now()}`, record)
  }

  async getRecentActivity(limit = 20): Promise<ActivityRecord[]> {
    try {
      if (this.isConnected) {
        const activities = await this.mem0Client.queryMemories(this.userId!, {
          keyPrefix: "activity:",
          limit,
          sortBy: "timestamp",
          sortDirection: "desc",
        })

        return activities.map((a) => a.value as ActivityRecord)
      } else {
        return this.fallback.getRecentActivities(limit)
      }
    } catch (error) {
      console.error("Error getting recent activity:", error)
      return this.fallback.getRecentActivities(limit)
    }
  }

  async getFileAccessPatterns(): Promise<Record<string, FileAccessPattern>> {
    try {
      if (this.isConnected) {
        const patterns = await this.mem0Client.queryMemories(this.userId!, {
          keyPrefix: "file_access:",
        })

        const result: Record<string, FileAccessPattern> = {}
        for (const pattern of patterns) {
          const fileId = pattern.key.split(":")[1]
          result[fileId] = pattern.value as FileAccessPattern
        }
        return result
      } else {
        return this.fallback.getFileAccessPatterns()
      }
    } catch (error) {
      console.error("Error getting file access patterns:", error)
      return this.fallback.getFileAccessPatterns()
    }
  }

  async getSuggestedFiles(context: SuggestionContext): Promise<any[]> {
    try {
      if (this.isConnected) {
        // Use mem0's advanced suggestion capabilities
        const suggestions = await this.mem0Client.getSuggestions(this.userId!, {
          type: "file_suggestions",
          context,
        })
        return suggestions
      } else {
        // Fallback to basic suggestions
        return this.fallback.getSuggestedFiles(context)
      }
    } catch (error) {
      console.error("Error getting suggested files:", error)
      return this.fallback.getSuggestedFiles(context)
    }
  }

  async rememberTag(fileId: string, tag: string): Promise<void> {
    const tagsKey = `file_tags:${fileId}`
    const existingTags = (await this.recall(tagsKey)) || []

    if (!existingTags.includes(tag)) {
      existingTags.push(tag)
      await this.remember(tagsKey, existingTags)
    }
  }

  async getFileTags(fileId: string): Promise<string[]> {
    const tagsKey = `file_tags:${fileId}`
    return (await this.recall(tagsKey)) || []
  }

  async removeTag(fileId: string, tag: string): Promise<void> {
    const tagsKey = `file_tags:${fileId}`
    const existingTags = (await this.recall(tagsKey)) || []

    const updatedTags = existingTags.filter((t: string) => t !== tag)
    await this.remember(tagsKey, updatedTags)
  }

  async toggleFavorite(fileId: string): Promise<boolean> {
    const favoritesKey = `favorites:${this.userId}`
    const favorites = (await this.recall(favoritesKey)) || []

    const isFavorite = favorites.includes(fileId)

    if (isFavorite) {
      const updatedFavorites = favorites.filter((id: string) => id !== fileId)
      await this.remember(favoritesKey, updatedFavorites)
      return false
    } else {
      favorites.push(fileId)
      await this.remember(favoritesKey, favorites)
      return true
    }
  }

  async isFavorite(fileId: string): Promise<boolean> {
    const favoritesKey = `favorites:${this.userId}`
    const favorites = (await this.recall(favoritesKey)) || []
    return favorites.includes(fileId)
  }

  async getFavorites(): Promise<string[]> {
    const favoritesKey = `favorites:${this.userId}`
    return (await this.recall(favoritesKey)) || []
  }

  async rememberSearchQuery(query: string, results: number): Promise<void> {
    const searchRecord = {
      timestamp: new Date().toISOString(),
      query,
      resultsCount: results,
    }

    await this.remember(`search:${Date.now()}`, searchRecord)
  }

  async getRecentSearches(limit = 5): Promise<string[]> {
    try {
      if (this.isConnected) {
        const searches = await this.mem0Client.queryMemories(this.userId!, {
          keyPrefix: "search:",
          limit,
          sortBy: "timestamp",
          sortDirection: "desc",
        })

        return searches.map((s) => s.value.query)
      } else {
        return this.fallback.getRecentSearches(limit)
      }
    } catch (error) {
      console.error("Error getting recent searches:", error)
      return this.fallback.getRecentSearches(limit)
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    return this.isConnected
  }

  async getMemoryStats(): Promise<any> {
    try {
      if (this.isConnected) {
        return await this.mem0Client.getStats(this.userId!)
      } else {
        return this.fallback.getMemoryStats()
      }
    } catch (error) {
      console.error("Error getting memory stats:", error)
      return this.fallback.getMemoryStats()
    }
  }
}

export const enhancedMemoryStore = new EnhancedMemoryStore()
