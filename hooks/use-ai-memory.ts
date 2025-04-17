"use client"

import { useState, useCallback, useRef } from "react"

// Mock memories for fallback when API is unavailable
const MOCK_MEMORIES = [
  {
    id: "1",
    content: "User likes to organize files by project type",
    timestamp: new Date().toISOString(),
    userId: "default_user",
    metadata: { type: "preference" },
  },
  {
    id: "2",
    content: "User prefers dark mode for the interface",
    timestamp: new Date().toISOString(),
    userId: "default_user",
    metadata: { type: "preference" },
  },
  {
    id: "3",
    content: "User frequently works with image and document files",
    timestamp: new Date().toISOString(),
    userId: "default_user",
    metadata: { type: "behavior" },
  },
  {
    id: "4",
    content: "Lyra enjoys helping with creative projects and organization",
    timestamp: new Date().toISOString(),
    userId: "lyra",
    metadata: { type: "personality" },
  },
  {
    id: "5",
    content: "Cecilia specializes in document management and categorization",
    timestamp: new Date().toISOString(),
    userId: "cecilia",
    metadata: { type: "personality" },
  },
]

interface Memory {
  id: string
  content: string
  timestamp: string
  userId: string
  metadata?: Record<string, any>
}

export function useAIMemory(userId = "default_user") {
  // Use useRef to track initialization
  const isInitialized = useRef(false)

  // Initialize memories with filtered mock data
  const initialMemories = MOCK_MEMORIES.filter((m) => m.userId === userId || m.userId === "default_user")

  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMemories = useCallback(
    (query?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Filter mock memories by userId and query if provided
        const filteredMemories = MOCK_MEMORIES.filter(
          (memory) => memory.userId === userId || memory.userId === "default_user",
        ).filter((memory) => !query || memory.content.toLowerCase().includes(query.toLowerCase()))

        // Set memories after a small delay to simulate API call
        setTimeout(() => {
          setMemories(filteredMemories)
          setIsLoading(false)
        }, 300)
      } catch (err) {
        console.error("Error in fetchMemories:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsLoading(false)
      }

      // This is now a synchronous function that returns nothing
    },
    [userId],
  )

  const addMemory = useCallback(
    (content: string, metadata?: Record<string, any>) => {
      setIsLoading(true)
      setError(null)

      try {
        // Create a new mock memory
        const newMemory: Memory = {
          id: Date.now().toString(),
          content,
          timestamp: new Date().toISOString(),
          userId,
          metadata,
        }

        // Add to local state
        setMemories((prev) => [...prev, newMemory])
        setIsLoading(false)
        return true
      } catch (err) {
        console.error("Error in addMemory:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsLoading(false)
        return false
      }
    },
    [userId],
  )

  return {
    memories,
    isLoading,
    error,
    fetchMemories,
    addMemory,
    useFallback: true, // Always use fallback mode
  }
}
