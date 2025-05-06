"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Shield } from "lucide-react"
import { MemoryStatus } from "@/components/memory-status"
import { MemoryInsights } from "@/components/memory-insights"
import { format, subDays } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

// Simplified version without dependencies on components that might not exist
export function AdminMemoryDashboard() {
  const [isAdmin, setIsAdmin] = useState(true) // Simplified for demo
  const [isLoading, setIsLoading] = useState(false)
  const [memories, setMemories] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalUsers: 0,
    totalFileAccesses: 0,
    totalSearches: 0,
    storageUsed: 0,
    memoryHealth: 100,
  })
  const [selectedTimeRange, setSelectedTimeRange] = useState("30")
  const [selectedUser, setSelectedUser] = useState("all")
  const [users, setUsers] = useState<string[]>([])
  const [pruneAge, setPruneAge] = useState("90")
  const { toast } = useToast()

  useEffect(() => {
    // Simplified admin check
    setIsAdmin(true)
    setIsLoading(false)
  }, [])

  // Load memory data
  useEffect(() => {
    const loadMemoryData = async () => {
      if (!isAdmin) return

      try {
        // Simplified for demo - use mock data
        const mockMemories = [
          {
            id: "1",
            text: "Accessed file: document.txt",
            timestamp: new Date().toISOString(),
            type: "file_access",
            userId: "admin",
            metadata: { path: "document.txt" },
          },
          {
            id: "2",
            text: "Navigated to folder: /documents",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: "folder_navigation",
            userId: "admin",
            metadata: { path: "/documents" },
          },
          {
            id: "3",
            text: "Searched for: report",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: "search",
            userId: "user1",
            metadata: { query: "report" },
          },
        ]

        // Extract unique users
        const uniqueUsers = [...new Set(mockMemories.map((m) => m.userId || "anonymous"))]
        setUsers(uniqueUsers)

        // Calculate stats
        const fileAccesses = mockMemories.filter((m) => m.type === "file_access").length
        const searches = mockMemories.filter((m) => m.type === "search").length

        setMemories(mockMemories)
        setStats({
          totalMemories: mockMemories.length,
          totalUsers: uniqueUsers.length,
          totalFileAccesses: fileAccesses,
          totalSearches: searches,
          storageUsed: Math.round(JSON.stringify(mockMemories).length / 1024), // Rough estimate in KB
          memoryHealth: 95, // Mock value
        })
      } catch (error) {
        console.error("Error loading memory data:", error)
      }
    }

    loadMemoryData()
  }, [isAdmin])

  // Calculate memory health score based on various factors
  const calculateMemoryHealth = (memories: any[]): number => {
    if (memories.length === 0) return 100
    return 95 // Simplified for demo
  }

  // Filter memories based on selected time range and user
  const getFilteredMemories = () => {
    if (!memories.length) return []

    const daysAgo = Number.parseInt(selectedTimeRange)
    const cutoffDate = subDays(new Date(), daysAgo).getTime()

    return memories.filter((memory) => {
      const meetsTimeFilter = daysAgo === 0 || new Date(memory.timestamp).getTime() >= cutoffDate
      const meetsUserFilter = selectedUser === "all" || memory.userId === selectedUser
      return meetsTimeFilter && meetsUserFilter
    })
  }

  // Handle memory pruning
  const handlePruneMemories = async () => {
    if (
      !confirm(`Are you sure you want to prune memories older than ${pruneAge} days? This action cannot be undone.`)
    ) {
      return
    }

    try {
      setIsLoading(true)
      const cutoffDate = subDays(new Date(), Number.parseInt(pruneAge)).toISOString()

      // Simulate pruning
      const oldCount = memories.length
      const newMemories = memories.filter((m) => new Date(m.timestamp) >= new Date(cutoffDate))
      const prunedCount = oldCount - newMemories.length

      setMemories(newMemories)

      toast({
        title: "Memories pruned successfully",
        description: `Removed ${prunedCount} memories older than ${pruneAge} days.`,
      })
    } catch (error) {
      console.error("Error pruning memories:", error)
      toast({
        title: "Error pruning memories",
        description: "An error occurred while trying to prune old memories.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle exporting memories
  const handleExportMemories = () => {
    const dataStr = JSON.stringify(memories, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `memory-export-${format(new Date(), "yyyy-MM-dd")}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Memories exported",
      description: `Exported ${memories.length} memories to ${exportFileDefaultName}`,
    })
  }

  // If not admin or still loading, show appropriate message
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="my-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You need administrator privileges to access the Memory Administration Dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  const filteredMemories = getFilteredMemories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Memory Administration</h2>
          <p className="text-muted-foreground">Manage and analyze system-wide memory data</p>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStatus />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Type</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">
                Local Storage
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory System Status</CardTitle>
              <CardDescription>Memory system is operational</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Memory dashboard functionality is currently in development.
              </div>
              <div className="flex justify-center mt-4">
                <Button>Refresh Memory Status</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <MemoryInsights showAdminControls={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
