"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Search, Settings, Download, Upload, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
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

// Mock data for fallback when all else fails
const MOCK_MEMORIES = [
  {
    id: "1",
    memory: "User uploaded file 'project-proposal.pdf' to the Documents folder",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: "file_operation",
  },
  {
    id: "2",
    memory: "User created a new folder called 'Project X' in the root directory",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    type: "file_operation",
  },
  {
    id: "3",
    memory: "User searched for 'quarterly report' in the search bar",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    type: "search",
  },
  {
    id: "4",
    memory: "User preference: darkMode set to true",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    type: "preference",
  },
  {
    id: "5",
    memory: "User shared 'financial-report.xlsx' with john@example.com",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    type: "file_operation",
  },
]

export default function Mem0Page() {
  const [activeTab, setActiveTab] = useState("overview")
  const [memories, setMemories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
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
  const [dataSource, setDataSource] = useState<"api" | "database" | "mock" | "none">("none")

  // Progress tracking states
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [importSuccess, setImportSuccess] = useState(0)
  const [importFailed, setImportFailed] = useState(0)
  const [showImportProgress, setShowImportProgress] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [showExportProgress, setShowExportProgress] = useState(false)

  // Refs for dialogs
  const importDialogCloseRef = useRef<HTMLButtonElement>(null)
  const exportDialogCloseRef = useRef<HTMLButtonElement>(null)

  // Check if Mem0 API is configured
  useEffect(() => {
    const checkApiStatus = async () => {
      setApiStatus("checking")
      try {
        // Check if settings exist in localStorage
        const savedSettings = localStorage.getItem("mem0Settings")
        let apiKey, apiUrl

        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          apiKey = settings.apiKey
          apiUrl = settings.apiUrl

          if (apiKey && apiUrl) {
            // Check connection with custom credentials
            const status = await checkMem0ApiConnection(apiKey, apiUrl)
            setApiStatus(status)
            return
          }
        }

        // Check with server-side credentials
        const status = await checkMem0ApiConnection()
        setApiStatus(status)
      } catch (error) {
        console.error("Error checking API status:", error)
        setApiStatus("disconnected")
      }
    }

    checkApiStatus()
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
            source = data.source === "database_fallback" ? "database" : "api"
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
          throw error // Re-throw the original error
        }
      }

      if (fetchedMemories && fetchedMemories.length > 0) {
        setMemories(fetchedMemories)
        setDataSource(source)

        // Update memory stats
        setMemoryStats({
          total: fetchedMemories.length,
          cloud: apiStatus === "connected" ? fetchedMemories.length : 0,
          local: fetchedMemories.length,
          lastSync: new Date().toISOString(),
        })
      } else {
        console.log("No memories found or error occurred, using mock data")
        // If no memories found, use mock data for demonstration
        setMemories(MOCK_MEMORIES)
        setDataSource("mock")

        // Update memory stats with mock data
        setMemoryStats({
          total: MOCK_MEMORIES.length,
          cloud: apiStatus === "connected" ? MOCK_MEMORIES.length : 0,
          local: MOCK_MEMORIES.length,
          lastSync: apiStatus === "connected" ? new Date().toISOString() : null,
        })
      }
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
    fetchMemories()
  }, [apiStatus])

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
      setMemories([
        {
          id: Date.now().toString(),
          memory: newMemory,
          created_at: new Date().toISOString(),
          type: "custom",
        },
        ...memories,
      ])

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
            setMemories(data.memories)
            setDataSource(data.source === "database_fallback" ? "database" : "api")
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
        const searchResults = await searchMemoriesFromMem0("default_user", "file_manager", searchQuery, 50)
        if (searchResults && searchResults.length > 0) {
          setMemories(searchResults)
          setDataSource("database")
          return
        }
      }

      // If all else fails, do a client-side search on current memories
      const filtered = memories.filter((memory) => memory.memory.toLowerCase().includes(searchQuery.toLowerCase()))
      setMemories(filtered)
      setDataSource("mock")
    } catch (error) {
      console.error("Error searching memories:", error)
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      })

      // Fallback to client-side search
      const filtered = memories.filter((memory) => memory.memory.toLowerCase().includes(searchQuery.toLowerCase()))
      setMemories(filtered)
      setDataSource("mock")
    } finally {
      setIsSearching(false)
    }
  }

  // Export memories to JSON file with progress tracking
  const handleExportMemories = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setShowExportProgress(true)

    try {
      // Validate we have memories to export
      if (memories.length === 0) {
        throw new Error("No memories to export")
      }

      // Simulate progress steps
      setExportProgress(10)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Format memories for export (add metadata)
      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        source: dataSource,
        total_memories: memories.length,
        memories: memories,
      }

      setExportProgress(30)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Create a JSON blob with the memories
      const memoryData = JSON.stringify(exportData, null, 2)

      setExportProgress(60)
      await new Promise((resolve) => setTimeout(resolve, 200))

      const blob = new Blob([memoryData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      setExportProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `mem0-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Export Successful",
        description: `Successfully exported ${memories.length} memories to JSON file`,
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

  // Import memories from JSON file with progress tracking
  const handleImportMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true)
    setImportProgress(0)
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
      if (!file.name.endsWith(".json")) {
        throw new Error("Invalid file format. Please select a JSON file.")
      }

      // Update progress
      setImportProgress(10)

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string

          // Validate JSON format
          let importedData
          try {
            importedData = JSON.parse(content)
            setImportProgress(20)
          } catch (parseError) {
            throw new Error("Invalid JSON format. The file could not be parsed.")
          }

          // Validate data structure
          let memoriesToImport = []

          if (Array.isArray(importedData)) {
            // Simple array format
            memoriesToImport = importedData
          } else if (importedData.memories && Array.isArray(importedData.memories)) {
            // Structured format with metadata
            memoriesToImport = importedData.memories
          } else {
            throw new Error("Invalid data structure. Could not find memories array.")
          }

          if (memoriesToImport.length === 0) {
            throw new Error("No memories found in the import file.")
          }

          setImportTotal(memoriesToImport.length)
          setImportProgress(30)

          // Process each memory with progress tracking
          const errors: string[] = []
          let successCount = 0
          let failedCount = 0

          for (let i = 0; i < memoriesToImport.length; i++) {
            const memory = memoriesToImport[i]
            const memoryText = memory.memory || memory.text || memory.content

            if (!memoryText) {
              errors.push(`Memory at index ${i} has no content`)
              failedCount++
              continue
            }

            try {
              const success = await storeMemoryWithMem0("default_user", "file_manager", memoryText)
              if (success) {
                successCount++
              } else {
                failedCount++
                errors.push(`Failed to store memory: ${memoryText.substring(0, 50)}...`)
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
            setImportProgress(30 + Math.floor(((i + 1) / memoriesToImport.length) * 60))
          }

          // Final progress update
          setImportProgress(90)

          // Refresh memories to show the imported ones
          await fetchMemories()

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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Memories</DialogTitle>
                      <DialogDescription>
                        {showExportProgress
                          ? "Preparing your memories for export..."
                          : `Export ${memories.length} memories to a JSON file`}
                      </DialogDescription>
                    </DialogHeader>

                    {showExportProgress ? (
                      <div className="py-4 space-y-4">
                        <Progress value={exportProgress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Preparing export...</span>
                          <span>{exportProgress}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          This will export all your memories to a JSON file that you can back up or import later.
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span>Total memories:</span>
                          <Badge variant="outline">{memories.length}</Badge>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" ref={exportDialogCloseRef}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleExportMemories} disabled={isExporting || memories.length === 0}>
                        {isExporting ? "Exporting..." : "Export"}
                      </Button>
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Memories</DialogTitle>
                      <DialogDescription>
                        {showImportProgress ? "Importing your memories..." : "Import memories from a JSON file"}
                      </DialogDescription>
                    </DialogHeader>

                    {showImportProgress ? (
                      <div className="py-4 space-y-4">
                        <Progress value={importProgress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Importing memories...</span>
                          <span>{importProgress}%</span>
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
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Select a JSON file containing memories to import. The file should be in the format exported by
                          this application.
                        </p>
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".json"
                            onChange={handleImportMemories}
                            disabled={isImporting}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" ref={importDialogCloseRef}>
                          {importErrors.length > 0 ? "Close" : "Cancel"}
                        </Button>
                      </DialogClose>
                      {!showImportProgress && (
                        <Button disabled={true} className="opacity-50">
                          Select a file to import
                        </Button>
                      )}
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
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleAddMemory} disabled={isLoading || !newMemory.trim()}>
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
                                <SimpleMarkdownRenderer content={memory.memory} />
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
                                <SimpleMarkdownRenderer content={memory.memory} />
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
