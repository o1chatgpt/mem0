"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"
import { useSupabase } from "./supabase-context"
import { supabase } from "./supabase-client"
import { config } from "./config"
import { type FileService, FileServiceImpl, type FileInfo } from "./file-service"
import { MemoryStore } from "./memory-store"
// Add this import at the top
import { vectorStore } from "./vector-store"
// Add this import at the top of the file
import { smartMemoryService } from "./smart-memory-service"

// Add vectorStore to the AppContextType interface
interface AppContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  loadingMessage: string
  setLoadingMessage: (message: string) => void
  currentPath: string
  setCurrentPath: (path: string) => void
  selectedFileId: string | null
  selectedFile: FileInfo | null
  fileContent: string
  error: string | null
  recentFiles: FileInfo[]
  favoriteFiles: string[]
  searchHistory: string[]
  frequentFiles: FileInfo[]
  suggestedFiles: FileInfo[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  setSelectedFileId: (id: string | null) => void
  setFileContent: (content: string) => void
  saveFile: () => Promise<void>
  refreshFiles: () => Promise<void>
  addToFavorites: (fileId: string) => void
  removeFromFavorites: (fileId: string) => void
  addToSearchHistory: (query: string) => void
  createNewTextFile: () => void
  loading: boolean
  // ... existing properties
  vectorStore: typeof vectorStore
  // ... existing properties
  fileService: FileService
  memoryStore: MemoryStore
  files: FileInfo[]
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  refreshTrigger: number
  // ... existing properties
  smartMemoryService: typeof smartMemoryService
  // ... existing properties
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const fileService = useMemo(() => new FileServiceImpl(), [])
  const memoryStore = useMemo(() => new MemoryStore("default-user"), [])

  const [files, setFiles] = useState<FileInfo[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")
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
  const [loading, setLoading] = useState(true)

  // Reset selected file when path changes
  useEffect(() => {
    setSelectedFile(null)
  }, [currentPath])

  // Initialize Supabase storage bucket if needed
  useEffect(() => {
    const initializeStorage = async () => {
      if (user) {
        try {
          // Check if the user's bucket exists, create if not
          const { data: buckets } = await supabase.storage.listBuckets()
          const userBucket = `user_${user.id}`

          if (!buckets?.find((b) => b.name === userBucket)) {
            await supabase.storage.createBucket(userBucket, {
              public: false,
              fileSizeLimit: config.maxUploadSize,
            })
          }
        } catch (error) {
          console.error("Error initializing storage:", error)
        }
      }
    }

    initializeStorage()
  }, [user])

  // Initialize memory store
  useEffect(() => {
    const initMemory = async () => {
      setLoading(true)
      try {
        await memoryStore.initialize()
        setMemoryInitialized(true)
      } catch (error) {
        console.error("Error initializing memory store:", error)
        // Continue anyway, as we have fallback behavior
        setMemoryInitialized(true)
      } finally {
        setLoading(false)
      }
    }

    initMemory()
  }, [memoryStore])

  // Load favorites and search history from memory
  useEffect(() => {
    if (!memoryInitialized) return

    const loadMemoryData = async () => {
      // Wrap the entire function in a try-catch to prevent any errors from stopping execution
      try {
        // Load favorites with error handling
        try {
          const storedFavorites = await memoryStore.retrieveMemory<string[]>("favorites")
          if (storedFavorites && Array.isArray(storedFavorites)) {
            setFavoriteFiles(storedFavorites)
          } else {
            // If we get null or not an array, initialize with empty array
            setFavoriteFiles([])
          }
        } catch (error) {
          console.error("Error loading favorites:", error)
          // Continue with empty favorites
          setFavoriteFiles([])
        }

        // Load search history with error handling
        try {
          const storedSearchHistory = await memoryStore.retrieveMemory<string[]>("searchHistory")
          if (storedSearchHistory && Array.isArray(storedSearchHistory)) {
            setSearchHistory(storedSearchHistory)
          } else {
            // If we get null or not an array, initialize with empty array
            setSearchHistory([])
          }
        } catch (error) {
          console.error("Error loading search history:", error)
          // Continue with empty search history
          setSearchHistory([])
        }

        // Load recent files with error handling
        try {
          const storedRecentFiles = await memoryStore.retrieveMemory<FileInfo[]>("recentFiles")
          if (storedRecentFiles && Array.isArray(storedRecentFiles)) {
            setRecentFiles(storedRecentFiles)
          } else {
            // If we get null or not an array, initialize with empty array
            setRecentFiles([])
          }
        } catch (error) {
          console.error("Error loading recent files:", error)
          // Continue with empty recent files
          setRecentFiles([])
        }
      } catch (error) {
        console.error("Error loading memory data:", error)
        // Initialize all with empty arrays as a fallback
        setFavoriteFiles([])
        setSearchHistory([])
        setRecentFiles([])
      }
    }

    loadMemoryData()
  }, [memoryStore, memoryInitialized])

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
    [fileService, memoryStore, memoryInitialized],
  )

  // Load files when path changes
  useEffect(() => {
    loadFilesForPath(currentPath)
  }, [currentPath, loadFilesForPath])

  // Load file content when selected file changes
  useEffect(() => {
    const loadFileContent = async () => {
      if (!selectedFileId) {
        setFileContent("")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const selectedFileInfo = files.find((file) => file.id === selectedFileId)

        if (!selectedFileInfo) {
          throw new Error("File not found")
        }

        if (selectedFileInfo.type === "directory") {
          setFileContent("")
          setCurrentPath(selectedFileInfo.path)
          return
        }

        const content = await fileService.getFileContent(selectedFileId)
        setFileContent(content)

        // Add to recent files
        if (memoryInitialized) {
          try {
            const updatedRecentFiles = [
              selectedFileInfo,
              ...recentFiles.filter((file) => file.id !== selectedFileId),
            ].slice(0, 10)

            setRecentFiles(updatedRecentFiles)
            await memoryStore.storeMemory("recentFiles", updatedRecentFiles)
            await memoryStore.addMemory(`Opened file: ${selectedFileInfo.name}`)
          } catch (error) {
            console.warn("Failed to record file opening in memory:", error)
            // Continue anyway, this is non-critical
          }
        }
      } catch (error) {
        console.error("Error loading file content:", error)
        setError("Failed to load file content. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadFileContent()
  }, [selectedFileId, files, fileService, recentFiles, memoryStore, setCurrentPath, memoryInitialized])

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

  // Refresh files
  const refreshFiles = useCallback(async () => {
    await loadFilesForPath(currentPath)
  }, [currentPath, loadFilesForPath])

  const refreshFilesInternal = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

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
            await memoryStore.addMemory(`Added to favorites: ${fileInfo.name}`)
          }
        } catch (error) {
          console.warn("Failed to store favorites in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [favoriteFiles, files, memoryStore, memoryInitialized],
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
            await memoryStore.addMemory(`Removed from favorites: ${fileInfo.name}`)
          }
        } catch (error) {
          console.warn("Failed to update favorites in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [favoriteFiles, files, memoryStore, memoryInitialized],
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
          await memoryStore.addMemory(`Searched for: ${query}`)
        } catch (error) {
          console.warn("Failed to store search history in memory:", error)
          // Continue anyway, this is non-critical
        }
      }
    },
    [searchHistory, memoryStore, memoryInitialized],
  )

  // Create new text file
  const createNewTextFile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const newFileName = `new-file-${Date.now()}.txt`
      const newFilePath = `${currentPath}/${newFileName}`.replace(/\/+/g, "/")

      const newFileId = await fileService.createFile(newFilePath, "")
      await refreshFiles()

      // Select the new file
      setSelectedFileId(newFileId as string)

      if (memoryInitialized) {
        try {
          await memoryStore.addMemory(`Created new file: ${newFileName}`)
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
  }, [currentPath, fileService, refreshFiles, memoryStore, memoryInitialized])

  // Get selected file
  const selectedFileInternal = useMemo(() => {
    return files.find((file) => file.id === selectedFileId) || null
  }, [files, selectedFileId])

  // Update the context value to include these new states
  const value = {
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    currentPath,
    setCurrentPath,
    selectedFileId,
    selectedFile: selectedFileInternal,
    fileContent,
    error,
    recentFiles,
    favoriteFiles,
    searchHistory,
    frequentFiles,
    suggestedFiles,
    searchQuery,
    setSearchQuery,
    setSelectedFileId,
    setFileContent,
    saveFile,
    refreshFiles,
    addToFavorites,
    removeFromFavorites,
    addToSearchHistory,
    createNewTextFile,
    loading,
    // ... existing properties
    vectorStore,
    // ... existing properties
    fileService,
    memoryStore,
    files,
    selectedFile,
    setSelectedFile,
    refreshTrigger,
    // ... existing properties
    smartMemoryService,
    // ... existing properties
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
