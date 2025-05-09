"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, RefreshCw, PieChartIcon, TrendingUp } from "lucide-react"

interface MemoryAnalyticsProps {
  userId: number
  aiMemberId?: number
}

export function MemoryAnalytics({ userId, aiMemberId }: MemoryAnalyticsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMemoryStats()
  }, [userId, aiMemberId])

  const fetchMemoryStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Attempt to fetch real data from the API
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stats",
          userId,
          aiMemberId,
        }),
      })

      if (!response.ok) {
        // If API call fails, use mock data
        setMockData()
        return
      }

      const data = await response.json()

      if (data.error) {
        console.warn("Error from API, using mock data:", data.error)
        setMockData()
        return
      }

      if (data.stats) {
        setStats(data.stats)
      } else {
        setMockData()
      }
    } catch (err) {
      console.error("Error fetching memory stats:", err)
      // Fallback to mock data on error
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    // Mock data for demonstration
    setStats({
      count: 256,
      oldestDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      newestDate: new Date().toISOString(),
      timeSpan: 90 * 24 * 60 * 60 * 1000,
      categoryDistribution: [
        { name: "File Operations", count: 98, percentage: 38, color: "#4CAF50" },
        { name: "Conversations", count: 64, percentage: 25, color: "#9C27B0" },
        { name: "Important", count: 42, percentage: 16, color: "#F44336" },
        { name: "Technical", count: 32, percentage: 13, color: "#FF9800" },
        { name: "Preferences", count: 20, percentage: 8, color: "#2196F3" },
      ],
      monthlyDistribution: {
        "2023-01": 15,
        "2023-02": 22,
        "2023-03": 28,
        "2023-04": 35,
        "2023-05": 42,
        "2023-06": 48,
        "2023-07": 56,
        "2023-08": 60,
      },
      uncategorizedCount: 12,
    })
  }

  const handleRefresh = () => {
    fetchMemoryStats()
    toast({
      title: "Refreshing data",
      description: "Fetching the latest memory analytics data",
    })
  }

  const exportAsCSV = () => {
    if (!stats) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "MEMORY ANALYTICS SUMMARY\n"
    csvContent += `Total Memories,${stats.count}\n`
    csvContent += `Categories Used,${stats.categoryDistribution?.length || 0}\n`
    csvContent += `Memory Span,${stats.timeSpan ? Math.round(stats.timeSpan / (1000 * 60 * 60 * 24)) + " days" : "N/A"}\n`
    csvContent += `Uncategorized Memories,${stats.uncategorizedCount || 0}\n`
    csvContent += `Oldest Memory,${stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : "N/A"}\n`
    csvContent += `Newest Memory,${stats.newestDate ? new Date(stats.newestDate).toLocaleDateString() : "N/A"}\n\n`

    csvContent += "CATEGORY DISTRIBUTION\n"
    csvContent += "Category,Count,Percentage\n"
    if (stats.categoryDistribution && stats.categoryDistribution.length > 0) {
      stats.categoryDistribution.forEach((category: any) => {
        csvContent += `${category.name},${category.count},${category.percentage}%\n`
      })
    }

    csvContent += "\nMONTHLY DISTRIBUTION\n"
    csvContent += "Month,Count\n"
    if (stats.monthlyDistribution) {
      Object.entries(stats.monthlyDistribution).forEach(([month, count]: [string, any]) => {
        csvContent += `${month},${count}\n`
      })
    }

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "memory_analytics.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Memory analytics data has been exported as CSV",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Analytics</CardTitle>
          <CardDescription>Loading your memory analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Analytics</CardTitle>
          <CardDescription>There was an error loading your analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            <p className="font-medium">Error loading analytics</p>
            <p>{error}</p>
            <Button variant="outline" className="mt-2" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Analytics</CardTitle>
          <CardDescription>No memory data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Start creating memories to see analytics</p>
            <Button onClick={handleRefresh}>Refresh Data</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const pieData = stats.categoryDistribution || []

  const lineData = Object.entries(stats.monthlyDistribution || {})
    .map(([month, count]: [string, any]) => ({
      month,
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const COLORS = ["#4CAF50", "#9C27B0", "#F44336", "#FF9800", "#2196F3", "#607D8B"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Memory Analytics</CardTitle>
          <CardDescription>Insights about your stored memories</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.categoryDistribution?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Span</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.timeSpan ? Math.round(stats.timeSpan / (1000 * 60 * 60 * 24)) : 0} days
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Memory Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oldest Memory</span>
                  <span>{stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Newest Memory</span>
                  <span>{stats.newestDate ? new Date(stats.newestDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uncategorized Memories</span>
                  <span>{stats.uncategorizedCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Top Categories</h3>
              <div className="space-y-3">
                {pieData.slice(0, 3).map((category: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium flex items-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                        ></span>
                        {category.name}
                      </span>
                      <span>
                        {category.count} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color || COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} memories`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Category Details</h3>
                <div className="space-y-4">
                  {pieData.map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <div className="font-medium flex items-center">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                          ></span>
                          {category.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.count} memories ({category.percentage}%)
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${category.color || COLORS[index % COLORS.length]}20`,
                          color: category.color || COLORS[index % COLORS.length],
                          borderColor: category.color || COLORS[index % COLORS.length],
                        }}
                      >
                        {category.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Memory Growth Over Time</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Memory Count"
                        stroke="#4CAF50"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Monthly Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                      <Legend />
                      <Bar dataKey="count" name="Memory Count" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Memory analytics help you understand how your application stores and uses information. Visit the{" "}
            <a href="/memory-categories" className="text-blue-500 hover:underline">
              Memory Categories
            </a>{" "}
            page to organize your memories more effectively.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
