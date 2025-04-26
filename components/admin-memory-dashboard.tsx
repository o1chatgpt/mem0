"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { UsageTimeline } from "@/components/usage-timeline"
import { UsageHeatmap } from "@/components/usage-heatmap"
import { UsageTrends } from "@/components/usage-trends"
import { MemoryInsights } from "@/components/memory-insights"
import { NavigationHistory } from "@/components/navigation-history"
import { MemoryStatus } from "@/components/memory-status"
import { mem0Integration } from "@/lib/mem0-integration"
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Clock,
  Database,
  FileText,
  Folder,
  HardDrive,
  Search,
  Settings,
  Trash2,
  Users,
  Shield,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react"
import { getMemoryStore } from "@/lib/memory-store"
import { formatDistanceToNow, format, subDays } from "date-fns"

export function AdminMemoryDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.authenticated && data.user.role === "admin") {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  // Load memory data
  useEffect(() => {
    const loadMemoryData = async () => {
      if (!isAdmin) return

      try {
        const memoryStore = await getMemoryStore()
        const allMemories = await memoryStore.getAllMemories()

        // Extract unique users
        const uniqueUsers = [...new Set(allMemories.map((m) => m.userId || "anonymous"))]
        setUsers(uniqueUsers)

        // Calculate stats
        const fileAccesses = allMemories.filter((m) => m.type === "file_access").length
        const searches = allMemories.filter((m) => m.type === "search").length

        setMemories(allMemories)
        setStats({
          totalMemories: allMemories.length,
          totalUsers: uniqueUsers.length,
          totalFileAccesses: fileAccesses,
          totalSearches: searches,
          storageUsed: Math.round(JSON.stringify(allMemories).length / 1024), // Rough estimate in KB
          memoryHealth: calculateMemoryHealth(allMemories),
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

    // Factors that might affect health:
    // 1. Age of memories (older memories might be less relevant)
    // 2. Consistency of data (missing fields)
    // 3. Distribution across types

    const now = new Date().getTime()
    const ageScores = memories.map((m) => {
      const age = now - new Date(m.timestamp).getTime()
      return Math.max(0, 100 - (age / (1000 * 60 * 60 * 24 * 365)) * 100) // Reduce score based on age in years
    })

    const avgAgeScore = ageScores.reduce((sum, score) => sum + score, 0) / ageScores.length

    const completenessScores = memories.map((m) => {
      let score = 100
      if (!m.userId) score -= 20
      if (!m.metadata) score -= 20
      if (!m.type) score -= 30
      if (!m.timestamp) score -= 30
      return Math.max(0, score)
    })

    const avgCompletenessScore = completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length

    // Calculate distribution score
    const types = memories.map((m) => m.type)
    const uniqueTypes = new Set(types)
    const distributionScore = (uniqueTypes.size / 5) * 100 // Assuming 5 is the ideal number of types

    // Combine scores with weights
    return Math.round(avgAgeScore * 0.3 + avgCompletenessScore * 0.5 + distributionScore * 0.2)
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
      const memoryStore = await getMemoryStore()
      const cutoffDate = subDays(new Date(), Number.parseInt(pruneAge)).toISOString()

      // This would be a custom method you'd need to add to your memory store
      // For now, we'll simulate it
      const prunedCount = await simulatePruneMemories(cutoffDate)

      toast({
        title: "Memories pruned successfully",
        description: `Removed ${prunedCount} memories older than ${pruneAge} days.`,
      })

      // Reload data
      const allMemories = await memoryStore.getAllMemories()
      setMemories(allMemories)
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

  // Simulate pruning memories (you would implement this in your memory store)
  const simulatePruneMemories = async (cutoffDate: string): Promise<number> => {
    const oldCount = memories.length
    const newMemories = memories.filter((m) => new Date(m.timestamp) >= new Date(cutoffDate))
    const prunedCount = oldCount - newMemories.length

    // In a real implementation, you would call an API or method to actually delete the memories
    setMemories(newMemories)

    return prunedCount
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
          <p className="text-muted-foreground">Manage and analyze system-wide memory data across all users</p>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStatus />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalUsers} user{stats.totalUsers !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Accesses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFileAccesses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.totalFileAccesses / stats.totalMemories) * 100).toFixed(1)}% of all memories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed.toLocaleString()} KB</div>
            <p className="text-xs text-muted-foreground">
              ~{(stats.storageUsed / stats.totalMemories).toFixed(1)} KB per memory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memoryHealth}%</div>
            <Progress value={stats.memoryHealth} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Filters</CardTitle>
          <CardDescription>Filter memory data by time range and user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="space-y-2 flex-1">
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger id="timeRange">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="0">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="user">User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user || "Anonymous"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="insights">Detailed Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Memory Activity Timeline</CardTitle>
                <CardDescription>Memory creation over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UsageTimeline
                  data={filteredMemories.map((m) => ({
                    date: new Date(m.timestamp),
                    count: 1,
                    type: m.type || "unknown",
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="row-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest memory events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {filteredMemories
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 20)
                    .map((memory, index) => (
                      <div key={index} className="mb-4 pb-4 border-b last:border-0">
                        <div className="flex items-start">
                          {memory.type === "file_access" && <FileText className="h-5 w-5 mr-2 text-blue-500" />}
                          {memory.type === "folder_navigation" && <Folder className="h-5 w-5 mr-2 text-yellow-500" />}
                          {memory.type === "search" && <Search className="h-5 w-5 mr-2 text-green-500" />}
                          {(!memory.type || !["file_access", "folder_navigation", "search"].includes(memory.type)) && (
                            <Activity className="h-5 w-5 mr-2 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">
                              {memory.type === "file_access" &&
                                `File accessed: ${memory.metadata?.path || "Unknown file"}`}
                              {memory.type === "folder_navigation" &&
                                `Folder opened: ${memory.metadata?.path || "Unknown folder"}`}
                              {memory.type === "search" && `Search: "${memory.metadata?.query || "Unknown query"}"`}
                              {(!memory.type ||
                                !["file_access", "folder_navigation", "search"].includes(memory.type)) &&
                                `${memory.type || "Unknown activity"}`}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(memory.timestamp), { addSuffix: true })}
                              <Users className="h-3 w-3 ml-3 mr-1" />
                              {memory.userId || "Anonymous"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Heatmap</CardTitle>
                <CardDescription>When memories are created</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UsageHeatmap
                  data={filteredMemories.map((m) => ({
                    date: new Date(m.timestamp),
                    count: 1,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Distribution</CardTitle>
                <CardDescription>Memory creation by user</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UsageTrends
                  data={users.map((user) => {
                    const userMemories = filteredMemories.filter((m) => m.userId === user)
                    return {
                      name: user || "Anonymous",
                      value: userMemories.length,
                    }
                  })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity Timeline</CardTitle>
                <CardDescription>When users are active</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UsageTimeline
                  data={filteredMemories.map((m) => ({
                    date: new Date(m.timestamp),
                    count: 1,
                    type: m.userId || "anonymous",
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Navigation History</CardTitle>
                <CardDescription>Folder navigation patterns by user</CardDescription>
              </CardHeader>
              <CardContent>
                <NavigationHistory
                  memories={filteredMemories.filter((m) => m.type === "folder_navigation")}
                  showUser={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Memory Pruning</CardTitle>
                <CardDescription>Remove old or unnecessary memories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pruneAge">Remove memories older than</Label>
                    <Select value={pruneAge} onValueChange={setPruneAge}>
                      <SelectTrigger id="pruneAge">
                        <SelectValue placeholder="Select age threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="destructive" onClick={handlePruneMemories} disabled={isLoading} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Prune Old Memories
                  </Button>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>This action permanently removes memories and cannot be undone.</AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Export/Import</CardTitle>
                <CardDescription>Backup and restore memory data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" onClick={handleExportMemories} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Memories
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="importFile">Import memories from file</Label>
                    <div className="flex items-center gap-2">
                      <Input id="importFile" type="file" accept=".json" />
                      <Button variant="secondary" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Note: Import functionality is currently disabled in this version.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Memory System Status</CardTitle>
                <CardDescription>Current status and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Storage Type</div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {mem0Integration.isEnabled() ? "Mem0 Cloud" : "Local Storage"}
                        </Badge>
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Memory Health</div>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.memoryHealth} className="h-2 flex-1" />
                        <span className="text-sm">{stats.memoryHealth}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Last Updated</div>
                      <div className="text-sm">
                        {memories.length > 0
                          ? format(new Date(Math.max(...memories.map((m) => new Date(m.timestamp).getTime()))), "PPpp")
                          : "No memories found"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Memory System Actions</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Memory Cache
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Memory Settings
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Generate Memory Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Memory Insights</CardTitle>
              <CardDescription>Advanced search and analysis of memory data</CardDescription>
            </CardHeader>
            <CardContent>
              <MemoryInsights showAdminControls={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
