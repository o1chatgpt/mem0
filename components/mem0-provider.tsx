"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { mem0Client } from "@/lib/mem0-client"
import { usePathname } from "next/navigation"

// Define types
export interface Memory {
  id: string
  content: string
  metadata: {
    title?: string
    tags?: string[]
    createdAt: string
    updatedAt: string
  }
}

export interface MemoryStats {
  totalDocuments: number
  totalTokens: number
  averageTokensPerDocument: number
  lastUpdated: string
  memoryHealth: string
  usageByDay: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
}

interface Mem0ContextType {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  memories: Memory[]
  stats: MemoryStats | null
  apiAvailable: boolean
  refreshMemories: () => Promise<void>
  refreshStats: () => Promise<void>
  checkApiStatus: () => Promise<boolean>
  clearCache: () => void
  cacheEnabled: boolean
  setCacheEnabled: (enabled: boolean) => void
}

const defaultStats: MemoryStats = {
  totalDocuments: 0,
  totalTokens: 0,
  averageTokensPerDocument: 0,
  lastUpdated: new Date().toISOString(),
  memoryHealth: "good",
  usageByDay: {},
  topTags: [],
}

const Mem0Context = createContext<Mem0ContextType>({
  isInitialized: false,
  isLoading: false,
  error: null,
  memories: [],
  stats: defaultStats,
  apiAvailable: false,
  refreshMemories: async () => {},
  refreshStats: async () => {},
  checkApiStatus: async () => false,
  clearCache: () => {},
  cacheEnabled: true,
  setCacheEnabled: () => {},
})

export function useMem0() {
  return useContext(Mem0Context)
}

export function Mem0Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [stats, setStats] = useState<MemoryStats | null>(defaultStats)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const pathname = usePathname()

  // Skip API calls on login and unauthorized pages
  const shouldSkipApiCalls = pathname === "/login" || pathname === "/unauthorized" || pathname?.startsWith("/api/")

  // Update cache configuration when cacheEnabled changes
  useEffect(() => {
    const currentConfig = mem0Client.getCacheConfig()
    mem0Client.setCacheConfig({ ...currentConfig, enabled: cacheEnabled })
  }, [cacheEnabled])

  // Check if the API is available
  const checkApiStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/mem0-status")
      if (response.ok) {
        const data = await response.json()
        setApiAvailable(data.available)
        return data.available
      }
      setApiAvailable(false)
      return false
    } catch (error) {
      console.error("Error checking API status:", error)
      setApiAvailable(false)
      return false
    }
  }

  const refreshMemories = async () => {
    if (!mem0Client.isInitialized() || shouldSkipApiCalls) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // This should never throw an error now
      const fetchedMemories = await mem0Client.getMemories()
      // Ensure we have an array even if the API returns null or undefined
      setMemories(Array.isArray(fetchedMemories) ? fetchedMemories : [])
    } catch (err) {
      // This should never happen now, but just in case
      console.warn("Unexpected error fetching memories:", err)
      // We don't set an error here since we're using mock data as fallback
      // Keep the default or previous memories
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStats = async () => {
    if (!mem0Client.isInitialized() || shouldSkipApiCalls) {
      return
    }

    setIsLoading(true)

    try {
      // This should never throw an error now
      const fetchedStats = await mem0Client.getStats()
      setStats(fetchedStats)
      // Clear any previous errors since we succeeded
      setError(null)
    } catch (err) {
      // This should never happen now, but just in case
      console.warn("Unexpected error fetching stats:", err)
      // We don't set an error here since stats are non-critical
      // Keep the default or previous stats
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = () => {
    mem0Client.clearCache()
  }

  useEffect(() => {
    // Check if Mem0 client is initialized
    const initialized = mem0Client.isInitialized()
    setIsInitialized(initialized)

    // Skip API calls on login page
    if (shouldSkipApiCalls) {
      setIsLoading(false)
      return
    }

    if (initialized) {
      // Check API status first
      const checkStatus = async () => {
        const available = await checkApiStatus()

        // If API is not available, we'll still load mock data
        // but we won't show an error
        if (!available) {
          console.warn("Mem0 API is not available, using mock data")
        }

        // Load initial data
        await loadInitialData()
      }

      // Load initial data
      const loadInitialData = async () => {
        setIsLoading(true)

        try {
          // Load stats and memories in parallel
          await Promise.all([
            refreshStats().catch((err) => {
              console.warn("Non-critical error loading stats:", err)
              // Stats errors are non-critical, we already have default stats
            }),
            refreshMemories().catch((err) => {
              console.warn("Non-critical error loading memories:", err)
              // Memory errors are now also non-critical since we return mock data
            }),
          ])
        } catch (err) {
          console.error("Unexpected error in loadInitialData:", err)
          // Don't let this error stop the app from loading
        } finally {
          setIsLoading(false)
        }
      }

      checkStatus()
    } else {
      setIsLoading(false)
    }
  }, [shouldSkipApiCalls])

  return (
    <Mem0Context.Provider
      value={{
        isInitialized,
        isLoading,
        error,
        memories,
        stats,
        apiAvailable,
        refreshMemories,
        refreshStats,
        checkApiStatus,
        clearCache,
        cacheEnabled,
        setCacheEnabled,
      }}
    >
      {children}
    </Mem0Context.Provider>
  )
}
