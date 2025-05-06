"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mem0Client } from "@/lib/mem0-client"
import { enhancedMemoryStore } from "./enhanced-memory-store"

export interface AppContextType {
  fileService: any
  memoryStore: any
  shareService: any
  syncService: any
  currentPath: string
  files: any[]
  selectedFileId: string | null
  selectedFile: any | null
  selectedFileIds: string[]
  fileContent: string
  isLoading: boolean
  error: string | null
  recentFiles: any[]
  favoriteFiles: string[]
  searchHistory: string[]
  frequentFiles: any[]
  suggestedFiles: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  setCurrentPath: (path: string) => void
  setSelectedFileId: (id: string | null) => void
  setSelectedFileIds: (ids: string[]) => void
  toggleFileSelection: (id: string, exclusive?: boolean) => void
  clearFileSelection: () => void
  bulkDeleteFiles: () => Promise<void>
  bulkDownloadFiles: () => Promise<void>
  bulkAddToFavorites: () => Promise<void>
  bulkRemoveFromFavorites: () => Promise<void>
  bulkAddTags: (tags: string[]) => Promise<void>
  setFileContent: (content: string) => void
  saveFile: () => Promise<void>
  refreshFiles: () => Promise<void>
  addToFavorites: (fileId: string) => void
  removeFromFavorites: (fileId: string) => void
  addToSearchHistory: (query: string) => void
  createNewTextFile: () => void
  loading: boolean
  createFileFromTemplate: (templateId: string, fileName: string) => Promise<void>
  recommendationEngine: any
  enhancedMemoryStore: typeof enhancedMemoryStore
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [memoryStoreInitialized, setMemoryStoreInitialized] = useState(false)
  const [memoryStore, setMemoryStore] = useState<any>(null)

  // Initialize memory store
  useEffect(() => {
    const initializeMemoryStore = async () => {
      try {
        // Try to initialize mem0Client
        if (!mem0Client.isInitialized()) {
          await mem0Client.initialize()
        }
        setMemoryStore(mem0Client)
      } catch (error) {
        console.error("Failed to initialize mem0Client:", error)
        // Fall back to local memory store
        const localMemoryStore = {
          getStorageMode: () => "local",
          getMemories: () => [],
          clearMemory: async () => {},
          // Add other required methods
        }
        setMemoryStore(localMemoryStore)
      } finally {
        setMemoryStoreInitialized(true)
      }
    }

    initializeMemoryStore()
  }, [])

  const contextValue: AppContextType = {
    fileService: null,
    memoryStore,
    shareService: null,
    syncService: null,
    currentPath: "",
    files: [],
    selectedFileId: null,
    selectedFile: null,
    selectedFileIds: [],
    fileContent: "",
    isLoading: false,
    error: null,
    recentFiles: [],
    favoriteFiles: [],
    searchHistory: [],
    frequentFiles: [],
    suggestedFiles: [],
    searchQuery: "",
    setSearchQuery: () => {},
    setCurrentPath: () => {},
    setSelectedFileId: () => {},
    setSelectedFileIds: () => {},
    toggleFileSelection: () => {},
    clearFileSelection: () => {},
    bulkDeleteFiles: async () => {},
    bulkDownloadFiles: async () => {},
    bulkAddToFavorites: async () => {},
    bulkRemoveFromFavorites: async () => {},
    bulkAddTags: async () => {},
    setFileContent: () => {},
    saveFile: async () => Promise.resolve(),
    refreshFiles: async () => Promise.resolve(),
    addToFavorites: () => {},
    removeFromFavorites: () => {},
    addToSearchHistory: () => {},
    createNewTextFile: () => {},
    loading: !memoryStoreInitialized,
    createFileFromTemplate: async () => {},
    recommendationEngine: null,
    enhancedMemoryStore,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
