import { createClient } from "@supabase/supabase-js"
import { checkMem0ApiConnection } from "./mem0-integration"

// Define memory types
export interface Memory {
  id: string
  memory: string
  created_at: string
  updated_at?: string
  type?: string
  ai_family_member_id?: string
  user_id?: string
  sync_status?: SyncStatus
  local_id?: string
}

export type SyncStatus = "synced" | "local_only" | "remote_only" | "conflict" | "pending" | "failed"

export interface SyncStats {
  total: number
  synced: number
  localOnly: number
  remoteOnly: number
  conflicts: number
  pending: number
  failed: number
  lastSyncedAt: string | null
  inProgress: boolean
}

export interface SyncResult {
  success: boolean
  stats: SyncStats
  errors: string[]
}

// Initialize Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Define a mapping of string identifiers to valid UUIDs for database compatibility
const AI_FAMILY_UUID_MAP: Record<string, string> = {
  file_manager: "00000000-0000-0000-0000-000000000001",
  lyra: "00000000-0000-0000-0000-000000000002",
  sophia: "00000000-0000-0000-0000-000000000003",
  kara: "00000000-0000-0000-0000-000000000004",
  stan: "00000000-0000-0000-0000-000000000005",
  dan: "00000000-0000-0000-0000-000000000006",
  mem0: "00000000-0000-0000-0000-000000000007",
}

const USER_UUID_MAP: Record<string, string> = {
  default_user: "00000000-0000-0000-0000-000000000010",
}

// Helper functions to get UUIDs
function getAiFamilyUuid(aiFamily: string): string {
  return AI_FAMILY_UUID_MAP[aiFamily] || "00000000-0000-0000-0000-000000000000"
}

function getUserUuid(userId: string): string {
  return USER_UUID_MAP[userId] || "00000000-0000-0000-0000-000000000000"
}

// Initialize empty sync stats
const emptySyncStats: SyncStats = {
  total: 0,
  synced: 0,
  localOnly: 0,
  remoteOnly: 0,
  conflicts: 0,
  pending: 0,
  failed: 0,
  lastSyncedAt: null,
  inProgress: false,
}

// Memory Synchronization Service
export class Mem0SyncService {
  private static instance: Mem0SyncService
  private supabase: ReturnType<typeof createClient> | null = null
  private syncInProgress = false
  private syncStats: SyncStats = { ...emptySyncStats }
  private syncListeners: ((stats: SyncStats) => void)[] = []
  private autoSyncInterval: NodeJS.Timeout | null = null
  private apiKey = ""
  private apiUrl = ""

  private constructor() {
    this.initializeSupabase()
    this.loadApiCredentials()
  }

  public static getInstance(): Mem0SyncService {
    if (!Mem0SyncService.instance) {
      Mem0SyncService.instance = new Mem0SyncService()
    }
    return Mem0SyncService.instance
  }

