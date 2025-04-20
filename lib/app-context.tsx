"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { type FileService, FileServiceImpl, type FileInfo } from "./file-service"
import { MemoryStore } from "./memory-store"
// Add this import at the top
import { shareService } from "./share-service"
// Fix the file-saver import
import FileSaver from "file-saver"
import JSZip from "jszip"
// Add this import at the top
import { getTemplateById } from "./templates-service"
import { RecommendationEngine } from "./recommendation-engine"
import { syncService } from "./sync-service"

// Update the AppContextType interface to include syncService
interface AppContextType {
  fileService: FileService
  memoryStore: MemoryStore
  shareService: typeof shareService
  syncService: typeof syncService
  currentPath: string
  files: FileInfo[]
  selectedFileId: string | null
  selectedFile: FileInfo | null
  selectedFileIds: string[] // Add this line
  fileContent: string
  isLoading: boolean
  error: string | null
  recentFiles: FileInfo[]
  favoriteFiles: string[]
  searchHistory: string[]
  frequentFiles: FileInfo[]
  suggestedFiles: FileInfo[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  setCurrentPath: (path: string) => void
  setSelectedFileId: (id: string | null) => void
  setSelectedFileIds: (ids: string[]) => void // Add this line
  toggleFileSelection: (id: string, exclusive?: boolean) => void // Add this line
  clearFileSelection: () => void // Add this line
  bulkDeleteFiles: () => Promise<void> // Add this line
  bulkDownloadFiles: () => Promise<void> // Add this line
  bulkAddToFavorites: () => Promise<void> // Add this line
  bulkRemoveFromFavorites: () => Promise<void> // Add this line
  bulkAddTags: (tags: string[]) => Promise<void> // Add this line
  setFileContent: (content: string) => void
  saveFile: () => Promise<void>
  refreshFiles: () => Promise<void>
  addToFavorites: (fileId: string) => void
  removeFromFavorites: (fileId: string) => void
  addToSearchHistory: (query: string) => void
  createNewTextFile: () => void
  loading: boolean
  createFileFromTemplate: (templateId: string, fileName: string) => Promise<void>
  recommendationEngine: RecommendationEngine
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// In the AppProvider function, add the new state and functions
export function AppProvider({ children }: { children: React.ReactNode }) {
  const fileService = useMemo(() => new FileServiceImpl(), [])
  const [memoryStore] = useState(() => new MemoryStore("default-user"))
  const [recommendationEngine] = useState(() => new RecommendationEngine(memoryStore))

  const [currentPath, setCurrentPath] = useState("/")
  const [files, setFiles] = useState<FileInfo[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Update the initial state values to ensure they're always arrays
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([])
  const [favoriteFiles, setFavoriteFiles] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Add frequentFiles and suggestedFiles state
  const [frequentFiles, setFrequentFiles] = useState<FileInfo[]>([])
  const [suggestedFiles, setSuggestedFiles] = useState<FileInfo[]>([])

  // Add setSearchQuery function
  const [searchQuery, setSearchQuery] = useState("")
  const [memoryInitialized, setMemoryInitialized] = useState(false)
  const [syncInitialized, setSyncInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add this new state for tracking multiple selected files
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])

  // Load files for current path
  const loadFilesForPath = useCallback(
    async (path: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const filesData = await fileService.listFiles(path)
        setFiles(filesData)

        // Record this path in memory
        if (memoryInitialized) {
          try {
            await memoryStore.addMemory(`Browsed directory: ${path}`)

            // Save current path to sync service
            if (syncInitialized) {
              await syncService.setPreference("lastPath", path)
            }
          } catch (error) {
            console.warn("Failed to record directory browsing in memory:", error)
            // Continue anyway, this is non-critical
          }
        }
      } catch (error) {
        console.error("Error loading files:", error)
        setError("Failed to load files. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [fileService, memoryStore, memoryInitialized, syncInitialized],
  )

  // Refresh files
  const refreshFiles = useCallback(async () => {
    await loadFilesForPath(currentPath)
  }, [currentPath, loadFilesForPath])

  // Initialize memory store and sync service
  useEffect(() => {
    const initServices = async () => {
      setLoading(true)
      try {
        // Initialize memory store
        await memoryStore.initialize()
        setMemoryInitialized(true)

        // Initialize recommendation engine
        await recommendationEngine.initialize()

        // Initialize sync service
        await syncService.initialize("default-user")
        setSyncInitialized(true)

        // Load favorites from sync service first, fall back to memory store
        try {
          const syncedFavorites = await syncService.getPreference<string[]>("favorites")
          if (syncedFavorites) {
            setFavoriteFiles(syncedFavorites)
          } else {
            const memoryFavorites = await memoryStore.retrieveMemory<string[]>("favorites")
            if (memoryFavorites) {
              setFavoriteFiles(memoryFavorites)
              // Save to sync service for future use
              await syncService.setPreference("favorites", memoryFavorites)
            }
          }
        } catch (error) {
          console.error("Error loading favorites:", error)
          setFavoriteFiles([])
        }

        // Load search history from sync service first, fall back to memory store
        try {
          const syncedSearchHistory = await syncService.getPreference<string[]>("searchHistory")
          if (syncedSearchHistory) {
            setSearchHistory(syncedSearchHistory)
          } else {
            const memorySearchHistory = await memoryStore.retrieveMemory<string[]>("searchHistory")
            if (memorySearchHistory) {
              setSearchHistory(memorySearchHistory)
              // Save to sync service for future use
              await syncService.setPreference("searchHistory", memorySearchHistory)
            }
          }
        } catch (error) {
          console.error("Error loading search history:", error)
          setSearchHistory([])
        }

        // Load recent files from sync service first, fall back to memory store
        try {
          const syncedRecentFiles = await syncService.getPreference<FileInfo[]>("recentFiles")
          if (syncedRecentFiles) {
            setRecentFiles(syncedRecentFiles)
          } else {
            const memoryRecentFiles = await memoryStore.retrieveMemory<FileInfo[]>("recentFiles")
            if (memoryRecentFiles) {
              setRecentFiles(memoryRecentFiles)
              // Save to sync service for future use
              await syncService.setPreference("recentFiles", memoryRecentFiles)
            }
          }
        } catch (error) {
          console.error("Error loading recent files:", error)
          setRecentFiles([])
        }

        // Load last path from sync service
        try {
          const lastPath = await syncService.getPreference<string>("lastPath", "/")
          if (lastPath) {
            setCurrentPath(lastPath)
          }
        } catch (error) {
          console.error("Error loading last path:", error)
        }
      } catch (error) {
        console.error("Error initializing services:", error)
        // Continue anyway, as we have fallback behavior
        setMemoryInitialized(true)
        setSyncInitialized(true)
      } finally {
        setLoading(false)
      }
    }

    initServices()
  }, [memoryStore, recommendationEngine])

  // Load favorites and search history from memory
  useEffect(() => {
    if (!memoryInitialized) return

    const loadMemoryData = async () => {
      try {
        // Load favorites with error handling
        try {
          const storedFavorites = await memoryStore.retrieveMemory<string[]>("favorites")
          if (storedFavorites) {
            setFavoriteFiles(storedFavorites)
          }
        } catch (error) {
          console.error("Error loading favorites:", error)
          // Continue with empty favorites
          setFavoriteFiles([])
        }

        // Load search history with error handling
        try {
          const storedSearchHistory = await memoryStore.retrieveMemory<string[]>("searchHistory")
          if (storedSearchHistory) {
            setSearchHistory(storedSearchHistory)
          }
        } catch (error) {
          console.error("Error loading search history:", error)
          // Continue with empty search history
          setSearchHistory([])
        }

        // Load recent files with error handling
        try {
          const storedRecentFiles = await memoryStore.retrieveMemory<FileInfo[]>("recentFiles")
          if (storedRecentFiles) {
            setRecentFiles(storedRecentFiles)
          }
        } catch (error) {
          console.error("Error loading recent files:", error)
          // Continue with empty recent files
          setRecentFiles([])
        }
      } catch (error) {
        console.error("Error loading memory data:", error)
        // Continue with empty state, don't block the app
      }
    }

    loadMemoryData()
  }, [memoryStore, memoryInitialized])

  // Toggle file selection (for multi-select)
  const toggleFileSelection = useCallback(
    async (id: string, exclusive = false) => {
      if (exclusive) {
        // Exclusive selection (like clicking without modifier keys)
        setSelectedFileIds([id])
        setSelectedFileId(id)
      } else {
        // Toggle selection (like Ctrl+click)
        setSelectedFileIds((prev) => {
          if (prev.includes(id)) {
            // Deselect if already selected
            const newSelection = prev.filter((fileId) => fileId !== id)
            // Update selectedFileId if needed
            if (selectedFileId === id) {
              setSelectedFileId(newSelection.length > 0 ? newSelection[0] : null)
            }
            return newSelection
          } else {
            // Add to selection
            const newSelection = [...prev, id]
            // Update selectedFileId if not set
            if (!selectedFileId) {
              setSelectedFileId(id)
            }
            return newSelection
          }
        })
      }

      // Record file access in recommendation engine
      const file = files.find((f) => f.id === id)
      if (file) {
        await recommendationEngine.recordFileAccess(id, file.name)
      }
    },
    [files, recommendationEngine, selectedFileId, setSelectedFileId],
  )

  // Clear file selection
  const clearFileSelection = useCallback(() => {
    setSelectedFileIds([])
    setSelectedFileId(null)
  }, [setSelectedFileId])

  // Bulk delete files
  const bulkDeleteFiles = useCallback(async () => {
    if (selectedFileIds.length === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedFileIds.length} files?`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Delete files one by one
      for (const fileId of selectedFileIds) {
        await fileService.deleteFile(fileId)
      }

      // Record in memory
      if (memoryInitialized) {
        try {
          await memoryStore.addMemory(`Bulk deleted ${selectedFileIds.length} files`)
        } catch (error) {
          console.warn("Failed to record bulk deletion in memory:", error)
        }
      }

      // Clear selection and refresh
      clearFileSelection()
      await refreshFiles()
    } catch (error) {
      console.error("Error during bulk delete:", error)
      setError("Failed to delete some files. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [selectedFileIds, fileService, clearFileSelection, refreshFiles, memoryStore, memoryInitialized])

  // Bulk download files
  const bulkDownloadFiles = useCallback(async () => {
    if (selectedFileIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const zip = new JSZip()

      // Add each file to the zip
      for (const fileId of selectedFileIds) {
        const file = files.find((f) => f.id === fileId)
        if (!file) continue

        if (file.content) {
          // Add text content
          zip.file(file.name, file.content)
        } else if (file.url) {
          // Fetch binary content from URL
          try {
            const response = await fetch(file.url)
            const blob = await response.blob()
            zip.file(file.name, blob)
          } catch (error) {
            console.error(`Error fetching file ${file.name}:`, error)
          }
        }
      }

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Save the zip file - update this line
      FileSaver.saveAs(zipBlob, `files-${new Date().toISOString().slice(0, 10)}.zip`)

      // Record in memory
      if (memoryInitialized) {
        try {
          await memoryStore.addMemory(`Bulk downloaded ${selectedFileIds.length} files as zip`)
        } catch (error) {
          console.warn("Failed to record bulk download in memory:", error)
        }
      }
    } catch (error) {
      console.error("Error during bulk download:", error)
      setError("Failed to download files. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [selectedFileIds, files, memoryStore, memoryInitialized])

  // Bulk add to favorites
  const bulkAddToFavorites = useCallback(async () => {
    if (selectedFileIds.length === 0) return

    try {
      // Get current favorites
      const updatedFavorites = [...favoriteFiles]

      // Add each selected file to favorites if not already there
      for (const fileId of selectedFileIds) {
        if (!updatedFavorites.includes(fileId)) {
          updatedFavorites.push(fileId)
        }
      }

      setFavoriteFiles(updatedFavorites)

      // Store in memory and sync
      if (memoryInitialized) {
        try {
          await memoryStore.storeMemory("favorites", updatedFavorites)
          await memoryStore.addMemory(`Added ${selectedFileIds.length} files to favorites`)

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference("favorites", updatedFavorites)
          }
        } catch (error) {
          console.warn("Failed to store favorites in memory:", error)
        }
      }
    } catch (error) {
      console.error("Error adding files to favorites:", error)
    }
  }, [selectedFileIds, favoriteFiles, memoryStore, memoryInitialized, syncInitialized])

  // Bulk remove from favorites
  const bulkRemoveFromFavorites = useCallback(async () => {
    if (selectedFileIds.length === 0) return

    try {
      // Remove selected files from favorites
      const updatedFavorites = favoriteFiles.filter((id) => !selectedFileIds.includes(id))

      setFavoriteFiles(updatedFavorites)

      // Store in memory and sync
      if (memoryInitialized) {
        try {
          await memoryStore.storeMemory("favorites", updatedFavorites)
          await memoryStore.addMemory(`Removed ${selectedFileIds.length} files from favorites`)

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference("favorites", updatedFavorites)
          }
        } catch (error) {
          console.warn("Failed to store favorites in memory:", error)
        }
      }
    } catch (error) {
      console.error("Error removing files from favorites:", error)
    }
  }, [selectedFileIds, favoriteFiles, memoryStore, memoryInitialized, syncInitialized])

  // Bulk add tags
  const bulkAddTags = useCallback(
    async (tags: string[]) => {
      if (selectedFileIds.length === 0 || tags.length === 0) return

      try {
        // Add tags to each selected file
        for (const fileId of selectedFileIds) {
          // Get existing tags
          const existingTags = await memoryStore.getFileTags(fileId)

          // Add new tags (avoiding duplicates)
          const newTags = [...existingTags]
          for (const tag of tags) {
            if (!newTags.includes(tag)) {
              newTags.push(tag)
            }
          }

          // Store updated tags
          await memoryStore.storeMemory(`file-tags-${fileId}`, newTags)

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference(`file-tags-${fileId}`, newTags)
          }
        }

        // Record in memory
        if (memoryInitialized) {
          try {
            await memoryStore.addMemory(`Added tags (${tags.join(", ")}) to ${selectedFileIds.length} files`)
          } catch (error) {
            console.warn("Failed to record tag addition in memory:", error)
          }
        }
      } catch (error) {
        console.error("Error adding tags to files:", error)
      }
    },
    [selectedFileIds, memoryStore, memoryInitialized, syncInitialized],
  )

  // Save file
  const saveFile = useCallback(async () => {
    if (!selectedFileId) return

    setIsLoading(true)
    setError(null)

    try {
      await fileService.saveFileContent(selectedFileId, fileContent)

      // Record this action in memory
      if (memoryInitialized) {
        try {
          const selectedFileInfo = files.find((file) => file.id === selectedFileId)
          if (selectedFileInfo) {
            await memoryStore.addMemory(`Saved file: ${selectedFileInfo.name}`)
          }
        } catch (error) {
          console.warn("Failed to record file saving in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    } catch (error) {
      console.error("Error saving file:", error)
      setError("Failed to save file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [selectedFileId, fileContent, fileService, files, memoryStore, memoryInitialized])

  // Add to favorites
  const addToFavorites = useCallback(
    async (fileId: string) => {
      if (favoriteFiles.includes(fileId)) return

      const updatedFavorites = [...favoriteFiles, fileId]
      setFavoriteFiles(updatedFavorites)

      if (memoryInitialized) {
        try {
          await memoryStore.storeMemory("favorites", updatedFavorites)

          const fileInfo = files.find((file) => file.id === fileId)
          if (fileInfo) {
            try {
              await memoryStore.addMemory(`Added to favorites: ${fileInfo.name}`)
            } catch (error) {
              console.warn("Failed to add memory about favorite:", error)
              // Continue anyway, this is non-critical
            }
          }

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference("favorites", updatedFavorites)
          }
        } catch (error) {
          console.warn("Failed to store favorites in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [favoriteFiles, files, memoryStore, memoryInitialized, syncInitialized],
  )

  // Remove from favorites
  const removeFromFavorites = useCallback(
    async (fileId: string) => {
      const updatedFavorites = favoriteFiles.filter((id) => id !== fileId)
      setFavoriteFiles(updatedFavorites)

      if (memoryInitialized) {
        try {
          await memoryStore.storeMemory("favorites", updatedFavorites)

          const fileInfo = files.find((file) => file.id === fileId)
          if (fileInfo) {
            try {
              await memoryStore.addMemory(`Removed from favorites: ${fileInfo.name}`)
            } catch (error) {
              console.warn("Failed to add memory about removing favorite:", error)
              // Continue anyway, this is non-critical
            }
          }

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference("favorites", updatedFavorites)
          }
        } catch (error) {
          console.warn("Failed to update favorites in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [favoriteFiles, files, memoryStore, memoryInitialized, syncInitialized],
  )

  // Add to search history
  const addToSearchHistory = useCallback(
    async (query: string) => {
      if (!query.trim() || searchHistory.includes(query)) return

      const updatedHistory = [query, ...searchHistory].slice(0, 10)
      setSearchHistory(updatedHistory)

      if (memoryInitialized) {
        try {
          await memoryStore.storeMemory("searchHistory", updatedHistory)

          try {
            await memoryStore.addMemory(`Searched for: ${query}`)
          } catch (error) {
            console.warn("Failed to add memory about search:", error)
            // Continue anyway, this is non-critical
          }

          // Sync to other devices
          if (syncInitialized) {
            await syncService.setPreference("searchHistory", updatedHistory)
          }
        } catch (error) {
          console.warn("Failed to store search history in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [searchHistory, memoryStore, memoryInitialized, syncInitialized],
  )

  // Create new text file
  const createNewTextFile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const newFileName = `new-file-${Date.now()}.md`
      const newFilePath = `${currentPath}/${newFileName}`.replace(/\/+/g, "/")

      const newFileId = await fileService.createFile(newFilePath, "# New Document\n\nStart writing here...")
      await refreshFiles()

      // Select the new file
      setSelectedFileId(newFileId as string)

      if (memoryInitialized) {
        try {
          await memoryStore.addMemory(`Created new markdown file: ${newFileName}`)
        } catch (error) {
          console.warn("Failed to record file creation in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    } catch (error) {
      console.error("Error creating file:", error)
      setError("Failed to create file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [currentPath, fileService, refreshFiles, setSelectedFileId, memoryStore, memoryInitialized])

  // Add this function to the AppProvider
  const createFileFromTemplate = useCallback(
    async (templateId: string, fileName: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const template = getTemplateById(templateId)
        if (!template) {
          throw new Error(`Template with ID ${templateId} not found`)
        }

        const filePath = `${currentPath}/${fileName}`.replace(/\/+/g, "/")
        const newFileId = await fileService.createFile(filePath, template.content)
        await refreshFiles()

        // Select the new file
        setSelectedFileId(newFileId as string)

        if (memoryInitialized) {
          try {
            await memoryStore.addMemory(`Created new file from template: ${fileName} (${template.name})`)
          } catch (error) {
            console.warn("Failed to record file creation in memory:", error)
            // Continue anyway, this is non-critical
          }
        }
      } catch (error) {
        console.error("Error creating file from template:", error)
        setError("Failed to create file. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [currentPath, fileService, refreshFiles, setSelectedFileId, memoryStore, memoryInitialized],
  )

  // Get selected file
  const selectedFile = useMemo(() => {
    return files.find((file) => file.id === selectedFileId) || null
  }, [files, selectedFileId])

  const handleSetSelectedFileId = useCallback(
    async (id: string | null) => {
      setSelectedFileId(id)

      // Record file access in recommendation engine if id is not null
      if (id) {
        const file = files.find((f) => f.id === id)
        if (file) {
          await recommendationEngine.recordFileAccess(id, file.name)
        }
      }
    },
    [files, recommendationEngine],
  )

  // Load files when currentPath changes
  useEffect(() => {
    loadFilesForPath(currentPath)
  }, [currentPath, loadFilesForPath])

  // Update the value object in the AppProvider to include shareService
  const value = {
    fileService,
    memoryStore,
    shareService,
    syncService,
    currentPath,
    files,
    selectedFileId,
    selectedFile,
    selectedFileIds,
    fileContent,
    isLoading,
    error,
    recentFiles,
    favoriteFiles,
    searchHistory,
    frequentFiles,
    suggestedFiles,
    searchQuery,
    setSearchQuery,
    setCurrentPath,
    setSelectedFileId: handleSetSelectedFileId,
    setSelectedFileIds,
    toggleFileSelection,
    clearFileSelection,
    bulkDeleteFiles,
    bulkDownloadFiles,
    bulkAddToFavorites,
    bulkRemoveFromFavorites,
    bulkAddTags,
    setFileContent,
    saveFile,
    refreshFiles,
    addToFavorites,
    removeFromFavorites,
    addToSearchHistory,
    createNewTextFile,
    loading,
    createFileFromTemplate,
    recommendationEngine,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
