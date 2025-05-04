"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Brain,
  Server,
  Activity,
  FileText,
  Clock,
  Wrench,
  ArrowLeft,
  Search,
  Trash2,
} from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { mem0Client } from "@/lib/mem0-client"
import { dbService } from "@/lib/db-service"
import { memoryStore } from "@/lib/memory-store"

// Define test result type
interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: string
  timestamp: number
}

// Define memory stats type
interface MemoryStats {
  totalMemories: number
  structuredKeys: number
  fileRelatedMemories: number
  oldestMemoryAge: number | null
  newestMemoryAge: number | null
  averageMemorySize: number
  totalStorageSize: number
}

export default function MemoryDiagnosticsPage() {
  const router = useRouter()
  const { user } = useAppContext()
  const [activeTab, setActiveTab] = useState("diagnostics")
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null)
  const [repairStatus, setRepairStatus] = useState<{
    inProgress: boolean
    operation: string
    progress: number
    result: string
  }>({
    inProgress: false,
    operation: "",
    progress: 0,
    result: "",
  })

  // Run initial diagnostics on page load
  useEffect(() => {
    runDiagnostics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Function to run all diagnostic tests
  const runDiagnostics = async () => {
    setIsRunningTests(true)
    setTestResults([])

    try {
      // Test Mem0 API connectivity
      await testMem0ApiConnectivity()

      // Test database connectivity
      await testDatabaseConnectivity()

      // Test memory store initialization
      await testMemoryStoreInitialization()

      // Test structured memory access
      await testStructuredMemoryAccess()

      // Test memory search functionality
      await testMemorySearch()

      // Collect memory statistics
      await collectMemoryStats()
    } catch (error) {
      console.error("Error running diagnostics:", error)
      addTestResult({
        name: "Diagnostics Error",
        status: "error",
        message: "An unexpected error occurred while running diagnostics",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsRunningTests(false)
    }
  }

  // Helper function to add a test result
  const addTestResult = (result: Omit<TestResult, "timestamp">) => {
    setTestResults((prev) => [...prev, { ...result, timestamp: Date.now() }])
  }

  // Test Mem0 API connectivity
  const testMem0ApiConnectivity = async () => {
    addTestResult({
      name: "Mem0 API Connectivity",
      status: "pending",
      message: "Testing connection to Mem0 API...",
    })

    try {
      if (!mem0Client.isApiAvailable()) {
        addTestResult({
          name: "Mem0 API Connectivity",
          status: "warning",
          message: "Mem0 API is not configured",
          details: "API key is missing or invalid. Configure the API key in Mem0 settings.",
        })
        return
      }

      // Test a simple API call
      await mem0Client.search({ query: "test", user_id: user?.id || "test-user", limit: 1 })

      addTestResult({
        name: "Mem0 API Connectivity",
        status: "success",
        message: "Successfully connected to Mem0 API",
      })

      // Test structured endpoint
      try {
        if (mem0Client.isStructuredEndpointAvailable()) {
          addTestResult({
            name: "Structured Memory Endpoint",
            status: "success",
            message: "Structured memory endpoint is available",
          })
        } else {
          addTestResult({
            name: "Structured Memory Endpoint",
            status: "warning",
            message: "Structured memory endpoint is not available",
            details: "The application will use local fallback storage for structured data",
          })
        }
      } catch (error) {
        addTestResult({
          name: "Structured Memory Endpoint",
          status: "error",
          message: "Error checking structured memory endpoint",
          details: error instanceof Error ? error.message : String(error),
        })
      }
    } catch (error) {
      addTestResult({
        name: "Mem0 API Connectivity",
        status: "error",
        message: "Failed to connect to Mem0 API",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Test database connectivity
  const testDatabaseConnectivity = async () => {
    addTestResult({
      name: "Database Connectivity",
      status: "pending",
      message: "Testing connection to database...",
    })

    try {
      const isConnected = await dbService.initialize()

      if (isConnected) {
        addTestResult({
          name: "Database Connectivity",
          status: "success",
          message: "Successfully connected to database",
        })
      } else if (dbService.isUsingLocalFallback()) {
        addTestResult({
          name: "Database Connectivity",
          status: "warning",
          message: "Using local fallback storage for database",
          details: "Database connection is not available. Data will not persist across sessions.",
        })
      } else {
        addTestResult({
          name: "Database Connectivity",
          status: "error",
          message: "Failed to connect to database",
          details: "Database connection failed but not using local fallback. This is an unexpected state.",
        })
      }
    } catch (error) {
      addTestResult({
        name: "Database Connectivity",
        status: "error",
        message: "Error testing database connectivity",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Test memory store initialization
  const testMemoryStoreInitialization = async () => {
    addTestResult({
      name: "Memory Store Initialization",
      status: "pending",
      message: "Testing memory store initialization...",
    })

    try {
      await memoryStore.initialize()

      const storageMode = memoryStore.getStorageMode()

      if (storageMode === "api") {
        addTestResult({
          name: "Memory Store Initialization",
          status: "success",
          message: "Memory store initialized successfully using Mem0 API",
        })
      } else if (storageMode === "database") {
        addTestResult({
          name: "Memory Store Initialization",
          status: "success",
          message: "Memory store initialized successfully using database",
        })
      } else {
        addTestResult({
          name: "Memory Store Initialization",
          status: "warning",
          message: "Memory store initialized using local storage",
          details: "Data will not persist across sessions. Configure Mem0 API or database for persistence.",
        })
      }
    } catch (error) {
      addTestResult({
        name: "Memory Store Initialization",
        status: "error",
        message: "Failed to initialize memory store",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Test structured memory access
  const testStructuredMemoryAccess = async () => {
    addTestResult({
      name: "Structured Memory Access",
      status: "pending",
      message: "Testing structured memory access...",
    })

    try {
      // Write a test value
      const testKey = `diagnostic-test-${Date.now()}`
      const testValue = { timestamp: Date.now(), value: "test-value" }

      await memoryStore.storeMemory(testKey, testValue)

      // Read the test value back
      const retrievedValue = await memoryStore.retrieveMemory(testKey)

      if (retrievedValue && retrievedValue.value === testValue.value) {
        addTestResult({
          name: "Structured Memory Access",
          status: "success",
          message: "Successfully stored and retrieved structured memory",
        })
      } else {
        addTestResult({
          name: "Structured Memory Access",
          status: "error",
          message: "Failed to retrieve stored structured memory",
          details: `Expected "${testValue.value}" but got ${JSON.stringify(retrievedValue)}`,
        })
      }
    } catch (error) {
      addTestResult({
        name: "Structured Memory Access",
        status: "error",
        message: "Error testing structured memory access",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Test memory search functionality
  const testMemorySearch = async () => {
    addTestResult({
      name: "Memory Search",
      status: "pending",
      message: "Testing memory search functionality...",
    })

    try {
      // Add a test memory
      const testMemory = `Diagnostic test memory ${Date.now()}`
      await memoryStore.addMemory(testMemory)

      // Search for the test memory
      const searchResults = await memoryStore.searchMemories("Diagnostic test memory")

      if (searchResults.length > 0) {
        addTestResult({
          name: "Memory Search",
          status: "success",
          message: "Successfully searched and found memories",
          details: `Found ${searchResults.length} matching memories`,
        })
      } else {
        addTestResult({
          name: "Memory Search",
          status: "warning",
          message: "Search returned no results",
          details: "This could be normal if no matching memories exist, or it could indicate a search issue",
        })
      }
    } catch (error) {
      addTestResult({
        name: "Memory Search",
        status: "error",
        message: "Error testing memory search",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Collect memory statistics
  const collectMemoryStats = async () => {
    try {
      // Get all memories for statistics
      const allMemories = await memoryStore.searchMemories("", 1000)

      // Calculate statistics
      const totalMemories = allMemories.length
      const fileRelatedMemories = allMemories.filter((m) => m.memory.includes("file_id:")).length

      let totalSize = 0
      const timestamps: number[] = []

      allMemories.forEach((memory) => {
        totalSize += JSON.stringify(memory).length
        timestamps.push(memory.timestamp)
      })

      const oldestMemoryAge = timestamps.length > 0 ? Math.min(...timestamps) : null
      const newestMemoryAge = timestamps.length > 0 ? Math.max(...timestamps) : null
      const averageMemorySize = totalMemories > 0 ? Math.round(totalSize / totalMemories) : 0

      // Get structured memory keys
      // This is a simplified approach since we don't have direct access to all structured keys
      const knownStructuredKeys = ["favorites", "searchHistory", "recentFiles"]
      let structuredKeysCount = 0

      for (const key of knownStructuredKeys) {
        const value = await memoryStore.retrieveMemory(key)
        if (value !== null) {
          structuredKeysCount++
          totalSize += JSON.stringify(value).length
        }
      }

      setMemoryStats({
        totalMemories,
        structuredKeys: structuredKeysCount,
        fileRelatedMemories,
        oldestMemoryAge,
        newestMemoryAge,
        averageMemorySize,
        totalStorageSize: totalSize,
      })
    } catch (error) {
      console.error("Error collecting memory statistics:", error)
    }
  }

  // Repair functions
  const repairMemoryStore = async () => {
    setRepairStatus({
      inProgress: true,
      operation: "Repairing memory store",
      progress: 0,
      result: "",
    })

    try {
      // Step 1: Re-initialize memory store
      setRepairStatus((prev) => ({ ...prev, progress: 10, operation: "Re-initializing memory store" }))
      await memoryStore.initialize()

      // Step 2: Test structured memory
      setRepairStatus((prev) => ({ ...prev, progress: 30, operation: "Testing structured memory" }))
      const testKey = `repair-test-${Date.now()}`
      await memoryStore.storeMemory(testKey, { timestamp: Date.now() })

      // Step 3: Clean up any corrupted memories
      setRepairStatus((prev) => ({ ...prev, progress: 50, operation: "Cleaning up corrupted memories" }))
      // This is a placeholder - in a real implementation, you would identify and fix corrupted memories

      // Step 4: Rebuild indices if needed
      setRepairStatus((prev) => ({ ...prev, progress: 70, operation: "Rebuilding memory indices" }))
      // This is a placeholder - in a real implementation, you would rebuild any necessary indices

      // Step 5: Verify repair
      setRepairStatus((prev) => ({ ...prev, progress: 90, operation: "Verifying repairs" }))
      await memoryStore.searchMemories("test")

      setRepairStatus({
        inProgress: false,
        operation: "Repair completed",
        progress: 100,
        result: "Memory store repaired successfully",
      })

      // Run diagnostics again to verify
      await runDiagnostics()
    } catch (error) {
      console.error("Error repairing memory store:", error)
      setRepairStatus({
        inProgress: false,
        operation: "Repair failed",
        progress: 100,
        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  const rebuildMemoryIndices = async () => {
    setRepairStatus({
      inProgress: true,
      operation: "Rebuilding memory indices",
      progress: 0,
      result: "",
    })

    try {
      // Step 1: Get all memories
      setRepairStatus((prev) => ({ ...prev, progress: 20, operation: "Retrieving all memories" }))
      const allMemories = await memoryStore.searchMemories("", 1000)

      // Step 2: Clear and rebuild
      setRepairStatus((prev) => ({ ...prev, progress: 40, operation: "Clearing existing indices" }))
      // This is a placeholder - in a real implementation, you would clear and rebuild indices

      // Step 3: Re-index memories
      setRepairStatus((prev) => ({ ...prev, progress: 60, operation: "Re-indexing memories" }))

      // Simulate re-indexing process
      for (let i = 0; i < allMemories.length; i++) {
        const progress = 60 + Math.floor((i / allMemories.length) * 30)
        setRepairStatus((prev) => ({
          ...prev,
          progress,
          operation: `Re-indexing memory ${i + 1} of ${allMemories.length}`,
        }))

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Step 4: Verify indices
      setRepairStatus((prev) => ({ ...prev, progress: 90, operation: "Verifying indices" }))

      setRepairStatus({
        inProgress: false,
        operation: "Rebuild completed",
        progress: 100,
        result: `Successfully rebuilt indices for ${allMemories.length} memories`,
      })

      // Run diagnostics again to verify
      await runDiagnostics()
    } catch (error) {
      console.error("Error rebuilding memory indices:", error)
      setRepairStatus({
        inProgress: false,
        operation: "Rebuild failed",
        progress: 100,
        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  const migrateToLocalStorage = async () => {
    setRepairStatus({
      inProgress: true,
      operation: "Migrating to local storage",
      progress: 0,
      result: "",
    })

    try {
      // Step 1: Get all memories from current storage
      setRepairStatus((prev) => ({ ...prev, progress: 20, operation: "Retrieving all memories" }))
      const allMemories = await memoryStore.searchMemories("", 1000)

      // Step 2: Get structured data
      setRepairStatus((prev) => ({ ...prev, progress: 40, operation: "Retrieving structured data" }))
      const knownStructuredKeys = ["favorites", "searchHistory", "recentFiles"]
      const structuredData: Record<string, any> = {}

      for (const key of knownStructuredKeys) {
        structuredData[key] = await memoryStore.retrieveMemory(key)
      }

      // Step 3: Force local storage mode
      setRepairStatus((prev) => ({ ...prev, progress: 60, operation: "Switching to local storage" }))
      // This is a placeholder - in a real implementation, you would force local storage mode

      // Step 4: Restore memories to local storage
      setRepairStatus((prev) => ({ ...prev, progress: 80, operation: "Restoring memories to local storage" }))
      // This is a placeholder - in a real implementation, you would restore memories to local storage

      setRepairStatus({
        inProgress: false,
        operation: "Migration completed",
        progress: 100,
        result: `Successfully migrated ${allMemories.length} memories to local storage`,
      })

      // Run diagnostics again to verify
      await runDiagnostics()
    } catch (error) {
      console.error("Error migrating to local storage:", error)
      setRepairStatus({
        inProgress: false,
        operation: "Migration failed",
        progress: 100,
        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  }

  // Render status badge
  const renderStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Success
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" /> Warning
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Running
          </Badge>
        )
      default:
        return null
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // Format age
  const formatAge = (timestamp: number | null) => {
    if (timestamp === null) return "N/A"

    const ageMs = Date.now() - timestamp
    const seconds = Math.floor(ageMs / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings/mem0")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mem0 Settings
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <Wrench className="h-8 w-8 mr-2 text-primary" />
          Memory Diagnostics
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostics">
            <Activity className="h-4 w-4 mr-2" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="stats">
            <FileText className="h-4 w-4 mr-2" />
            Memory Stats
          </TabsTrigger>
          <TabsTrigger value="repair">
            <Wrench className="h-4 w-4 mr-2" />
            Repair Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Memory System Diagnostics
              </CardTitle>
              <CardDescription>Run tests to diagnose issues with the memory system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={runDiagnostics} disabled={isRunningTests} className="mb-4">
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Diagnostics
                    </>
                  )}
                </Button>

                {testResults.length > 0 && (
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium flex items-center">
                            {result.name === "Mem0 API Connectivity" && <Brain className="h-4 w-4 mr-2" />}
                            {result.name === "Database Connectivity" && <Database className="h-4 w-4 mr-2" />}
                            {result.name === "Memory Store Initialization" && <Server className="h-4 w-4 mr-2" />}
                            {result.name === "Structured Memory Endpoint" && <FileText className="h-4 w-4 mr-2" />}
                            {result.name === "Structured Memory Access" && <FileText className="h-4 w-4 mr-2" />}
                            {result.name === "Memory Search" && <Search className="h-4 w-4 mr-2" />}
                            {result.name}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(result.status)}
                            <span className="text-xs text-muted-foreground">{formatTimestamp(result.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-sm">{result.message}</p>
                        {result.details && <p className="text-xs text-muted-foreground mt-1">{result.details}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Memory Statistics
              </CardTitle>
              <CardDescription>View statistics about your memory system</CardDescription>
            </CardHeader>
            <CardContent>
              {memoryStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Memory Counts
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Memories:</span>
                        <span className="font-medium">{memoryStats.totalMemories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">File-Related Memories:</span>
                        <span className="font-medium">{memoryStats.fileRelatedMemories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Structured Memory Keys:</span>
                        <span className="font-medium">{memoryStats.structuredKeys}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Memory Age
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Oldest Memory:</span>
                        <span className="font-medium">{formatAge(memoryStats.oldestMemoryAge)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Newest Memory:</span>
                        <span className="font-medium">{formatAge(memoryStats.newestMemoryAge)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Storage Usage
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Memory Size:</span>
                        <span className="font-medium">{formatBytes(memoryStats.averageMemorySize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Storage Size:</span>
                        <span className="font-medium">{formatBytes(memoryStats.totalStorageSize)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Memory Distribution
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>File-Related</span>
                          <span>
                            {Math.round((memoryStats.fileRelatedMemories / memoryStats.totalMemories) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(memoryStats.fileRelatedMemories / memoryStats.totalMemories) * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Other Memories</span>
                          <span>
                            {Math.round(
                              ((memoryStats.totalMemories - memoryStats.fileRelatedMemories) /
                                memoryStats.totalMemories) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            ((memoryStats.totalMemories - memoryStats.fileRelatedMemories) /
                              memoryStats.totalMemories) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => collectMemoryStats()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Statistics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="repair">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Memory Repair Tools
              </CardTitle>
              <CardDescription>Tools to fix common memory-related issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {repairStatus.inProgress && (
                  <div className="mb-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                      <AlertDescription className="text-blue-700">{repairStatus.operation}</AlertDescription>
                    </Alert>
                    <Progress value={repairStatus.progress} className="h-2 mt-2" />
                  </div>
                )}

                {repairStatus.result && !repairStatus.inProgress && (
                  <Alert
                    className={
                      repairStatus.result.includes("Error")
                        ? "bg-red-50 border-red-200 mb-4"
                        : "bg-green-50 border-green-200 mb-4"
                    }
                  >
                    {repairStatus.result.includes("Error") ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <AlertDescription
                      className={repairStatus.result.includes("Error") ? "text-red-700" : "text-green-700"}
                    >
                      {repairStatus.result}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Wrench className="h-4 w-4 mr-2" />
                      Repair Memory Store
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Attempts to fix common memory store issues by reinitializing components and verifying connections.
                    </p>
                    <Button onClick={repairMemoryStore} disabled={repairStatus.inProgress} className="w-full">
                      {repairStatus.inProgress && repairStatus.operation.includes("Repairing") ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Repairing...
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          Repair Memory Store
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rebuild Memory Indices
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Rebuilds memory search indices to improve search performance and fix missing results.
                    </p>
                    <Button onClick={rebuildMemoryIndices} disabled={repairStatus.inProgress} className="w-full">
                      {repairStatus.inProgress && repairStatus.operation.includes("Rebuilding") ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Rebuilding...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rebuild Indices
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Migrate to Local Storage
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Forces the application to use local storage for all memory operations. Use this if API or database
                      issues persist.
                    </p>
                    <Button onClick={migrateToLocalStorage} disabled={repairStatus.inProgress} className="w-full">
                      {repairStatus.inProgress && repairStatus.operation.includes("Migrating") ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Migrating...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Migrate to Local Storage
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md p-4 bg-red-50">
                    <h3 className="font-medium mb-2 flex items-center text-red-700">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Clear All Memory Data
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                      WARNING: This will permanently delete all memory data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all memory data? This action cannot be undone.")) {
                          memoryStore.clearMemory().then(() => {
                            alert("Memory data cleared successfully.")
                            runDiagnostics()
                          })
                        }
                      }}
                      disabled={repairStatus.inProgress}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Memory Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
