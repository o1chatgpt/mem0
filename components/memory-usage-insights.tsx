"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BarChart, PieChart, Clock, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface MemoryStats {
  totalMemories: number
  totalFileAccesses: number
  totalSearches: number
  totalTags: number
  mostAccessedFiles: Array<{
    fileId: string
    fileName: string
    accessCount: number
  }>
  mostUsedTags: Array<{
    tag: string
    count: number
  }>
  activityByHour: Record<string, number>
  activityByDay: Record<string, number>
}

export function MemoryUsageInsights() {
  const { enhancedMemoryStore } = useAppContext()
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMemoryStats() {
      try {
        setLoading(true)
        setError(null)

        // Get memory stats from the enhanced memory store
        const memoryStats = await enhancedMemoryStore.getMemoryStats()
        setStats(memoryStats)
      } catch (err) {
        console.error("Error loading memory stats:", err)
        setError("Failed to load memory insights")
      } finally {
        setLoading(false)
      }
    }

    loadMemoryStats()

    // Refresh stats every 5 minutes
    const interval = setInterval(loadMemoryStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [enhancedMemoryStore])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            Memory Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            Memory Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            Memory Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No memory data available yet. As you use the application, we'll gather insights about your file usage
            patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Memory Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/20 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Total File Accesses</div>
                  <Badge variant="outline">{stats.totalFileAccesses}</Badge>
                </div>
                <div className="text-3xl font-bold mt-2">{stats.totalFileAccesses}</div>
              </div>
              <div className="bg-muted/20 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Total Tags</div>
                  <Badge variant="outline">{stats.totalTags}</Badge>
                </div>
                <div className="text-3xl font-bold mt-2">{stats.totalTags}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  Most Accessed Files
                </h3>
                <div className="space-y-2">
                  {stats.mostAccessedFiles.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm truncate max-w-[70%]">{file.fileName}</div>
                      <Badge variant="secondary">{file.accessCount} accesses</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div>
              <h3 className="text-sm font-medium mb-2">Most Accessed Files</h3>
              <div className="space-y-2">
                {stats.mostAccessedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm truncate max-w-[70%]">{file.fileName}</div>
                    <Badge variant="secondary">{file.accessCount} accesses</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tags">
            <div>
              <h3 className="text-sm font-medium mb-2">Most Used Tags</h3>
              <div className="space-y-2">
                {stats.mostUsedTags.map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm flex items-center">
                      <Tag className="h-3 w-3 mr-2" />
                      {tag.tag}
                    </div>
                    <Badge variant="secondary">{tag.count} files</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Activity by Hour
                </h3>
                <div className="h-40 bg-muted/20 rounded-md p-2">
                  {/* Placeholder for activity chart */}
                  <div className="h-full flex items-end">
                    {Object.entries(stats.activityByHour).map(([hour, count], index) => (
                      <div
                        key={index}
                        className="flex-1 mx-0.5"
                        style={{
                          height: `${Math.min(100, (count / Math.max(...Object.values(stats.activityByHour))) * 100)}%`,
                        }}
                      >
                        <div className="bg-primary h-full rounded-t-sm"></div>
                        <div className="text-xs text-center mt-1">{hour}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Activity by Day
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                    const count = stats.activityByDay[index.toString()] || 0
                    const max = Math.max(...Object.values(stats.activityByDay))
                    const intensity = max > 0 ? Math.min(0.9, (count / max) * 0.9) + 0.1 : 0.1

                    return (
                      <div key={day} className="p-2">
                        <div className="aspect-square rounded-md bg-primary mb-1" style={{ opacity: intensity }}></div>
                        <div className="text-xs">{day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
