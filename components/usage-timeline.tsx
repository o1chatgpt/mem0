"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, AlertCircle } from "lucide-react"
import { processMemoryForTimeline, type TimelineEntry } from "@/lib/visualization-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMem0 } from "@/components/mem0-provider"

export function UsageTimeline() {
  const { files = [], memoryStore } = useAppContext()
  const { isInitialized, isLoading: mem0Loading, error: mem0Error, memories } = useMem0()

  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Process memories from Mem0Provider when they change
  useEffect(() => {
    if (!isMounted) return

    const processMemories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Use memories from Mem0Provider if available
        let memoriesToProcess: any[] = []

        if (isInitialized && memories.length > 0) {
          // Convert Mem0 memories to the format expected by processMemoryForTimeline
          memoriesToProcess = memories.map((memory) => ({
            text: memory.content,
            timestamp: memory.createdAt,
            metadata: memory.metadata,
          }))
        } else if (!isInitialized && memoryStore?.getMemories) {
          // Fall back to memory store if Mem0 is not initialized
          try {
            const result = memoryStore.getMemories()
            if (Array.isArray(result)) {
              memoriesToProcess = result
            } else {
              console.warn("getMemories did not return an array:", result)
              // Try to convert to array if possible
              if (result && typeof result === "object") {
                try {
                  memoriesToProcess = Object.values(result)
                } catch (e) {
                  console.error("Could not convert memories to array:", e)
                }
              }
            }
          } catch (err) {
            console.error("Error getting memories from store:", err)
          }
        }

        // Filter memories based on time range
        let filteredMemories = [...memoriesToProcess]

        if (timeRange !== "all") {
          const cutoffDate = new Date()
          const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
          cutoffDate.setDate(cutoffDate.getDate() - days)

          filteredMemories = memoriesToProcess.filter((memory) => new Date(memory.timestamp) >= cutoffDate)
        }

        // Process memories for timeline
        const timeline = processMemoryForTimeline(filteredMemories, files)
        setTimelineData(timeline)

        // Select the most recent date by default
        if (timeline.length > 0 && !selectedDate) {
          setSelectedDate(timeline[timeline.length - 1].date)
        }
      } catch (err) {
        console.error("Error loading timeline data:", err)
        setError(err instanceof Error ? err.message : "Failed to load timeline data")
      } finally {
        setIsLoading(false)
      }
    }

    processMemories()
  }, [files, memoryStore, timeRange, selectedDate, isMounted, isInitialized, memories])

  // Get selected date data
  const selectedDateData = selectedDate ? timelineData.find((entry) => entry.date === selectedDate) : null

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            File Usage Timeline
          </CardTitle>
          <CardDescription>Memory usage over time</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use Mem0 error if available
  const displayError = mem0Error || error
  // Use Mem0 loading state if available
  const displayLoading = isInitialized ? mem0Loading : isLoading

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            File Usage Timeline
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange("7d")}
            >
              7d
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange("30d")}
            >
              30d
            </Button>
            <Button
              variant={timeRange === "90d" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange("90d")}
            >
              90d
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange("all")}
            >
              All
            </Button>
          </div>
        </div>
        <CardDescription>Memory usage over time</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {displayError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {displayLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-2 opacity-50" />
            <p>No file usage data available</p>
            <p className="text-xs mt-1">Start using files to see your usage patterns</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-2 overflow-x-auto">
              <div className="flex min-w-max">
                {timelineData.map((entry) => (
                  <div
                    key={entry.date}
                    className={`flex flex-col items-center p-2 cursor-pointer transition-colors ${
                      selectedDate === entry.date ? "bg-primary/10 rounded-md" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedDate(entry.date)}
                  >
                    <div className="text-xs font-medium">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    <div
                      className="w-6 bg-primary/60 rounded-sm mt-1"
                      style={{
                        height: `${Math.max(4, Math.min(60, entry.count * 3))}px`,
                      }}
                    ></div>
                    <div className="text-xs mt-1">{entry.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedDateData && (
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">
                  {new Date(selectedDateData.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedDateData.count} file {selectedDateData.count === 1 ? "interaction" : "interactions"}
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDateData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center">
                        {file.type === "directory" ? (
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        )}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">
                          {file.count} {file.count === 1 ? "interaction" : "interactions"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
