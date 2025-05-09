"use client"

import { useEffect, useState } from "react"
import type React from "react"

import { useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import {
  Clock,
  Search,
  Settings,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  FileJson,
  Calendar,
} from "lucide-react"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"
import {
  storeMemoryWithMem0,
  getMemoriesFromMem0,
  searchMemoriesFromMem0,
  checkMem0ApiConnection,
} from "@/lib/mem0-integration"
import { PreferencesProvider } from "@/components/preferences-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mem0ConnectionDetails } from "@/components/mem0-connection-details"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMem0 } from "@/components/mem0-provider"
import { NetworkErrorAlert } from "@/components/network-error-alert"
import { ApiKeyErrorAlert } from "@/components/api-key-error-alert"
import { DatabaseConnectionError } from "@/components/database-connection-error"
import { useRouter } from "next/navigation"

// Mock data for fallback when all else fails
const MOCK_MEMORIES = [
  {
    id: "1",
    memory: "User uploaded file 'project-proposal.pdf' to the Documents folder",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: "file_operation",
    content: "User uploaded file 'project-proposal.pdf' to the Documents folder",
  },
  {
    id: "2",
    memory: "User created a new folder called 'Project X' in the root directory",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    type: "file_operation",
    content: "User created a new folder called 'Project X' in the root directory",
  },
  {
    id: "3",
    memory: "User searched for 'quarterly report' in the search bar",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    type: "search",
    content: "User searched for 'quarterly report' in the search bar",
  },
  {
    id: "4",
    memory: "User preference: darkMode set to true",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    type: "preference",
    content: "User preference: darkMode set to true",
  },
  {
    id: "5",
    memory: "User shared 'financial-report.xlsx' with john@example.com",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    type: "file_operation",
    content: "User shared 'financial-report.xlsx' with john@example.com",
  },
]

// Memory types for filtering
const MEMORY_TYPES = [
  { id: "file_operation", label: "File Operations", color: "blue" },
  { id: "search", label: "Search Queries", color: "purple" },
  { id: "preference", label: "User Preferences", color: "green" },
  { id: "custom", label: "Custom Memories", color: "amber" },
]

// Export format options
const EXPORT_FORMATS = [
  { id: "json", label: "JSON", description: "Standard JSON format" },
  { id: "json-pretty", label: "Pretty JSON", description: "Formatted JSON with indentation" },
  { id: "csv", label: "CSV", description: "Comma-separated values (limited fields)" },
]

// Helper function to ensure memories have content field
function normalizeMemories(memories: any[]): any[] {
  if (!memories || !Array.isArray(memories)) return MOCK_MEMORIES

  return memories.map((memory) => ({
    ...memory,
    // Ensure content field exists (use memory field if content is missing)
    content: memory.content || memory.memory || memory.text || "Unknown memory",
    // Ensure memory field exists
    memory: memory.memory || memory.content || memory.text || "Unknown memory",
    // Ensure created_at field exists
    created_at: memory.created_at || new Date().toISOString(),
    // Ensure id field exists
    id: memory.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    // Ensure type field exists
    type: memory.type || "custom",
  }))
}

export default function Mem0Page() {
  const router = useRouter()
  const {
    memories: mem0Memories,
    createMemory,
    deleteMemory,
    refreshMemories,
    isLoading: mem0IsLoading,
    error,
    apiKeyError,
    networkError,
    databaseError,
  } = useMem0()

  const [newMemoryContent, setNewMemoryContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMemories, setFilteredMemories] = useState<any[]>([])
  const [memories, setMemories] = useState<any[]>(MOCK_MEMORIES)

  // Filter memories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMemories(memories || MOCK_MEMORIES)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = (memories || MOCK_MEMORIES).filter((memory) => {
        const content = memory.content || memory.memory || ""
        const id = memory.id || ""
        return content.toLowerCase().includes(query) || id.toLowerCase().includes(query)
      })
      setFilteredMemories(filtered.length > 0 ? filtered : MOCK_MEMORIES)
    }
  }, [searchQuery, memories])

  // Handle memory creation
  const handleCreateMemory = async () => {
    if (newMemoryContent.trim()) {
      try {
        await createMemory({ content: newMemoryContent })
        setNewMemoryContent("")
        // Refresh memories after creating a new one
        fetchMemories().catch(console.error)
      } catch (error) {
        console.error("Error creating memory:", error)
        // Show toast or handle error
      }
    }
  }

  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [newMemory, setNewMemory] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { toast } = useToast()
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [memoryStats, setMemoryStats] = useState({
    total: 0,
    cloud: 0,
    local: 0,
    lastSync: null as string | null,
  })
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [dataSource, setDataSource] = useState<"api" | "database" | "mock" | "none">("mock")

  // Progress tracking states
  const [exportProgress, setExportProgress] = useState(0)
  const [exportCurrentStep, setExportCurrentStep] = useState("")
  const [exportFormat, setExportFormat] = useState("json-pretty")
  const [exportSelectedTypes, setExportSelectedTypes] = useState<string[]>(MEMORY_TYPES.map((type) => type.id))
  const [exportDateRange, setExportDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })

  const [importProgress, setImportProgress] = useState(0)
  const [importCurrentStep, setImportCurrentStep] = useState("")
  const [importTotal, setImportTotal] = useState(0)
  const [importSuccess, setImportSuccess] = useState(0)
  const [importFailed, setImportFailed] = useState(0)
  const [showImportProgress, setShowImportProgress] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [showExportProgress, setShowExportProgress] = useState(false)
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    validateBeforeImport: true,
    importMode: "merge" as "merge" | "replace" | "append",
  })

  // Refs for dialogs
  const importDialogCloseRef = useRef<HTMLButtonElement>(null)
  const exportDialogCloseRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if Mem0 API is configured
  useEffect(() => {
    const checkApiStatus = async () => {
      setApiStatus("checking")
      try {
        // Check if settings exist in localStorage
        let savedSettings = null
        try {
          const settingsStr = localStorage.getItem("mem0Settings")
          if (settingsStr) {
            savedSettings = JSON.parse(settingsStr)
          }
        } catch (localStorageError) {
          console.error("Error accessing localStorage:", localStorageError)
        }

        let apiKey, apiUrl

        if (savedSettings) {
          apiKey = savedSettings.apiKey
          apiUrl = savedSettings.apiUrl

          if (apiKey && apiUrl) {
            // Check connection with custom credentials
            try {
              const status = await checkMem0ApiConnection(apiKey, apiUrl)
              setApiStatus(status)
              return
            } catch (error) {
              console.error("Error checking API connection:", error)
            }
          }
        }

        // Check with server-side credentials
        try {
          const status = await checkMem0ApiConnection()
          setApiStatus(status)
        } catch (error) {
          console.error("Error checking API status with server credentials:", error)
          setApiStatus("disconnected")
        }
      } catch (error) {
        console.error("Error in checkApiStatus:", error)
        setApiStatus("disconnected")
      }
    }

    checkApiStatus().catch((err) => {
      console.error("Failed to check API status:", err)
      setApiStatus("disconnected")
    })
  }, [])

  // Fetch memories from the database or Mem0 API
  const fetchMemories = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      // Use our updated function that handles both API and database fallback
      let fetchedMemories: any[] = []
      let source: "api" | "database" | "mock" = "api"

      try {
        console.log("Attempting to fetch memories from Mem0 API or database")
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "get",
            userId: "default_user",
            aiFamily: "file_manager",
            limit: 50,
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories) {
            fetchedMemories = data.memories
            source = data.source === "database_fallback" ? "database" : data.source === "mock_data" ? "mock" : "api"
            console.log(`Successfully fetched ${fetchedMemories.length} memories from ${source}`)
          } else {
            throw new Error(data.error || "Failed to fetch memories from API")
          }
        } else {
          throw new Error(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Error fetching memories from API:", error)

        // Try direct database fallback
        try {
          console.log("Attempting direct database fallback")
          fetchedMemories = await getMemoriesFromMem0("default_user", "file_manager", 50)
          source = "database"
        } catch (dbError) {
          console.error("Error with direct database fallback:", dbError)
          // Use mock data as last resort
          fetchedMemories = MOCK_MEMORIES
          source = "mock"
        }
      }

      // Normalize memories to ensure they have all required fields
      const normalizedMemories = normalizeMemories(fetchedMemories)

      setMemories(normalizedMemories)
      setDataSource(source)

      // Update memory stats
      setMemoryStats({
        total: normalizedMemories.length,
        cloud: apiStatus === "connected" ? normalizedMemories.length : 0,
        local: normalizedMemories.length,
        lastSync: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error in fetchMemories:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error fetching memories")
      toast({
        title: "Error",
        description: "Failed to load memories. Using fallback data.",
        variant: "destructive",
      })

      // Use mock data as fallback
      setMemories(MOCK_MEMORIES)
      setDataSource("mock")
      setMemoryStats({
        total: MOCK_MEMORIES.length,
        cloud: 0,
        local: MOCK_MEMORIES.length,
        lastSync: null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load memories on component mount
  useEffect(() => {
    // Initial load of memories
    try {
      fetchMemories().catch((err) => {
        console.error("Error fetching memories:", err)
        // Set fallback data if fetch fails
        setMemories(MOCK_MEMORIES)
        setDataSource("mock")
      })
    } catch (error) {
      console.error("Error in initial memory load:", error)
      // Set fallback data if fetch fails
      setMemories(MOCK_MEMORIES)
      setDataSource("mock")
    }
  }, [])

  // Add a new memory
  const handleAddMemory = async () => {
    if (!newMemory.trim()) return

    setIsLoading(true)
    try {
      // Try to store memory via the API endpoint first
      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "store",
            userId: "default_user",
            aiFamily: "file_manager",
            memory: newMemory,
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        if (response.ok) {
          const data = await response.json()
          if (!data.success) {
            throw new Error(data.error || "Failed to store memory via API")
          }
        } else {
          throw new Error(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (apiError) {
        console.error("Error storing memory via API:", apiError)

        // Fallback to direct database storage
        const success = await storeMemoryWithMem0("default_user", "file_manager", newMemory)
        if (!success) {
          throw new Error("Failed to store memory in database")
        }
      }

      // Add to local state for immediate feedback
      const newMemoryObj = {
        id: Date.now().toString(),
        memory: newMemory,
        content: newMemory,
        created_at: new Date().toISOString(),
        type: "custom",
      }

      setMemories([newMemoryObj, ...memories])

      // Update memory stats
      setMemoryStats({
        ...memoryStats,
        total: memoryStats.total + 1,
        cloud: apiStatus === "connected" ? memoryStats.cloud + 1 : memoryStats.cloud,
        local: memoryStats.local + 1,
        lastSync: apiStatus === "connected" ? new Date().toISOString() : memoryStats.lastSync,
      })

      setNewMemory("")

      toast({
        title: "Success",
        description: "Memory added successfully",
      })
    } catch (error) {
      console.error("Error adding memory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add memory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Search memories
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMemories()
      return
    }

    setIsSearching(true)
    try {
      // Try to search via the API endpoint first
      try {
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "search",
            userId: "default_user",
            aiFamily: "file_manager",
            query: searchQuery,
            limit: 50,
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.memories) {
            const normalizedMemories = normalizeMemories(data.memories)
            setMemories(normalizedMemories)
            setDataSource(
              data.source === "database_fallback" ? "database" : data.source === "mock_data" ? "mock" : "api",
            )
            return
          } else {
            throw new Error(data.error || "Failed to search memories via API")
          }
        } else {
          throw new Error(`API returned status ${response.status}: ${response.statusText}`)
        }
      } catch (apiError) {
        console.error("Error searching memories via API:", apiError)

        // Fallback to direct database search
        try {
          const searchResults = await searchMemoriesFromMem0("default_user", "file_manager", searchQuery, 50)
          if (searchResults && searchResults.length > 0) {
            const normalizedResults = normalizeMemories(searchResults)
            setMemories(normalizedResults)
            setDataSource("database")
            return
          }
        } catch (dbError) {
          console.error("Error with direct database search:", dbError)
        }
      }

      // If all else fails, do a client-side search on current memories
      const filtered = (memories || MOCK_MEMORIES).filter((memory) =>
        (memory.memory || memory.content || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (filtered.length > 0) {
        setMemories(filtered)
      } else {
        // If no results, filter mock data as last resort
        const filteredMock = MOCK_MEMORIES.filter((memory) =>
          memory.memory.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setMemories(filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES)
      }

      setDataSource("mock")
    } catch (error) {
      console.error("Error searching memories:", error)
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      })

      // Fallback to client-side search
      const filtered = (memories || MOCK_MEMORIES).filter((memory) =>
        (memory.memory || memory.content || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (filtered.length > 0) {
        setMemories(filtered)
      } else {
        // If no results, filter mock data as last resort
        const filteredMock = MOCK_MEMORIES.filter((memory) =>
          memory.memory.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setMemories(filteredMock.length > 0 ? filteredMock : MOCK_MEMORIES)
      }

      setDataSource("mock")
    } finally {
      setIsSearching(false)
    }
  }

  // Filter memories by type
  const handleToggleMemoryType = (type: string) => {
    if (exportSelectedTypes.includes(type)) {
      setExportSelectedTypes(exportSelectedTypes.filter((t) => t !== type))
    } else {
      setExportSelectedTypes([...exportSelectedTypes, type])
    }
  }

  // Export memories to file with progress tracking
  const handleExportMemories = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setShowExportProgress(true)
    setExportCurrentStep("Initializing export...")

    try {
      // Validate we have memories to export
      if (!memories || memories.length === 0) {
        throw new Error("No memories to export")
      }

      // Filter memories by selected types
      setExportCurrentStep("Filtering memories by type...")
      setExportProgress(10)
      await new Promise((resolve) => setTimeout(resolve, 200))

      let memoriesToExport = memories

      if (exportSelectedTypes.length < MEMORY_TYPES.length) {
        memoriesToExport = memories.filter((memory) => exportSelectedTypes.includes(memory.type || "custom"))
      }

      // Filter by date range if specified
      if (exportDateRange.start || exportDateRange.end) {
        setExportCurrentStep("Filtering memories by date range...")
        setExportProgress(20)
        await new Promise((resolve) => setTimeout(resolve, 200))

        const startDate = exportDateRange.start ? new Date(exportDateRange.start) : new Date(0)
        const endDate = exportDateRange.end ? new Date(exportDateRange.end) : new Date()

        memoriesToExport = memoriesToExport.filter((memory) => {
          const memoryDate = new Date(memory.created_at)
          return memoryDate >= startDate && memoryDate <= endDate
        })
      }

      if (memoriesToExport.length === 0) {
        throw new Error("No memories match the selected filters")
      }

      // Format memories for export
      setExportCurrentStep("Formatting export data...")
      setExportProgress(30)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Format memories for export (add metadata)
      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        source: dataSource,
        total_memories: memoriesToExport.length,
        filters: {
          types: exportSelectedTypes,
          date_range: exportDateRange,
        },
        memories: memoriesToExport,
      }

      setExportCurrentStep("Preparing file for download...")
      setExportProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Create the export content based on selected format
      let exportContent: string
      let mimeType: string
      let fileExtension: string

      switch (exportFormat) {
        case "json":
          exportContent = JSON.stringify(exportData)
          mimeType = "application/json"
          fileExtension = "json"
          break
        case "json-pretty":
          exportContent = JSON.stringify(exportData, null, 2)
          mimeType = "application/json"
          fileExtension = "json"
          break
        case "csv":
          // Simple CSV conversion - headers row followed by data rows
          const headers = ["id", "memory", "created_at", "type"]
          const rows = memoriesToExport.map((memory) =>
            headers
              .map(
                (header) =>
                  // Escape quotes in CSV fields
                  `"${String(memory[header] || "").replace(/"/g, '""')}"`,
              )
              .join(","),
          )
          exportContent = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n")
          mimeType = "text/csv"
          fileExtension = "csv"
          break
        default:
          exportContent = JSON.stringify(exportData, null, 2)
          mimeType = "application/json"
          fileExtension = "json"
      }

      setExportCurrentStep("Creating download file...")
      setExportProgress(70)
      await new Promise((resolve) => setTimeout(resolve, 200))

      const blob = new Blob([exportContent], { type: mimeType })
      const url = URL.createObjectURL(blob)

      setExportCurrentStep("Initiating download...")
      setExportProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `mem0-export-${new Date().toISOString().split("T")[0]}.${fileExtension}`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportCurrentStep("Export complete!")
      setExportProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Export Successful",
        description: `Successfully exported ${memoriesToExport.length} memories to ${fileExtension.toUpperCase()} file`,
      })

      // Close the dialog after a short delay
      setTimeout(() => {
        if (exportDialogCloseRef.current) {
          exportDialogCloseRef.current.click()
        }
        setShowExportProgress(false)
      }, 1000)
    } catch (error) {
      console.error("Error exporting memories:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export memories",
        variant: "destructive",
      })
      setShowExportProgress(false)
    } finally {
      setIsExporting(false)
    }
  }

  // Prepare for import
  const handlePrepareImport = () => {
    // Reset import states
    setImportProgress(0)
    setImportCurrentStep("")
    setImportTotal(0)
    setImportSuccess(0)
    setImportFailed(0)
    setImportErrors([])
    setShowImportProgress(false)

    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Import memories from JSON file with progress tracking
  const handleImportMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true)
    setImportProgress(0)
    setImportCurrentStep("Initializing import...")
    setImportTotal(0)
    setImportSuccess(0)
    setImportFailed(0)
    setImportErrors([])
    setShowImportProgress(true)

    try {
      const file = event.target.files?.[0]
      if (!file) {
        throw new Error("No file selected")
      }

      // Validate file type
      setImportCurrentStep("Validating file format...")
      setImportProgress(5)

      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (!["json", "csv"].includes(fileExtension || "")) {
        throw new Error(`Invalid file format: ${fileExtension}. Please select a JSON or CSV file.`)
      }

      // Update progress
      setImportProgress(10)

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          setImportCurrentStep("Parsing file contents...")
          setImportProgress(20)

          // Parse the file content based on file type
          let memoriesToImport: any[] = []

          if (fileExtension === "json") {
            // Parse JSON
            try {
              const importedData = JSON.parse(content)

              // Determine the structure of the imported data
              if (Array.isArray(importedData)) {
                // Simple array format
                memoriesToImport = importedData
              } else if (importedData.memories && Array.isArray(importedData.memories)) {
                // Structured format with metadata
                memoriesToImport = importedData.memories
              } else {
                throw new Error("Invalid JSON structure. Could not find memories array.")
              }
            } catch (parseError) {
              throw new Error("Invalid JSON format. The file could not be parsed.")
            }
          } else if (fileExtension === "csv") {
            // Parse CSV
            try {
              // Split by lines and handle quoted fields
              const lines = content.split(/\r?\n/)
              if (lines.length < 2) {
                throw new Error("CSV file must contain at least a header row and one data row.")
              }

              // Parse header row
              const headers = parseCSVLine(lines[0])

              // Ensure required fields exist
              if (!headers.includes("memory")) {
                throw new Error("CSV must contain a 'memory' column.")
              }

              // Parse data rows
              for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue // Skip empty lines

                const values = parseCSVLine(lines[i])
                if (values.length !== headers.length) {
                  throw new Error(`Line ${i + 1} has ${values.length} fields but should have ${headers.length}.`)
                }

                // Create memory object from CSV row
                const memory: Record<string, any> = {}
                headers.forEach((header, index) => {
                  memory[header] = values[index]
                })

                // Ensure required fields
                if (!memory.memory) {
                  throw new Error(`Line ${i + 1} is missing required 'memory' content.`)
                }

                // Add default values if missing
                if (!memory.id) memory.id = `import-${Date.now()}-${i}`
                if (!memory.created_at) memory.created_at = new Date().toISOString()
                if (!memory.type) memory.type = "custom"

                memoriesToImport.push(memory)
              }
            } catch (csvError) {
              throw new Error(`CSV parsing error: ${csvError instanceof Error ? csvError.message : String(csvError)}`)
            }
          }

          if (memoriesToImport.length === 0) {
            throw new Error("No valid memories found in the import file.")
          }

          setImportCurrentStep("Validating memory data...")
          setImportProgress(30)
          setImportTotal(memoriesToImport.length)

          // Validate memory data if option is enabled
          if (importOptions.validateBeforeImport) {
            const invalidMemories = memoriesToImport.filter(
              (memory) => !memory.memory || typeof memory.memory !== "string",
            )

            if (invalidMemories.length > 0) {
              throw new Error(`Found ${invalidMemories.length} invalid memories without proper content.`)
            }
          }

          // Handle import mode
          if (importOptions.importMode === "replace") {
            setImportCurrentStep("Clearing existing memories...")
            setImportProgress(40)

            // In a real implementation, this would clear all existing memories
            // For now, we'll just simulate it
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          // Process each memory with progress tracking
          setImportCurrentStep("Importing memories...")
          setImportProgress(50)

          const errors: string[] = []
          let successCount = 0
          let failedCount = 0

          // Check for duplicates if option is enabled
          const existingMemoryTexts = new Set()
          if (importOptions.skipDuplicates) {
            memories.forEach((memory) => {
              existingMemoryTexts.add(memory.memory)
            })
          }

          for (let i = 0; i < memoriesToImport.length; i++) {
            const memory = memoriesToImport[i]
            const memoryText = memory.memory || memory.text || memory.content

            if (!memoryText) {
              errors.push(`Memory at index ${i} has no content`)
              failedCount++
              continue
            }

            // Skip duplicates if option is enabled
            if (importOptions.skipDuplicates && existingMemoryTexts.has(memoryText)) {
              errors.push(`Skipped duplicate memory: ${memoryText.substring(0, 30)}...`)
              failedCount++
              continue
            }

            try {
              const success = await storeMemoryWithMem0("default_user", "file_manager", memoryText)
              if (success) {
                successCount++
                if (importOptions.skipDuplicates) {
                  existingMemoryTexts.add(memoryText)
                }
              } else {
                failedCount++
                errors.push(`Failed to store memory: ${memoryText.substring(0, 30)}...`)
              }
            } catch (memoryError) {
              failedCount++
              errors.push(
                `Error storing memory: ${memoryError instanceof Error ? memoryError.message : "Unknown error"}`,
              )
            }

            // Update progress
            setImportSuccess(successCount)
            setImportFailed(failedCount)
            setImportErrors(errors)
            setImportProgress(50 + Math.floor(((i + 1) / memoriesToImport.length) * 40))
          }

          // Final progress update
          setImportCurrentStep("Finalizing import...")
          setImportProgress(90)

          // Refresh memories to show the imported ones
          await fetchMemories()

          setImportCurrentStep("Import complete!")
          setImportProgress(100)

          // Show appropriate toast based on results
          if (failedCount === 0) {
            toast({
              title: "Import Successful",
              description: `Successfully imported ${successCount} memories`,
            })
          } else if (successCount > 0) {
            toast({
              title: "Import Partially Successful",
              description: `Imported ${successCount} memories, ${failedCount} failed`,
              variant: "warning",
            })
          } else {
            toast({
              title: "Import Failed",
              description: "Failed to import any memories",
              variant: "destructive",
            })
          }

          // Keep the dialog open if there were errors
          if (failedCount === 0) {
            // Close the dialog after a short delay
            setTimeout(() => {
              if (importDialogCloseRef.current) {
                importDialogCloseRef.current.click()
              }
              setShowImportProgress(false)
            }, 1000)
          }
        } catch (error) {
          console.error("Error processing imported file:", error)
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Unknown error during import",
            variant: "destructive",
          })
          setShowImportProgress(false)
        } finally {
          setIsImporting(false)
        }
      }

      reader.onerror = () => {
        console.error("Error reading file:", reader.error)
        toast({
          title: "Import Failed",
          description: "Error reading the file",
          variant: "destructive",
        })
        setIsImporting(false)
        setShowImportProgress(false)
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Error importing memories:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
      setIsImporting(false)
      setShowImportProgress(false)
    }
  }

  // Helper function to parse CSV lines
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let inQuotes = false
    let currentValue = ""

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = i < line.length - 1 ? line[i + 1] : null

      if (char === '"' && !inQuotes) {
        // Start of quoted field
        inQuotes = true
      } else if (char === '"' && nextChar === '"') {
        // Escaped quote inside quoted field
        currentValue += '"'
        i++ // Skip the next quote
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(currentValue)
        currentValue = ""
      } else {
        // Regular character
        currentValue += char
      }
    }

    // Add the last field
    result.push(currentValue)
    return result
  }

  // Clear all memories (placeholder function)
  const handleClearMemories = () => {
    setIsClearing(true)
    // In a real implementation, this would clear memories from the database
    // For now, we'll just clear the local state
    setMemories([])
    setMemoryStats({
      total: 0,
      cloud: 0,
      local: 0,
      lastSync: null,
    })
    toast({
      title: "Memories Cleared",
      description: "All local memories have been cleared",
    })
    setIsClearing(false)
  }

  // Get badge for memory type
  const getMemoryTypeBadge = (type: string) => {
    switch (type) {
      case "file_operation":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            File Operation
          </Badge>
        )
      case "search":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
            Search
          </Badge>
        )
      case "preference":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            Preference
          </Badge>
        )
      case "custom":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Custom
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Get badge for data source
  const getDataSourceBadge = () => {
    switch (dataSource) {
      case "api":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            API Source
          </Badge>
        )
      case "database":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            Database Source
          </Badge>
        )
      case "mock":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Mock Data
          </Badge>
        )
      default:
        return null
    }
  }

  const handleCreateMemoryOld = async () => {
    if (!newMemoryContent.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          memory: {
            content: newMemoryContent,
            metadata: {
              source: "user-created",
              timestamp: new Date().toISOString(),
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create memory")
      }

      setNewMemoryContent("")
      refreshMemories()
    } catch (error) {
      console.error("Error creating memory:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <PreferencesProvider>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Mem0 Integration</h1>
            <p className="text-lg text-muted-foreground">Long-term memory capabilities for your File Manager</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMemories} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild variant="outline">
              <Link href="/mem0/settings">
                <Settings className="mr-2 h-4 w-4" />
                Mem0 Settings
              </Link>
            </Button>
          </div>
        </div>

        {apiKeyError && <ApiKeyErrorAlert onDismiss={() => router.push("/mem0/settings")} />}

        {networkError && <NetworkErrorAlert onDismiss={fetchMemories} />}

        {databaseError && <DatabaseConnectionError onDismiss={fetchMemories} />}

        {apiStatus === "disconnected" && (
          <Alert className="mb-6" variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Mem0 API Disconnected</AlertTitle>
            <AlertDescription>
              The application is currently using local database storage. Configure your Mem0 API connection in settings
              for cloud storage.
            </AlertDescription>
          </Alert>
        )}

        {hasError && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Memories</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                "There was an error loading memories from the API or database. Using fallback data for display."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Mem0ConnectionDetails />
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Memory Management</CardTitle>
                <CardDescription>Export, import, and clear memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export Memories Button and Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      disabled={memories.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Memories
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Export Memories</DialogTitle>
                      <DialogDescription>
                        {showExportProgress
                          ? "Preparing your memories for export..."
                          : `Export ${memories.length} memories to a file`}
                      </DialogDescription>
                    </DialogHeader>

                    {showExportProgress ? (
                      <div className="py-4 space-y-4">
                        <Progress value={exportProgress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{exportCurrentStep}</span>
                          <span className="font-medium">{exportProgress}%</span>
                        </div>

                        {exportProgress === 100 && (
                          <div className="flex items-center justify-center text-green-600 mt-2">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            <span>Export completed successfully!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Export Format</h4>
                            <RadioGroup
                              value={exportFormat}
                              onValueChange={setExportFormat}
                              className="flex flex-col space-y-1"
                            >
                              {EXPORT_FORMATS.map((format) => (
                                <div key={format.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={format.id} id={`format-${format.id}`} />
                                  <Label htmlFor={`format-${format.id}`} className="flex flex-col">
                                    <span>{format.label}</span>
                                    <span className="text-xs text-muted-foreground">{format.description}</span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Memory Types</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {MEMORY_TYPES.map((type) => (
                                <div key={type.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`type-${type.id}`}
                                    checked={exportSelectedTypes.includes(type.id)}
                                    onCheckedChange={() => handleToggleMemoryType(type.id)}
                                  />
                                  <Label
                                    htmlFor={`type-${type.id}`}
                                    className={`text-${type.color}-700 dark:text-${type.color}-300`}
                                  >
                                    {type.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Date Range (Optional)</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label htmlFor="start-date">Start Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="start-date"
                                    type="date"
                                    className="pl-8"
                                    value={exportDateRange.start || ""}
                                    onChange={(e) =>
                                      setExportDateRange({ ...exportDateRange, start: e.target.value || null })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="end-date">End Date</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="end-date"
                                    type="date"
                                    className="pl-8"
                                    value={exportDateRange.end || ""}
                                    onChange={(e) =>
                                      setExportDateRange({ ...exportDateRange, end: e.target.value || null })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-sm">
                          <FileJson className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {exportSelectedTypes.length === MEMORY_TYPES.length
                              ? `Exporting all ${memories.length} memories`
                              : `Filtered export (${exportSelectedTypes.length} types selected)`}
                          </span>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" ref={exportDialogCloseRef}>
                          {exportProgress === 100 ? "Close" : "Cancel"}
                        </Button>
                      </DialogClose>
                      {!showExportProgress && (
                        <Button
                          onClick={handleExportMemories}
                          disabled={isExporting || memories.length === 0 || exportSelectedTypes.length === 0}
                        >
                          {isExporting ? "Exporting..." : "Export"}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Import Memories Button and Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Memories
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Memories</DialogTitle>
                      <DialogDescription>
                        {showImportProgress ? "Importing your memories..." : "Import memories from a file"}
                      </DialogDescription>
                    </DialogHeader>

                    {showImportProgress ? (
                      <div className="py-4 space-y-4">
                        <Progress value={importProgress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{importCurrentStep}</span>
                          <span className="font-medium">{importProgress}%</span>
                        </div>

                        {importTotal > 0 && (
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center text-sm">
                              <span>Total memories:</span>
                              <Badge variant="outline">{importTotal}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Successfully imported:</span>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              >
                                {importSuccess}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span>Failed to import:</span>
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                              >
                                {importFailed}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {importErrors.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Errors:</p>
                            <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {importErrors.map((error, index) => (
                                  <li key={index} className="text-red-500">
                                    • {error}
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Import Options</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="skip-duplicates"
                                  checked={importOptions.skipDuplicates}
                                  onCheckedChange={(checked) =>
                                    setImportOptions({ ...importOptions, skipDuplicates: !!checked })
                                  }
                                />
                                <Label htmlFor="skip-duplicates">Skip duplicate memories</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="validate-import"
                                  checked={importOptions.validateBeforeImport}
                                  onCheckedChange={(checked) =>
                                    setImportOptions({ ...importOptions, validateBeforeImport: !!checked })
                                  }
                                />
                                <Label htmlFor="validate-import">Validate before importing</Label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Import Mode</h4>
                            <RadioGroup
                              value={importOptions.importMode}
                              onValueChange={(value) =>
                                setImportOptions({
                                  ...importOptions,
                                  importMode: value as "merge" | "replace" | "append",
                                })
                              }
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="merge" id="mode-merge" />
                                <Label htmlFor="mode-merge" className="flex flex-col">
                                  <span>Merge</span>
                                  <span className="text-xs text-muted-foreground">
                                    Add new memories and update existing ones
                                  </span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="append" id="mode-append" />
                                <Label htmlFor="mode-append" className="flex flex-col">
                                  <span>Append</span>
                                  <span className="text-xs text-muted-foreground">
                                    Add new memories without updating existing ones
                                  </span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="replace" id="mode-replace" />
                                <Label htmlFor="mode-replace" className="flex flex-col">
                                  <span>Replace</span>
                                  <span className="text-xs text-muted-foreground">
                                    Clear existing memories and import new ones
                                  </span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="relative">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,.csv"
                            onChange={handleImportMemories}
                            disabled={isImporting}
                            className="hidden"
                          />
                          <Button onClick={handlePrepareImport} className="w-full" disabled={isImporting}>
                            <Upload className="mr-2 h-4 w-4" />
                            Select File to Import
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">Supported formats: JSON, CSV</p>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" ref={importDialogCloseRef}>
                          {importErrors.length > 0 ? "Close" : "Cancel"}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full flex items-center justify-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Memories
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Memories</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to clear all memories? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleClearMemories} disabled={isClearing}>
                        {isClearing ? "Clearing..." : "Clear All Memories"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Add New Memory</CardTitle>
                <CardDescription>Manually add a memory to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter a new memory..."
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleCreateMemory}
                  disabled={isLoading || !newMemoryContent.trim()}
                >
                  Add Memory
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Memory Overview</TabsTrigger>
                <TabsTrigger value="search">Search Memories</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Memory Timeline</CardTitle>
                      <CardDescription>A chronological history of user interactions and preferences</CardDescription>
                    </div>
                    {getDataSourceBadge()}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">Loading memories...</p>
                        </div>
                      ) : memories.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">No memories found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {memories.map((memory) => (
                            <div key={memory.id} className="rounded-lg border p-4">
                              <div className="flex justify-between items-start mb-2">
                                <SimpleMarkdownRenderer content={memory.content || memory.memory} />
                                {getMemoryTypeBadge(memory.type)}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(memory.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="search">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Search Memories</CardTitle>
                      <CardDescription>Find specific memories based on keywords</CardDescription>
                    </div>
                    {getDataSourceBadge()}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Search memories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        <Search className="h-4 w-4 mr-2" />
                        {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>

                    <ScrollArea className="h-[440px] pr-4">
                      {isSearching ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">Searching memories...</p>
                        </div>
                      ) : memories.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">
                            {searchQuery ? "No matching memories found" : "No memories found"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {memories.map((memory) => (
                            <div key={memory.id} className="rounded-lg border p-4">
                              <div className="flex justify-between items-start mb-2">
                                <SimpleMarkdownRenderer content={memory.content || memory.memory} />
                                {getMemoryTypeBadge(memory.type)}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(memory.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PreferencesProvider>
  )
}
