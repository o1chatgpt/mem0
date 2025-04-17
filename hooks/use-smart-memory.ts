"use client"

import { useState, useEffect } from "react"
import { smartMemoryService, type FileMemory, type FileContext } from "@/lib/smart-memory-service"
import type { FileInfo } from "@/lib/file-service"

export function useSmartMemory(fileId?: string, fileInfo?: Partial<FileInfo>) {
  const [fileMemory, setFileMemory] = useState<FileMemory | null>(null)
  const [fileContext, setFileContext] = useState<FileContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize and load file memory
  useEffect(() => {
    const initializeMemory = async () => {
      try {
        await smartMemoryService.initialize()

        // Load file context
        const context = await smartMemoryService.getFileContext()
        setFileContext(context)

        // Load file memory if fileId is provided
        if (fileId) {
          const memory = await smartMemoryService.getFileMemory(fileId, fileInfo)
          setFileMemory(memory)

          // Record file access
          await smartMemoryService.recordInteraction(fileId, "open")
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing smart memory:", err)
        setError(err instanceof Error ? err : new Error("Failed to initialize smart memory"))
        setIsLoading(false)
      }
    }

    initializeMemory()
  }, [fileId, fileInfo])

  // Function to add a tag
  const addTag = async (tag: string) => {
    if (!fileId) return []

    try {
      const tags = await smartMemoryService.addTag(fileId, tag)
      setFileMemory((prev) => (prev ? { ...prev, tags } : null))
      return tags
    } catch (err) {
      console.error("Error adding tag:", err)
      throw err
    }
  }

  // Function to remove a tag
  const removeTag = async (tag: string) => {
    if (!fileId) return []

    try {
      const tags = await smartMemoryService.removeTag(fileId, tag)
      setFileMemory((prev) => (prev ? { ...prev, tags } : null))
      return tags
    } catch (err) {
      console.error("Error removing tag:", err)
      throw err
    }
  }

  // Function to add a note
  const addNote = async (note: string) => {
    if (!fileId) return []

    try {
      const notes = await smartMemoryService.addNote(fileId, note)
      setFileMemory((prev) => (prev ? { ...prev, notes } : null))
      return notes
    } catch (err) {
      console.error("Error adding note:", err)
      throw err
    }
  }

  // Function to store analysis results
  const storeAnalysisResults = async (results: NonNullable<FileMemory["analysisResults"]>) => {
    if (!fileId) return

    try {
      await smartMemoryService.storeAnalysisResults(fileId, results)
      setFileMemory((prev) =>
        prev
          ? {
              ...prev,
              analysisResults: { ...prev.analysisResults, ...results, lastAnalyzed: new Date().toISOString() },
            }
          : null,
      )
    } catch (err) {
      console.error("Error storing analysis results:", err)
      throw err
    }
  }

  // Function to find related files
  const findRelatedFiles = async (limit = 5) => {
    if (!fileId) return []

    try {
      return await smartMemoryService.findRelatedFiles(fileId, limit)
    } catch (err) {
      console.error("Error finding related files:", err)
      return []
    }
  }

  // Function to search files
  const searchFiles = async (query: string, limit = 10) => {
    try {
      return await smartMemoryService.searchFiles(query, limit)
    } catch (err) {
      console.error("Error searching files:", err)
      return []
    }
  }

  // Function to record an interaction
  const recordInteraction = async (
    action: "open" | "edit" | "analyze" | "tag" | "download" | "share" | "delete",
    details?: string,
  ) => {
    if (!fileId) return

    try {
      await smartMemoryService.recordInteraction(fileId, action, details)
    } catch (err) {
      console.error("Error recording interaction:", err)
      // Don't throw to prevent UI disruption
    }
  }

  return {
    fileMemory,
    fileContext,
    isLoading,
    error,
    addTag,
    removeTag,
    addNote,
    storeAnalysisResults,
    findRelatedFiles,
    searchFiles,
    recordInteraction,
  }
}
