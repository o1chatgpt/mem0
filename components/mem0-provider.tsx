"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  addMemory,
  getMemories,
  searchMemories,
  deleteMemory,
  updateMemory,
  getMemoryStats,
  processConversation,
  type Memory,
} from "@/services/mem0-service"

interface Mem0ContextType {
  // Memory operations
  addMemory: (aiFamily: string, memory: string, metadata?: Record<string, any>) => Promise<boolean>
  getMemories: (aiFamily: string, limit?: number) => Promise<Memory[]>
  searchMemories: (aiFamily: string, query: string, limit?: number) => Promise<Memory[]>
  deleteMemory: (memoryId: string) => Promise<boolean>
  updateMemory: (memoryId: string, memory: string, metadata?: Record<string, any>) => Promise<boolean>

  // Conversation processing
  processConversation: (aiFamily: string, messages: Array<{ role: string; content: string }>) => Promise<boolean>

  // Statistics
  getMemoryStats: (aiFamily: string) => Promise<{ totalMemories: number; lastUpdated: string | null }>

  // State
  isLoading: boolean
  error: string | null
}

const Mem0Context = createContext<Mem0ContextType | undefined>(undefined)

export function Mem0Provider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Default user ID - in a real app, you would get this from authentication
  const defaultUserId = "00000000-0000-0000-0000-000000000000"

  /**
   * Get the current user ID
   * @returns User ID
   */
  const getUserId = async (): Promise<string> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user?.id || defaultUserId
    } catch (error) {
      console.error("Error getting user:", error)
      return defaultUserId
    }
  }

  /**
   * Add a memory for an AI family member
   * @param aiFamily AI family member ID
   * @param memory Memory content
   * @param metadata Optional metadata
   * @returns Success status
   */
  const addMemoryForAI = async (aiFamily: string, memory: string, metadata?: Record<string, any>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = await getUserId()
      const result = await addMemory(userId, aiFamily, memory, metadata)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error adding memory"
      setError(errorMessage)
      console.error("Error adding memory:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get memories for an AI family member
   * @param aiFamily AI family member ID
   * @param limit Maximum number of memories to retrieve
   * @returns Array of memories
   */
  const getMemoriesForAI = async (aiFamily: string, limit = 10): Promise<Memory[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = await getUserId()
      const memories = await getMemories(userId, aiFamily, limit)
      return memories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching memories"
      setError(errorMessage)
      console.error("Error fetching memories:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Search memories for an AI family member
   * @param aiFamily AI family member ID
   * @param query Search query
   * @param limit Maximum number of memories to retrieve
   * @returns Array of memories sorted by relevance
   */
  const searchMemoriesForAI = async (aiFamily: string, query: string, limit = 5): Promise<Memory[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = await getUserId()
      const memories = await searchMemories(userId, aiFamily, query, limit)
      return memories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error searching memories"
      setError(errorMessage)
      console.error("Error searching memories:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Delete a memory
   * @param memoryId Memory ID
   * @returns Success status
   */
  const deleteMemoryById = async (memoryId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteMemory(memoryId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error deleting memory"
      setError(errorMessage)
      console.error("Error deleting memory:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Update a memory
   * @param memoryId Memory ID
   * @param memory New memory content
   * @param metadata Optional metadata
   * @returns Success status
   */
  const updateMemoryById = async (
    memoryId: string,
    memory: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updateMemory(memoryId, memory, metadata)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error updating memory"
      setError(errorMessage)
      console.error("Error updating memory:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get memory statistics for an AI family member
   * @param aiFamily AI family member ID
   * @returns Memory statistics
   */
  const getMemoryStatsForAI = async (
    aiFamily: string,
  ): Promise<{ totalMemories: number; lastUpdated: string | null }> => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = await getUserId()
      const stats = await getMemoryStats(userId, aiFamily)
      return stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error getting memory stats"
      setError(errorMessage)
      console.error("Error getting memory stats:", err)
      return { totalMemories: 0, lastUpdated: null }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Process conversation for memory extraction
   * @param aiFamily AI family member ID
   * @param messages Array of chat messages
   * @returns Success status
   */
  const processConversationForAI = async (
    aiFamily: string,
    messages: Array<{ role: string; content: string }>,
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = await getUserId()
      const result = await processConversation(userId, aiFamily, messages)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error processing conversation"
      setError(errorMessage)
      console.error("Error processing conversation:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Create the context value
  const contextValue: Mem0ContextType = {
    addMemory: addMemoryForAI,
    getMemories: getMemoriesForAI,
    searchMemories: searchMemoriesForAI,
    deleteMemory: deleteMemoryById,
    updateMemory: updateMemoryById,
    getMemoryStats: getMemoryStatsForAI,
    processConversation: processConversationForAI,
    isLoading,
    error,
  }

  return <Mem0Context.Provider value={contextValue}>{children}</Mem0Context.Provider>
}

/**
 * Hook to use the Mem0 context
 * @returns Mem0 context
 */
export function useMem0() {
  const context = useContext(Mem0Context)
  if (context === undefined) {
    throw new Error("useMem0 must be used within a Mem0Provider")
  }
  return context
}
