"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Calendar, Clock, BarChart2, Tag, Search, FileText, Folder } from "lucide-react"

export function MemoryDashboard() {
  const { memoryStore, files } = useAppContext()
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [isLoading, setIsLoading] = useState(true)
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    fileAccesses: 0,
    folderNavigations: 0,
    searches: 0,
    tagOperations: 0,
    storageMode: "local",
  })
  const [memories, setMemories] = useState<any[]>([])

  useEffect(() => {
    const loadMemoryStats = async () => {
      setIsLoading(true)
      try {
        // Get storage mode
        const storageMode = memoryStore.getStorageMode ? memoryStore.getStorageMode() : "local"

        // Get memories
        const memories = memoryStore.getMemories ? memoryStore.getMemories() : []
        setMemories(memories)

        // Calculate stats
        const fileAccesses = memories.filter(
          (m) =>
            m.text.includes("file with ID") || m.text.includes("Opened file") || m.text.includes("Downloaded file"),
        ).length

        const folderNavigations = memories.filter(
          (m) =>
            m.text.includes("Navigated to folder") ||
            m.text.includes("Created folder") ||
            m.text.includes("Opened directory"),
        ).length

        const searches = memories.filter((m) => m.text.includes("Searched for")).length

        const tagOperations = memories.filter(
          (m) => m.text.includes("tag") || m.text.includes("Added tag") || m.text.includes("Removed tag"),
        ).length

        setMemoryStats({
          totalMemories: memories.length,
          fileAccesses,
          folderNavigations,
          searches,
          tagOperations,
          storageMode,
        })
      } catch (error) {
        console.error("Error loading memory stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (memoryStore) {
      loadMemoryStats()
    }
  }, [memoryStore])

  const handleClearMemory = async () => {
    if (confirm("Are you sure you want to clear all memory data? This action cannot be undone.")) {
      try {
        if (memoryStore && memoryStore.clearMemory) {
          await memoryStore.clearMemory()
          alert("Memory data cleared successfully")
          window.location.reload()
        }
      } catch (error) {
        console.error("Error clearing memory:", error)
        alert("Failed to clear memory data")
      }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            Memory Dashboard
          </h1>
          <p className="text-muted-foreground">Visualize your file usage patterns and memory insights</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleClearMemory}>
            Clear Memory
          </Button>
        </div>
      </div>

      {/* Memory Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              <div className="text-2xl font-bold">{memoryStats.totalMemories}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Storage: {memoryStats.storageMode === "mem0" ? "Mem0 (Cloud)" : "Local Storage"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">File Accesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{memoryStats.fileAccesses}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((memoryStats.fileAccesses / Math.max(1, memoryStats.totalMemories)) * 100)}% of all activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Folder Navigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Folder className="h-5 w-5 mr-2 text-yellow-500" />
              <div className="text-2xl font-bold">{memoryStats.folderNavigations}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((memoryStats.folderNavigations / Math.max(1, memoryStats.totalMemories)) * 100)}% of all
              activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{memoryStats.searches}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((memoryStats.searches / Math.max(1, memoryStats.totalMemories)) * 100)}% of all activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tag Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-purple-500" />
              <div className="text-2xl font-bold">{memoryStats.tagOperations}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((memoryStats.tagOperations / Math.max(1, memoryStats.totalMemories)) * 100)}% of all
              activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="overview" className="flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Overview</span>
            <span className="md:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Timeline</span>
            <span className="md:hidden">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Activity Heatmap</span>
            <span className="md:hidden">Heatmap</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Usage Trends</span>
            <span className="md:hidden">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Navigation History</span>
            <span className="md:hidden">Navigation</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Memory Insights</span>
            <span className="md:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Memory Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Storage Information</h3>
                    <p className="text-sm">
                      Your file activities are currently being stored in{" "}
                      <strong>
                        {memoryStats.storageMode === "mem0" ? "Mem0 Cloud Storage" : "Local Browser Storage"}
                      </strong>
                      .
                    </p>
                    {memoryStats.storageMode !== "mem0" && (
                      <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded text-xs">
                        <p>⚠️ Local storage is limited and will be cleared if you clear your browser data.</p>
                        <p className="mt-1">Consider enabling Mem0 for cloud-based persistent storage.</p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Memory Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Memories</p>
                        <p className="text-lg font-bold">{memoryStats.totalMemories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">File Accesses</p>
                        <p className="text-lg font-bold">{memoryStats.fileAccesses}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Folder Navigations</p>
                        <p className="text-lg font-bold">{memoryStats.folderNavigations}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Searches</p>
                        <p className="text-lg font-bold">{memoryStats.searches}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Memory Features</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                          <FileText className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <strong>File History</strong>
                          <p className="text-xs text-muted-foreground">Track which files you access most frequently</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                          <Folder className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <strong>Navigation Patterns</strong>
                          <p className="text-xs text-muted-foreground">See how you navigate through your folders</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-0.5">
                          <Search className="h-3 w-3 text-purple-600" />
                        </div>
                        <div>
                          <strong>Search History</strong>
                          <p className="text-xs text-muted-foreground">Remember your previous searches</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                          <Tag className="h-3 w-3 text-yellow-600" />
                        </div>
                        <div>
                          <strong>Tag Management</strong>
                          <p className="text-xs text-muted-foreground">Organize files with custom tags</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                <RecentActivityList memories={memories} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Memory Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <MemoryDistributionChart
                  fileAccesses={memoryStats.fileAccesses}
                  folderNavigations={memoryStats.folderNavigations}
                  searches={memoryStats.searches}
                  tagOperations={memoryStats.tagOperations}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Timeline visualization is loading...</p>
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Heatmap visualization is loading...</p>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Usage trends visualization is loading...</p>
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Navigation history is loading...</p>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-muted-foreground">Memory insights are loading...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper component for recent activity list
function RecentActivityList({ memories = [] }) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Clock className="h-12 w-12 mb-2 opacity-50" />
        <p>No activity recorded yet</p>
      </div>
    )
  }

  // Sort memories by timestamp (newest first)
  const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const recentActivities = sortedMemories.slice(0, 20) // Get the 20 most recent activities

  return (
    <div className="space-y-3">
      {recentActivities.map((activity, index) => {
        // Determine icon based on activity text
        let icon = <Clock className="h-4 w-4 text-muted-foreground" />

        if (activity.text.includes("file")) {
          icon = <FileText className="h-4 w-4 text-blue-500" />
        } else if (activity.text.includes("folder") || activity.text.includes("directory")) {
          icon = <Folder className="h-4 w-4 text-yellow-500" />
        } else if (activity.text.includes("search")) {
          icon = <Search className="h-4 w-4 text-green-500" />
        } else if (activity.text.includes("tag")) {
          icon = <Tag className="h-4 w-4 text-purple-500" />
        }

        return (
          <div key={index} className="flex items-start space-x-2 p-2 border-b last:border-0">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Helper component for memory distribution chart
function MemoryDistributionChart({ fileAccesses, folderNavigations, searches, tagOperations }) {
  const total = fileAccesses + folderNavigations + searches + tagOperations

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <BarChart2 className="h-12 w-12 mb-2 opacity-50" />
        <p>No data available</p>
      </div>
    )
  }

  const calculatePercentage = (value) => {
    return Math.round((value / total) * 100)
  }

  const filePercentage = calculatePercentage(fileAccesses)
  const folderPercentage = calculatePercentage(folderNavigations)
  const searchPercentage = calculatePercentage(searches)
  const tagPercentage = calculatePercentage(tagOperations)

  return (
    <div className="space-y-6">
      <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-blue-500 h-full"
          style={{ width: `${filePercentage}%` }}
          title={`File Accesses: ${fileAccesses} (${filePercentage}%)`}
        ></div>
        <div
          className="bg-yellow-500 h-full"
          style={{ width: `${folderPercentage}%` }}
          title={`Folder Navigations: ${folderNavigations} (${folderPercentage}%)`}
        ></div>
        <div
          className="bg-green-500 h-full"
          style={{ width: `${searchPercentage}%` }}
          title={`Searches: ${searches} (${searchPercentage}%)`}
        ></div>
        <div
          className="bg-purple-500 h-full"
          style={{ width: `${tagPercentage}%` }}
          title={`Tag Operations: ${tagOperations} (${tagPercentage}%)`}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm">File Accesses</span>
              <span className="text-sm font-medium">{filePercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{fileAccesses} activities</div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm">Folder Navigations</span>
              <span className="text-sm font-medium">{folderPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{folderNavigations} activities</div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm">Searches</span>
              <span className="text-sm font-medium">{searchPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{searches} activities</div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm">Tag Operations</span>
              <span className="text-sm font-medium">{tagPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{tagOperations} activities</div>
          </div>
        </div>
      </div>
    </div>
  )
}
