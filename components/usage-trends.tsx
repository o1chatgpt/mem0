"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart2, TrendingUp, FileText, AlertCircle } from "lucide-react"
import { processFileUsageOverTime, type FileUsageData } from "@/lib/visualization-utils"
import { mem0Client, Mem0Error } from "@/lib/mem0-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function UsageTrends() {
  const { files = [], memoryStore } = useAppContext()
  const [fileUsageData, setFileUsageData] = useState<FileUsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14)
  const [selectedFile, setSelectedFile] = useState<FileUsageData | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Skip on server-side
    if (!isMounted) return

    const loadUsageData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try to get memories from Mem0 client first
        let memories: any[] = []

        if (mem0Client.isInitialized()) {
          try {
            const mem0Memories = await mem0Client.getMemories()
            // Convert Mem0 memories to the format expected by processFileUsageOverTime
            memories = mem0Memories.map((memory) => ({
              text: memory.content,
              timestamp: memory.createdAt,
              metadata: memory.metadata,
            }))
          } catch (err) {
            console.warn("Could not fetch memories from Mem0:", err)
            // Fall back to memory store
          }
        }

        // If no memories from Mem0, try memory store
        if (memories.length === 0 && memoryStore?.getMemories) {
          memories = memoryStore.getMemories()
        }

        // Process memories for file usage
        const usageData = processFileUsageOverTime(memories, files, timeRange)
        setFileUsageData(usageData)

        // Select the most used file by default
        if (usageData.length > 0 && !selectedFile) {
          setSelectedFile(usageData[0])
        }
      } catch (err) {
        console.error("Error loading usage data:", err)

        let errorMessage = "Failed to load usage data"
        if (err instanceof Mem0Error) {
          errorMessage = err.message
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsageData()
  }, [files, memoryStore, timeRange, selectedFile, isMounted])

  // Get max value for scaling
  const maxValue = selectedFile ? Math.max(...selectedFile.values.map((v) => v.count)) : 0

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            File Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            File Usage Trends
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={timeRange === 7 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange(7)}
            >
              7 days
            </Button>
            <Button
              variant={timeRange === 14 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange(14)}
            >
              14 days
            </Button>
            <Button
              variant={timeRange === 30 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTimeRange(30)}
            >
              30 days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : fileUsageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BarChart2 className="h-12 w-12 mb-2 opacity-50" />
            <p>No file usage data available</p>
            <p className="text-xs mt-1">Start using files to see your usage trends</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 border rounded-md p-3 h-[300px] overflow-y-auto">
              <h3 className="text-sm font-medium mb-2">Most Used Files</h3>
              <div className="space-y-2">
                {fileUsageData.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedFile?.id === file.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <div className="text-xs font-medium">{file.total}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 border rounded-md p-3">
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium truncate max-w-[250px]">{selectedFile.name}</h3>
                    <span className="text-xs text-muted-foreground">{selectedFile.total} interactions</span>
                  </div>

                  <div className="h-[240px] flex items-end">
                    {selectedFile.values.map((value, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full max-w-[20px] bg-primary/60 rounded-sm"
                          style={{
                            height: `${value.count > 0 ? Math.max(20, (value.count / maxValue) * 200) : 0}px`,
                          }}
                        ></div>
                        <div className="text-xs mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {new Date(value.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Select a file to view usage trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
