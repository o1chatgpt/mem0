"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Activity,
  BarChart,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  PauseCircle,
  PlayCircle,
} from "lucide-react"
import { performanceMonitor, type PerformanceMetric } from "@/lib/performance-monitor"

// Define time range options
const TIME_RANGES = [
  { label: "Last 5 minutes", value: 5 * 60 * 1000 },
  { label: "Last 15 minutes", value: 15 * 60 * 1000 },
  { label: "Last 30 minutes", value: 30 * 60 * 1000 },
  { label: "Last hour", value: 60 * 60 * 1000 },
  { label: "All time", value: 0 },
]

export default function MemoryPerformancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("realtime")
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [timeRange, setTimeRange] = useState<number>(TIME_RANGES[0].value)
  const [isRecording, setIsRecording] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Subscribe to performance metrics updates
  useEffect(() => {
    const removeListener = performanceMonitor.addListener((updatedMetrics) => {
      setMetrics(updatedMetrics)
    })

    // Initial load of metrics
    setMetrics(performanceMonitor.getMetrics())

    return () => {
      removeListener()
    }
  }, [refreshKey])

  // Filter metrics by time range
  const filteredMetrics = useMemo(() => {
    if (timeRange === 0) return metrics

    const now = Date.now()
    const cutoff = now - timeRange
    return metrics.filter((metric) => metric.startTime >= cutoff)
  }, [metrics, timeRange])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Group metrics by operation type
    const operationTypes = new Set(filteredMetrics.map((metric) => metric.operationType))

    return Array.from(operationTypes)
      .map((operationType) => {
        const typeMetrics = filteredMetrics.filter((metric) => metric.operationType === operationType)
        const count = typeMetrics.length
        const totalDuration = typeMetrics.reduce((sum, metric) => sum + metric.duration, 0)
        const durations = typeMetrics.map((metric) => metric.duration)
        const successCount = typeMetrics.filter((metric) => metric.success).length

        return {
          operationType,
          count,
          totalDuration,
          averageDuration: count > 0 ? totalDuration / count : 0,
          minDuration: count > 0 ? Math.min(...durations) : 0,
          maxDuration: count > 0 ? Math.max(...durations) : 0,
          successRate: count > 0 ? (successCount / count) * 100 : 100,
          errorCount: count - successCount,
        }
      })
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [filteredMetrics])

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalOperations = filteredMetrics.length
    const totalDuration = filteredMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    const successCount = filteredMetrics.filter((metric) => metric.success).length
    const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0

    return {
      totalOperations,
      totalDuration,
      averageDuration,
      successRate: totalOperations > 0 ? (successCount / totalOperations) * 100 : 100,
      errorCount: totalOperations - successCount,
    }
  }, [filteredMetrics])

  // Toggle recording state
  const toggleRecording = () => {
    const newState = !isRecording
    setIsRecording(newState)
    performanceMonitor.setRecording(newState)
  }

  // Clear all metrics
  const clearMetrics = () => {
    if (confirm("Are you sure you want to clear all performance metrics? This action cannot be undone.")) {
      performanceMonitor.clearMetrics()
      setRefreshKey((prev) => prev + 1)
    }
  }

  // Format duration in milliseconds to a readable string
  const formatDuration = (ms: number) => {
    if (ms < 1) return "< 1 ms"
    if (ms < 1000) return `${ms.toFixed(1)} ms`
    return `${(ms / 1000).toFixed(2)} s`
  }

  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // Get color class based on duration
  const getDurationColorClass = (duration: number) => {
    if (duration < 50) return "text-green-600"
    if (duration < 200) return "text-yellow-600"
    return "text-red-600"
  }

  // Get color class based on success rate
  const getSuccessRateColorClass = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings/mem0")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mem0 Settings
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <Activity className="h-8 w-8 mr-2 text-primary" />
          Memory Performance Monitor
        </h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number.parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value.toString()}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant={isRecording ? "default" : "outline"} className="ml-2">
            {isRecording ? (
              <>
                <Zap className="h-3 w-3 mr-1" /> Recording
              </>
            ) : (
              <>
                <PauseCircle className="h-3 w-3 mr-1" /> Paused
              </>
            )}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleRecording} size="sm">
            {isRecording ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" /> Pause Recording
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" /> Resume Recording
              </>
            )}
          </Button>

          <Button variant="outline" onClick={clearMetrics} size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Clear Metrics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="realtime">
            <Activity className="h-4 w-4 mr-2" />
            Real-time Monitor
          </TabsTrigger>
          <TabsTrigger value="summary">
            <BarChart className="h-4 w-4 mr-2" />
            Performance Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Real-time Memory Operations
              </CardTitle>
              <CardDescription>
                Monitor memory operations as they happen. Showing {filteredMetrics.length} operations
                {timeRange > 0
                  ? ` in the last ${TIME_RANGES.find((r) => r.value === timeRange)?.label.toLowerCase()}`
                  : ""}
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMetrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No memory operations recorded in the selected time range.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{overallStats.totalOperations}</div>
                        <p className="text-sm text-muted-foreground">Total Operations</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className={`text-2xl font-bold ${getDurationColorClass(overallStats.averageDuration)}`}>
                          {formatDuration(overallStats.averageDuration)}
                        </div>
                        <p className="text-sm text-muted-foreground">Average Duration</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className={`text-2xl font-bold ${getSuccessRateColorClass(overallStats.successRate)}`}>
                          {overallStats.successRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-500">{overallStats.errorCount}</div>
                        <p className="text-sm text-muted-foreground">Error Count</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-3">Operation</div>
                      <div className="col-span-2">Time</div>
                      <div className="col-span-2">Duration</div>
                      <div className="col-span-3">Status</div>
                      <div className="col-span-2">Details</div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {filteredMetrics
                        .sort((a, b) => b.startTime - a.startTime)
                        .slice(0, 100)
                        .map((metric, index) => (
                          <div key={metric.operationId} className="grid grid-cols-12 gap-4 p-3 text-sm border-t">
                            <div className="col-span-3 font-medium truncate">{metric.operationType}</div>
                            <div className="col-span-2 text-muted-foreground">{formatTimestamp(metric.startTime)}</div>
                            <div className={`col-span-2 ${getDurationColorClass(metric.duration)}`}>
                              {formatDuration(metric.duration)}
                            </div>
                            <div className="col-span-3">
                              {metric.success ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Success
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" /> Error
                                </span>
                              )}
                            </div>
                            <div className="col-span-2 text-muted-foreground truncate">
                              {metric.error || (metric.metadata ? Object.keys(metric.metadata).join(", ") : "")}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {filteredMetrics.length > 100 && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Showing 100 of {filteredMetrics.length} operations. Use the summary tab to see all data.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Performance Summary
              </CardTitle>
              <CardDescription>
                Summary statistics for memory operations
                {timeRange > 0
                  ? ` in the last ${TIME_RANGES.find((r) => r.value === timeRange)?.label.toLowerCase()}`
                  : ""}
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No memory operations recorded in the selected time range.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summaryStats.map((stat) => (
                      <Card key={stat.operationType}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{stat.operationType}</CardTitle>
                          <CardDescription>{stat.count} operations</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Average Duration</span>
                                <span className={getDurationColorClass(stat.averageDuration)}>
                                  {formatDuration(stat.averageDuration)}
                                </span>
                              </div>
                              <Progress value={Math.min(100, (stat.averageDuration / 500) * 100)} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Min:</span>{" "}
                                <span className="font-medium">{formatDuration(stat.minDuration)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Max:</span>{" "}
                                <span className="font-medium">{formatDuration(stat.maxDuration)}</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Success Rate</span>
                                <span className={getSuccessRateColorClass(stat.successRate)}>
                                  {stat.successRate.toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={stat.successRate} className="h-2" />
                            </div>

                            {stat.errorCount > 0 && (
                              <div className="text-sm text-red-600">
                                {stat.errorCount} error{stat.errorCount !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Comparison</CardTitle>
                      <CardDescription>Average duration by operation type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {summaryStats.map((stat) => (
                          <div key={`chart-${stat.operationType}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{stat.operationType}</span>
                              <span className={getDurationColorClass(stat.averageDuration)}>
                                {formatDuration(stat.averageDuration)}
                              </span>
                            </div>
                            <div className="h-8 w-full bg-muted rounded-md overflow-hidden">
                              <div
                                className={`h-full ${getDurationColorClass(
                                  stat.averageDuration,
                                )} bg-primary/20 rounded-md`}
                                style={{
                                  width: `${Math.min(100, (stat.averageDuration / 500) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setRefreshKey((prev) => prev + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
