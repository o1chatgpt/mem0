"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { memoryService } from "@/lib/memory-service"

interface MemoryContextType {
  isMemoryAvailable: boolean
  isLoading: boolean
  recordFileView: (fileId: number, fileName: string, userId: number) => Promise<void>
  recordFolderNavigation: (folderId: number, folderName: string, userId: number) => Promise<void>
  recordSearch: (query: string, resultCount: number, userId: number) => Promise<void>
}

const MemoryContext = createContext<MemoryContextType>({
  isMemoryAvailable: false,
  isLoading: true,
  recordFileView: async () => {},
  recordFolderNavigation: async () => {},
  recordSearch: async () => {},
})

export function useMemory() {
  return useContext(MemoryContext)
}

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [isMemoryAvailable, setIsMemoryAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMemoryAvailability = async () => {
      setIsLoading(true)
      try {
        // Check if Supabase environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are not set. Memory features will be disabled.")
          setIsMemoryAvailable(false)
          setIsLoading(false)
          return
        }

        const available = await memoryService.isMemoryAvailable()
        setIsMemoryAvailable(available)
      } catch (error) {
        console.error("Error checking memory availability:", error)
        setIsMemoryAvailable(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMemoryAvailability()
  }, [])

  const recordFileView = async (fileId: number, fileName: string, userId: number) => {
    if (!isMemoryAvailable) return

    try {
      await memoryService.recordFileOperation(
        "view",
        {
          id: fileId,
          name: fileName,
        },
        userId,
      )
    } catch (error) {
      console.error("Error recording file view:", error)
    }
  }

  const recordFolderNavigation = async (folderId: number, folderName: string, userId: number) => {
    if (!isMemoryAvailable) return

    try {
      await memoryService.recordFolderOperation(
        "navigate",
        {
          id: folderId,
          name: folderName,
        },
        userId,
      )
    } catch (error) {
      console.error("Error recording folder navigation:", error)
    }
  }

  const recordSearch = async (query: string, resultCount: number, userId: number) => {
    if (!isMemoryAvailable) return

    try {
      await memoryService.recordSearchOperation(query, resultCount, userId)
    } catch (error) {
      console.error("Error recording search:", error)
    }
  }

  return (
    <MemoryContext.Provider
      value={{
        isMemoryAvailable,
        isLoading,
        recordFileView,
        recordFolderNavigation,
        recordSearch,
      }}
    >
      {children}
    </MemoryContext.Provider>
  )
}
