"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mem0Client, type CacheStatistics, type CacheMetrics } from "@/lib/mem0-client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, BarChart2, PieChart, LineChart, Clock, Zap, Database } from "lucide-react"
import { format } from "date-fns"

// Simple line chart component
function SimpleLineChart({
  data,
  height = 100,
  width = "100%",
  color = "#0ea5e9",
  backgroundColor = "rgba(14, 165, 233, 0.1)",
  label = "",
}: {
  data: number[]
  height?: number
  width?: string | number
  color?: string
  backgroundColor?: string
  label?: string
}) {
  if (!data.length) return <div className="text-center text-muted-foreground">No data available</div>

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="relative" style={{ height, width }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Area under the line */}
        <polygon points={`0,100 ${points} 100,100`} fill={backgroundColor} />

        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      </svg>

      {/* Label */}
      {label && <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">{label}</div>}

      {/* Min/Max values */}
      <div className="absolute top-0 right-0 text-xs text-muted-foreground">{maxValue.toFixed(2)}</div>
      <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">{minValue.toFixed(2)}</div>
    </div>
  )
}

// Metric card component
function MetricCard({
  title,
  value,
  description,
  trend = 0,
  icon,
}: {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== 0 && (
          <div className={`text-xs mt-1 flex items-center ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Cache type metrics component
function CacheTypeMetrics({
  metrics,
  title,
  color = "#0ea5e9",
  icon,
}: {
  metrics: CacheMetrics
  title: string
  color?: string
  icon?: React.ReactNode
}) {
  // Calculate recent hit rate (last 20 requests)
  const recentHitRate = useMemo(() => {
    const recentCount = 20
    const recentTimestamps = metrics.timestamps.slice(-recentCount)
    if (recentTimestamps.length === 0) return 0

    const recentHits = metrics.hitTimestamps.filter((ts) => ts >= recentTimestamps[0]).length

    return recentHits / recentTimestamps.length
  }, [metrics])

  // Calculate trend (change in hit rate)
  const hitRateTrend = useMemo(() => {
    if (metrics.totalRequests < 10) return 0
    return (recentHitRate - metrics.hitRate) * 100
  }, [metrics, recentHitRate])

  // Get response time data for chart
  const responseTimeData = useMemo(() => {
    return metrics.responseTimes.slice(-50)
  }, [metrics])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Hit Rate"
          value={`${(metrics.hitRate * 100).toFixed(1)}%`}
          description={`${metrics.hits} hits / ${metrics.totalRequests} requests`}
          trend={hitRateTrend}
          icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
        />

        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime.toFixed(2)}ms`}
          description="Lower is better"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />

        <MetricCard
          title="Cache Efficiency"
          value={
            metrics.totalRequests > 0
              ? `${((metrics.hits * metrics.avgResponseTime) / metrics.totalRequests).toFixed(2)}ms saved/req`
              : "N/A"
          }
          description="Time saved per request"
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Response Times (last 50 requests)</h4>
          <Badge variant="outline">{responseTimeData.length} data points</Badge>
        </div>
        <SimpleLineChart
          data={responseTimeData}
          height={100}
          color={color}
          backgroundColor={`${color}20`}
          label="Response time (ms)"
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Cache Hit/Miss Distribution</h4>
        <div className="flex items-center gap-2">
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${metrics.hitRate * 100}%`,
                backgroundColor: color,
              }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {metrics.hits} / {metrics.totalRequests}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CacheAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<CacheStatistics | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number>(5000)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [selectedTab, setSelectedTab] = useState<string>("overview")

  // Fetch metrics on mount and when refresh interval changes
  useEffect(() => {
    const fetchMetrics = () => {
      const currentMetrics = mem0Client.getCacheMetrics()
      setMetrics(currentMetrics)
    }

    // Initial fetch
    fetchMetrics()

    // Set up interval if auto-refresh is enabled
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh) {
      intervalId = setInterval(fetchMetrics, refreshInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [refreshInterval, autoRefresh])

  // Handle manual refresh
  const handleRefresh = () => {
    const currentMetrics = mem0Client.getCacheMetrics()
    setMetrics(currentMetrics)
  }

  // Handle reset metrics
  const handleResetMetrics = () => {
    if (window.confirm("Are you sure you want to reset all cache metrics?")) {
      mem0Client.resetCacheMetrics()
      handleRefresh()
    }
  }

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    if (!metrics) return null

    const totalHits =
      metrics.memories.hits + metrics.stats.hits + metrics.individualMemories.hits + metrics.suggestions.hits

    const totalRequests =
      metrics.memories.totalRequests +
      metrics.stats.totalRequests +
      metrics.individualMemories.totalRequests +
      metrics.suggestions.totalRequests

    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0

    const avgResponseTime =
      (metrics.memories.avgResponseTime +
        metrics.stats.avgResponseTime +
        metrics.individualMemories.avgResponseTime +
        metrics.suggestions.avgResponseTime) /
      4

    return {
      totalHits,
      totalRequests,
      overallHitRate,
      avgResponseTime,
    }
  }, [metrics])

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate time since start
  const timeSinceStart = Date.now() - metrics.startTime
  const hours = Math.floor(timeSinceStart / (1000 * 60 * 60))
  const minutes = Math.floor((timeSinceStart % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeSinceStart % (1000 * 60)) / 1000)
  const formattedTimeSinceStart = `${hours}h ${minutes}m ${seconds}s`

  // Calculate time since reset
  const timeSinceReset = Date.now() - metrics.lastReset
  const resetHours = Math.floor(timeSinceReset / (1000 * 60 * 60))
  const resetMinutes = Math.floor((timeSinceReset % (1000 * 60 * 60)) / (1000 * 60))
  const resetSeconds = Math.floor((timeSinceReset % (1000 * 60)) / 1000)
  const formattedTimeSinceReset = `${resetHours}h ${resetMinutes}m ${resetSeconds}s`

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cache Analytics Dashboard</CardTitle>
            <CardDescription>Monitoring cache performance since {formattedTimeSinceStart}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Refresh rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1 second</SelectItem>
                <SelectItem value="5000">5 seconds</SelectItem>
                <SelectItem value="10000">10 seconds</SelectItem>
                <SelectItem value="30000">30 seconds</SelectItem>
                <SelectItem value="60000">1 minute</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh now">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall metrics */}
        {overallMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Cache Requests"
              value={overallMetrics.totalRequests}
              icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
            />

            <MetricCard
              title="Overall Hit Rate"
              value={`${(overallMetrics.overallHitRate * 100).toFixed(1)}%`}
              icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
            />

            <MetricCard
              title="Avg Response Time"
              value={`${overallMetrics.avgResponseTime.toFixed(2)}ms`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />

            <MetricCard
              title="Time Since Reset"
              value={formattedTimeSinceReset}
              icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        )}

        {/* Detailed metrics by cache type */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="memories">Memories</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Hit Rate Comparison</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memories List</span>
                      <span className="text-sm font-medium">{(metrics.memories.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.memories.hitRate * 100} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Stats</span>
                      <span className="text-sm font-medium">{(metrics.stats.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.stats.hitRate * 100} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Individual Memories</span>
                      <span className="text-sm font-medium">
                        {(metrics.individualMemories.hitRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.individualMemories.hitRate * 100} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Suggestions</span>
                      <span className="text-sm font-medium">{(metrics.suggestions.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.suggestions.hitRate * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Response Time Comparison</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memories List</span>
                      <span className="text-sm font-medium">{metrics.memories.avgResponseTime.toFixed(2)}ms</span>
                    </div>
                    <SimpleLineChart
                      data={metrics.memories.responseTimes.slice(-20)}
                      height={30}
                      color="#0ea5e9"
                      backgroundColor="#0ea5e920"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Stats</span>
                      <span className="text-sm font-medium">{metrics.stats.avgResponseTime.toFixed(2)}ms</span>
                    </div>
                    <SimpleLineChart
                      data={metrics.stats.responseTimes.slice(-20)}
                      height={30}
                      color="#10b981"
                      backgroundColor="#10b98120"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Individual Memories</span>
                      <span className="text-sm font-medium">
                        {metrics.individualMemories.avgResponseTime.toFixed(2)}ms
                      </span>
                    </div>
                    <SimpleLineChart
                      data={metrics.individualMemories.responseTimes.slice(-20)}
                      height={30}
                      color="#8b5cf6"
                      backgroundColor="#8b5cf620"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Suggestions</span>
                      <span className="text-sm font-medium">{metrics.suggestions.avgResponseTime.toFixed(2)}ms</span>
                    </div>
                    <SimpleLineChart
                      data={metrics.suggestions.responseTimes.slice(-20)}
                      height={30}
                      color="#f59e0b"
                      backgroundColor="#f59e0b20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memories">
            <CacheTypeMetrics
              metrics={metrics.memories}
              title="Memories List Cache"
              color="#0ea5e9"
              icon={<LineChart className="h-5 w-5 text-sky-500" />}
            />
          </TabsContent>

          <TabsContent value="individual">
            <CacheTypeMetrics
              metrics={metrics.individualMemories}
              title="Individual Memories Cache"
              color="#8b5cf6"
              icon={<Database className="h-5 w-5 text-purple-500" />}
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <CacheTypeMetrics
              metrics={metrics.suggestions}
              title="Suggestions Cache"
              color="#f59e0b"
              icon={<Zap className="h-5 w-5 text-amber-500" />}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetMetrics}>
            Reset Metrics
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </label>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Last updated: {format(new Date(), "HH:mm:ss")}</div>
      </CardFooter>
    </Card>
  )
}
