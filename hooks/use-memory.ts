"use client"

import { useState, useCallback } from "react"
import { useUser } from "@/hooks/use-user"

type Memory = {
  id: number
  content: string
  created_at: string
  ai_member_id: number | null
  category?: string | null
  relevance_score?: number
}

type MemoryCategory = {
  id: number
  name: string
  description: string | null
  color: string | null
  icon: string | null
  user_id: number
  created_at: string
  prompt_template?: string | null
}

type MemoryStats = {
  count: number
  oldestDate: Date | null
  newestDate: Date | null
  categoryDistribution: Array<{ category: string | null; count: number }>
}

export function useMemory() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMemory = useCallback(
    async (content: string, aiMemberId?: number, category?: string) => {
      if (!user?.id) return null

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            userId: user.id,
            content,
            aiMemberId,
            category,
          }),
        })

        const data = await response.json()
        if (data.error) {
          setError(data.error)
          return null
        }

        return data.memory
      } catch (err) {
        setError("Failed to add memory")
        console.error("Error adding memory:", err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const getMemories = useCallback(
    async (aiMemberId?: number, category?: string, limit = 10) => {
      if (!user?.id) return []

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get",
            userId: user.id,
            aiMemberId,
            category,
            limit,
          }),
        })

        const data = await response.json()
        if (data.error) {
          setError(data.error)
          return []
        }

        return data.memories || []
      } catch (err) {
        setError("Failed to fetch memories")
        console.error("Error fetching memories:", err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const searchMemories = useCallback(
    async (query: string, aiMemberId?: number, category?: string, limit = 5) => {
      if (!user?.id) return []

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "search",
            userId: user.id,
            query,
            aiMemberId,
            category,
            limit,
          }),
        })

        const data = await response.json()
        if (data.error) {
          setError(data.error)
          return []
        }

        return data.memories || []
      } catch (err) {
        setError("Failed to search memories")
        console.error("Error searching memories:", err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const getCategories = useCallback(async () => {
    if (!user?.id) return []

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        return []
      }

      return data.categories || []
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const getMemoryStats = useCallback(
    async (aiMemberId?: number) => {
      if (!user?.id) return null

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "stats",
            userId: user.id,
            aiMemberId,
          }),
        })

        const data = await response.json()
        if (data.error) {
          setError(data.error)
          return null
        }

        return data.stats || null
      } catch (err) {
        setError("Failed to fetch memory statistics")
        console.error("Error fetching memory statistics:", err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  return {
    addMemory,
    getMemories,
    searchMemories,
    getCategories,
    getMemoryStats,
    isLoading,
    error,
  }
}
