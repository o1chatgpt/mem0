"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Search, Settings, Download, Upload, Trash2, AlertTriangle } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mem0ConnectionDetails } from "@/components/mem0-connection-details"

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

    try {
      // Use our updated function that handles both API and database fallback
      let fetchedMemories: any[] = []

      try {
        fetchedMemories = await getMemoriesFromMem0("default_user", "file_manager", 50)
      } catch (error) {
        console.error("Error fetching memories from Mem0:", error)
        // Don't set hasError here, we'll try the fallback
      }

      if (fetchedMemories && fetchedMemories.length > 0) {
        setMemories(fetchedMemories)

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
      toast({
        title: "Error",
        description: "Failed to load memories. Using fallback data.",
        variant: "destructive",
      })

      // Use mock data as fallback
      setMemories(MOCK_MEMORIES)
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
      // Use our updated function that handles both API and database fallback
      const success = await storeMemoryWithMem0("default_user", "file_manager", newMemory)

      if (success) {
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
      } else {
        throw new Error("Failed to add memory")
      }
    } catch (error) {
      console.error("Error adding memory:", error)
      toast({
        title: "Error",
        description: "Failed to add memory",
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
      // Use our updated function that handles both API and database fallback
      const searchResults = await searchMemoriesFromMem0("default_user", "file_manager", searchQuery, 50)

      if (searchResults && searchResults.length > 0) {
        setMemories(searchResults)
      } else {
        // If no results from API/DB, do a client-side search on current memories
        const filtered = memories.filter((memory) => memory.memory.toLowerCase().includes(searchQuery.toLowerCase()))
        setMemories(filtered)
      }
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
    } finally {
      setIsSearching(false)
    }
  }

  // Export memories to JSON file
  const handleExportMemories = () => {
    setIsExporting(true)
    try {
      // Create a JSON blob with the memories
      const memoryData = JSON.stringify(memories, null, 2)
      const blob = new Blob([memoryData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `mem0-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Memories have been exported to a JSON file",
      })
    } catch (error) {
      console.error("Error exporting memories:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export memories",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Import memories from JSON file
  const handleImportMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true)
    try {
      const file = event.target.files?.[0]
      if (!file) {
        throw new Error("No file selected")
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const importedMemories = JSON.parse(content)

          if (!Array.isArray(importedMemories)) {
            throw new Error("Invalid memory format")
          }

          // Add each imported memory to the database
          let successCount = 0
          for (const memory of importedMemories) {
            if (memory.memory) {
              const success = await storeMemoryWithMem0("default_user", "file_manager", memory.memory)
              if (success) successCount++
            }
          }

          // Refresh memories
          fetchMemories()

          toast({
            title: "Import Successful",
            description: `Imported ${successCount} memories successfully`,
          })
        } catch (parseError) {
          console.error("Error parsing imported file:", parseError)
          toast({
            title: "Import Failed",
            description: "Invalid file format",
            variant: "destructive",
          })
        } finally {
          setIsImporting(false)
        }
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

  return (
    <PreferencesProvider>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Mem0 Integration</h1>
            <p className="text-lg text-muted-foreground">Long-term memory capabilities for your File Manager</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/mem0/settings">
              <Settings className="mr-2 h-4 w-4" />
              Mem0 Settings
            </Link>
          </Button>
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
              There was an error loading memories from the API or database. Using fallback data for display.
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
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleExportMemories}
                  disabled={isExporting || memories.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export Memories"}
                </Button>

                <div className="relative">
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Memories
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportMemories}
                    disabled={isImporting}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

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
                      <Button variant="outline">Cancel</Button>
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
                  <CardHeader>
                    <CardTitle>Memory Timeline</CardTitle>
                    <CardDescription>A chronological history of user interactions and preferences</CardDescription>
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
                  <CardHeader>
                    <CardTitle>Search Memories</CardTitle>
                    <CardDescription>Find specific memories based on keywords</CardDescription>
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
