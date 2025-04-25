"use client"
import { createContext, useContext } from "react"

interface AppContextType {
  fileService: any
  memoryStore: any
  shareService: any
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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