  private initializeSupabase() {
    try {
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log("Mem0SyncService: Supabase client initialized successfully")
      } else {
        console.error("Mem0SyncService: Supabase configuration is missing")
      }
    } catch (error) {
      console.error("Mem0SyncService: Failed to initialize Supabase client:", error)
    }
  }

  private loadApiCredentials() {
    try {
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("mem0Settings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          this.apiKey = settings.apiKey || ""
          this.apiUrl = settings.apiUrl || ""
        }
      }
    } catch (error) {
      console.error("Mem0SyncService: Error loading API credentials:", error)
    }
  }

  public async checkApiConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || !this.apiUrl) {
        return false
      }

      const status = await checkMem0ApiConnection(this.apiKey, this.apiUrl)
      return status === "connected"
    } catch (error) {
      console.error("Mem0SyncService: Error checking API connection:", error)
      return false
    }
  }

  public getSyncStats(): SyncStats {
    return { ...this.syncStats }
  }

  public addSyncListener(listener: (stats: SyncStats) => void): () => void {
    this.syncListeners.push(listener)
    // Return a function to remove the listener
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener)
    }
  }

  private updateSyncStats(stats: Partial<SyncStats>) {
    this.syncStats = { ...this.syncStats, ...stats }
    // Notify all listeners
    this.syncListeners.forEach((listener) => listener(this.syncStats))
  }

  public startAutoSync(intervalMinutes = 5): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
    }

    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000

    this.autoSyncInterval = setInterval(async () => {
      if (!this.syncInProgress) {
        console.log(`Mem0SyncService: Running auto-sync (${intervalMinutes} minute interval)`)
        await this.synchronizeMemories("default_user", "file_manager")
      }
    }, intervalMs)

    console.log(`Mem0SyncService: Auto-sync started with ${intervalMinutes} minute interval`)
  }

  public stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
      console.log("Mem0SyncService: Auto-sync stopped")
    }
  }

  public async synchronizeMemories(userId: string, aiFamily: string): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log("Mem0SyncService: Sync already in progress")
      return {
        success: false,
        stats: this.syncStats,
        errors: ["Sync already in progress"],
      }
    }

    this.syncInProgress = true
    this.updateSyncStats({ inProgress: true })
    const errors: string[] = []

    try {
      console.log(`Mem0SyncService: Starting synchronization for user ${userId} and AI family ${aiFamily}`)

      // Step 1: Check API connection
      const isConnected = await this.checkApiConnection()
      if (!isConnected) {
        throw new Error("API connection not available")
      }

      // Step 2: Get local memories from database
      const localMemories = await this.getLocalMemories(userId, aiFamily)
      console.log(`Mem0SyncService: Found ${localMemories.length} local memories`)

      // Step 3: Get remote memories from API
      const remoteMemories = await this.getRemoteMemories(userId, aiFamily)
      console.log(`Mem0SyncService: Found ${remoteMemories.length} remote memories`)

      // Step 4: Identify sync status for each memory
      const { memoriesToSync, syncStats } = this.identifySyncStatus(localMemories, remoteMemories)
      this.updateSyncStats(syncStats)

      // Step 5: Synchronize memories
      let synced = 0
      let failed = 0

      // First, push local-only memories to remote
      for (const memory of memoriesToSync.filter((m) => m.sync_status === "local_only")) {
        try {
          await this.pushMemoryToRemote(memory)
          synced++
          this.updateSyncStats({ synced: this.syncStats.synced + 1, localOnly: this.syncStats.localOnly - 1 })
        } catch (error) {
          console.error(`Mem0SyncService: Failed to push memory to remote:`, error)
          failed++
          errors.push(`Failed to push memory to remote: ${memory.id}`)
          this.updateSyncStats({ failed: this.syncStats.failed + 1 })
        }
      }

      // Then, pull remote-only memories to local
      for (const memory of memoriesToSync.filter((m) => m.sync_status === "remote_only")) {
        try {
          await this.pullMemoryToLocal(memory, userId, aiFamily)
          synced++
          this.updateSyncStats({ synced: this.syncStats.synced + 1, remoteOnly: this.syncStats.remoteOnly - 1 })
        } catch (error) {
          console.error(`Mem0SyncService: Failed to pull memory to local:`, error)
          failed++
          errors.push(`Failed to pull memory to local: ${memory.id}`)
          this.updateSyncStats({ failed: this.syncStats.failed + 1 })
        }
      }

      // Handle conflicts (for now, remote wins)
      for (const memory of memoriesToSync.filter((m) => m.sync_status === "conflict")) {
        try {
          await this.resolveConflict(memory, userId, aiFamily)
          synced++
          this.updateSyncStats({ synced: this.syncStats.synced + 1, conflicts: this.syncStats.conflicts - 1 })
        } catch (error) {
          console.error(`Mem0SyncService: Failed to resolve conflict:`, error)
          failed++
          errors.push(`Failed to resolve conflict: ${memory.id}`)
          this.updateSyncStats({ failed: this.syncStats.failed + 1 })
        }
      }

      // Update last synced timestamp
      const lastSyncedAt = new Date().toISOString()
      this.updateSyncStats({ lastSyncedAt })

      // Save sync timestamp to localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`lastSync_${userId}_${aiFamily}`, lastSyncedAt)
        }
      } catch (error) {
        console.error("Mem0SyncService: Error saving sync timestamp:", error)
      }

      console.log(`Mem0SyncService: Synchronization completed. Synced: ${synced}, Failed: ${failed}`)

      return {
        success: failed === 0,
        stats: this.syncStats,
        errors,
      }
    } catch (error) {
      console.error("Mem0SyncService: Synchronization error:", error)
      errors.push(error instanceof Error ? error.message : "Unknown synchronization error")

      return {
        success: false,
        stats: this.syncStats,
        errors,
      }
    } finally {
      this.syncInProgress = false
      this.updateSyncStats({ inProgress: false })
    }
  }

  private async getLocalMemories(userId: string, aiFamily: string): Promise<Memory[]> {
    try {
      if (!this.supabase) {
        console.error("Mem0SyncService: Supabase client not initialized")
        return []
      }

      const aiFamilyUuid = getAiFamilyUuid(aiFamily)
      const userUuid = getUserUuid(userId)

      const { data, error } = await this.supabase
        .from("ai_family_member_memories")
        .select("*")
        .eq("ai_family_member_id", aiFamilyUuid)
        .eq("user_id", userUuid)

      if (error) {
        console.error("Mem0SyncService: Error fetching local memories:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Mem0SyncService: Error in getLocalMemories:", error)
      return []
    }
  }

  private async getRemoteMemories(userId: string, aiFamily: string): Promise<Memory[]> {
    try {
      if (!this.apiKey || !this.apiUrl) {
        console.error("Mem0SyncService: API credentials not available")
        return []
      }

      // Format the base URL correctly
      const baseUrl = this.apiUrl.endsWith("/") ? this.apiUrl.slice(0, -1) : this.apiUrl

      // Try multiple endpoint structures
      const endpoints = [`${baseUrl}/api/memory/search`, `${baseUrl}/memories`, `${baseUrl}/api/memories`]

      for (const endpoint of endpoints) {
        try {
          console.log(`Mem0SyncService: Trying to get memories from endpoint: ${endpoint}`)

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              user_id: userId,
              query: "", // Empty query to get all memories
              limit: 1000, // Get a large number of memories
              filter: aiFamily
                ? {
                    metadata: {
                      ai_family_member_id: aiFamily,
                    },
                  }
                : undefined,
            }),
            signal: AbortSignal.timeout(10000),
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`Mem0SyncService: Successfully retrieved memories from ${endpoint}`)

            // Handle different response formats
            let memories = []
            if (Array.isArray(data)) {
              memories = data
            } else if (data.results) {
              memories = data.results
            } else if (data.memories) {
              memories = data.memories
            } else if (data.data) {
              memories = data.data
            }

            // Add type field if missing
            memories = memories.map((memory: any) => ({
              ...memory,
              type: memory.type || this.determineMemoryType(memory.memory || memory.text || ""),
            }))

            return memories
          }
        } catch (error) {
          console.error(`Mem0SyncService: Error with endpoint ${endpoint}:`, error)
        }
      }

      console.error("Mem0SyncService: All endpoints failed for getting memories")
      return []
    } catch (error) {
      console.error("Mem0SyncService: Error in getRemoteMemories:", error)
      return []
    }
  }

  private determineMemoryType(memory: string): string {
    const lowerMemory = memory.toLowerCase()
    if (lowerMemory.includes("file")) return "file_operation"
    if (lowerMemory.includes("search")) return "search"
    if (lowerMemory.includes("preference")) return "preference"
    return "custom"
  }

  private identifySyncStatus(
    localMemories: Memory[],
    remoteMemories: Memory[],
  ): {
    memoriesToSync: Memory[]
    syncStats: Partial<SyncStats>
  } {
    const memoriesToSync: Memory[] = []
    const localMemoriesMap = new Map<string, Memory>()
    const remoteMemoriesMap = new Map<string, Memory>()

    // Create maps for faster lookup
    localMemories.forEach((memory) => {
      localMemoriesMap.set(memory.id, memory)
    })

    remoteMemories.forEach((memory) => {
      // Remote memories might have different ID formats
      const remoteId = memory.id || memory.local_id
      if (remoteId) {
        remoteMemoriesMap.set(remoteId, memory)
      }
    })

    // Check local memories against remote
    localMemories.forEach((localMemory) => {
      const remoteMemory = remoteMemoriesMap.get(localMemory.id)

      if (!remoteMemory) {
        // Local-only memory
        memoriesToSync.push({
          ...localMemory,
          sync_status: "local_only",
        })
      } else {
        // Check for conflicts (based on updated_at if available)
        const localUpdated = new Date(localMemory.updated_at || localMemory.created_at)
        const remoteUpdated = new Date(remoteMemory.updated_at || remoteMemory.created_at)

        if (localUpdated > remoteUpdated) {
          memoriesToSync.push({
            ...localMemory,
            sync_status: "conflict",
          })
        } else if (remoteUpdated > localUpdated) {
          memoriesToSync.push({
            ...remoteMemory,
            sync_status: "conflict",
          })
        } else {
          // Already synced, no action needed
        }
      }
    })

    // Check remote memories against local
    remoteMemories.forEach((remoteMemory) => {
      const remoteId = remoteMemory.id || remoteMemory.local_id
      if (remoteId && !localMemoriesMap.has(remoteId)) {
        // Remote-only memory
        memoriesToSync.push({
          ...remoteMemory,
          sync_status: "remote_only",
        })
      }
    })

    // Calculate sync stats
    const syncStats: Partial<SyncStats> = {
      total: localMemories.length + remoteMemories.length,
      synced:
        localMemories.length -
        memoriesToSync.filter((m) => m.sync_status === "local_only" || m.sync_status === "conflict").length,
      localOnly: memoriesToSync.filter((m) => m.sync_status === "local_only").length,
      remoteOnly: memoriesToSync.filter((m) => m.sync_status === "remote_only").length,
      conflicts: memoriesToSync.filter((m) => m.sync_status === "conflict").length,
      pending: memoriesToSync.length,
      failed: 0,
    }

    return { memoriesToSync, syncStats }
  }

  private async pushMemoryToRemote(memory: Memory): Promise<boolean> {
    try {
      if (!this.apiKey || !this.apiUrl) {
        throw new Error("API credentials not available")
      }

      // Format the base URL correctly
      const baseUrl = this.apiUrl.endsWith("/") ? this.apiUrl.slice(0, -1) : this.apiUrl

      // Try both endpoint structures to be safe
      const endpoints = [`${baseUrl}/api/memory/add`, `${baseUrl}/memories`]

      for (const endpoint of endpoints) {
        try {
          console.log(`Mem0SyncService: Trying to push memory to endpoint: ${endpoint}`)

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              user_id: memory.user_id || "default_user",
              text: memory.memory,
              memory: memory.memory,
              local_id: memory.id, // Store the local ID for reference
              metadata: {
                ai_family_member_id: memory.ai_family_member_id || "file_manager",
                source: "file_manager",
                type: memory.type || "custom",
                created_at: memory.created_at,
                updated_at: memory.updated_at || memory.created_at,
              },
            }),
            signal: AbortSignal.timeout(5000),
          })

          if (response.ok) {
            console.log("Mem0SyncService: Successfully pushed memory to remote")
            return true
          }
        } catch (error) {
          console.error(`Mem0SyncService: Error with endpoint ${endpoint}:`, error)
        }
      }

      throw new Error("All endpoints failed for pushing memory")
    } catch (error) {
      console.error("Mem0SyncService: Error pushing memory to remote:", error)
      throw error
    }
  }

  private async pullMemoryToLocal(memory: Memory, userId: string, aiFamily: string): Promise<boolean> {
    try {
      if (!this.supabase) {
        throw new Error("Supabase client not initialized")
      }

      const aiFamilyUuid = getAiFamilyUuid(aiFamily)
      const userUuid = getUserUuid(userId)

      // Extract the memory text from different possible fields
      const memoryText = memory.memory || memory.text || ""
      if (!memoryText) {
        throw new Error("Memory content is empty")
      }

      const { error } = await this.supabase.from("ai_family_member_memories").insert([
        {
          ai_family_member_id: aiFamilyUuid,
          user_id: userUuid,
          memory: memoryText,
          created_at: memory.created_at || new Date().toISOString(),
          updated_at: memory.updated_at || memory.created_at || new Date().toISOString(),
          remote_id: memory.id, // Store the remote ID for reference
        },
      ])

      if (error) {
        console.error("Mem0SyncService: Error inserting memory to local database:", error)
        throw error
      }

      console.log("Mem0SyncService: Successfully pulled memory to local")
      return true
    } catch (error) {
      console.error("Mem0SyncService: Error pulling memory to local:", error)
      throw error
    }
  }

  private async resolveConflict(memory: Memory, userId: string, aiFamily: string): Promise<boolean> {
    try {
      // For now, we'll use a simple "remote wins" strategy
      // In a more sophisticated implementation, we could merge changes or let the user decide

      if (memory.sync_status !== "conflict") {
        throw new Error("Memory is not in conflict state")
      }

      if (!this.supabase) {
        throw new Error("Supabase client not initialized")
      }

      const aiFamilyUuid = getAiFamilyUuid(aiFamily)
      const userUuid = getUserUuid(userId)

      // Update the local memory with the remote version
      const { error } = await this.supabase
        .from("ai_family_member_memories")
        .update({
          memory: memory.memory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memory.id)
        .eq("ai_family_member_id", aiFamilyUuid)
        .eq("user_id", userUuid)

      if (error) {
        console.error("Mem0SyncService: Error resolving conflict:", error)
        throw error
      }

      console.log("Mem0SyncService: Successfully resolved conflict")
      return true
    } catch (error) {
      console.error("Mem0SyncService: Error resolving conflict:", error)
      throw error
    }
  }
}

// Export a singleton instance
export const mem0SyncService = Mem0SyncService.getInstance()
