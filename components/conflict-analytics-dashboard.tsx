"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, PieChart, DonutChart, AreaChart } from "./charts"
import { Clock, AlertTriangle, CheckCircle, RefreshCw, User, FileIcon, Zap } from "lucide-react"
import type { ConflictAnalytics, ConflictTimelineItem, UserConflictStats } from "@/lib/conflict-analytics-service"
import type { ResolutionStrategy } from "@/lib/intelligent-conflict-service"

// Mock data for initial render
const emptyAnalytics: ConflictAnalytics = {
  summary: {
    totalConflicts: 0,
    resolvedConflicts: 0,
    resolutionRate: 0,
    averageResolutionTime: 0,
  },
  byTime: {
    period: "day",
    conflicts: [],
  },
  byUser: [],
  byDocument: [],
  byStrategy: [],
}

const strategyLabels: Record<ResolutionStrategy, string> = {
  "accept-newest": "Accept Newest",
  "accept-oldest": "Accept Oldest",
  "prefer-user": "Prefer User",
  "merge-changes": "Merge Changes",
  "smart-merge": "Smart Merge",
  manual: "Manual Resolution",
}

const strategyColors: Record<ResolutionStrategy, string> = {
  "accept-newest": "#3b82f6", // blue
  "accept-oldest": "#8b5cf6", // purple
  "prefer-user": "#10b981", // green
  "merge-changes": "#f59e0b", // amber
  "smart-merge": "#ef4444", // red
  manual: "#6b7280", // gray
}

interface ConflictAnalyticsDashboardProps {
  userId?: string
  documentId?: string
}

export function ConflictAnalyticsDashboard({ userId, documentId }: ConflictAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<ConflictAnalytics>(emptyAnalytics)
  const [timeline, setTimeline] = useState<ConflictTimelineItem[]>([])
  const [userStats, setUserStats] = useState<UserConflictStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(documentId)

  // Fetch analytics data
  const fetchData = async () => {
    setLoading(true)
    try {
      // In a real implementation, these would be API calls
      const response = await fetch(
        `/api/conflict-analytics?timeRange=${timeRange}${selectedUserId ? `&userId=${selectedUserId}` : ""}${selectedDocumentId ? `&documentId=${selectedDocumentId}` : ""}`,
      )
      const data = await response.json()
      setAnalytics(data)

      // Fetch timeline data
      const timelineResponse = await fetch(
        `/api/conflict-timeline?timeRange=${timeRange}${selectedUserId ? `&userId=${selectedUserId}` : ""}${selectedDocumentId ? `&documentId=${selectedDocumentId}` : ""}`,
      )
      const timelineData = await timelineResponse.json()
      setTimeline(timelineData)

      // Fetch user stats if a user is selected
      if (selectedUserId) {
        const userStatsResponse = await fetch(`/api/user-conflict-stats?userId=${selectedUserId}`)
        const userStatsData = await userStatsResponse.json()
        setUserStats(userStatsData)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // Use mock data for demo purposes
      setAnalytics(getMockAnalytics())
      setTimeline(getMockTimeline())
      if (selectedUserId) {
        setUserStats(getMockUserStats(selectedUserId))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, selectedUserId, selectedDocumentId])

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  // Generate chart data for conflicts over time
  const getTimeChartData = () => {
    return analytics.byTime.conflicts.map((item) => ({
      name: item.date,
      total: item.count,
      resolved: item.resolved,
    }))
  }

  // Generate chart data for conflicts by user
  const getUserChartData = () => {
    return analytics.byUser.slice(0, 5).map((user) => ({
      name: user.userName,
      value: user.conflictsCreated,
    }))
  }

  // Generate chart data for resolution strategies
  const getStrategyChartData = () => {
    return analytics.byStrategy.map((strategy) => ({
      name: strategyLabels[strategy.strategy],
      value: strategy.count,
      color: strategyColors[strategy.strategy],
    }))
  }

  // Generate chart data for document hotspots
  const getHotspotChartData = () => {
    if (analytics.byDocument.length === 0) return []

    // Get the document with the most conflicts
    const topDocument = analytics.byDocument[0]

    return topDocument.hotspots.map((hotspot) => ({
      name: hotspot.section,
      value: hotspot.conflicts,
    }))
  }

  // Mock data generators for demo purposes
  const getMockAnalytics = (): ConflictAnalytics => {
    return {
      summary: {
        totalConflicts: 87,
        resolvedConflicts: 72,
        resolutionRate: 0.83,
        averageResolutionTime: 18,
      },
      byTime: {
        period: "day",
        conflicts: [
          { date: "Apr 1", count: 5, resolved: 4 },
          { date: "Apr 2", count: 8, resolved: 7 },
          { date: "Apr 3", count: 12, resolved: 9 },
          { date: "Apr 4", count: 7, resolved: 6 },
          { date: "Apr 5", count: 10, resolved: 8 },
          { date: "Apr 6", count: 15, resolved: 12 },
          { date: "Apr 7", count: 9, resolved: 8 },
          { date: "Apr 8", count: 6, resolved: 5 },
          { date: "Apr 9", count: 8, resolved: 7 },
          { date: "Apr 10", count: 7, resolved: 6 },
        ],
      },
      byUser: [
        {
          userId: "user1",
          userName: "John Smith",
          conflictsCreated: 24,
          conflictsResolved: 18,
          averageResolutionTime: 15,
          preferredStrategy: "smart-merge",
        },
        {
          userId: "user2",
          userName: "Emma Johnson",
          conflictsCreated: 18,
          conflictsResolved: 22,
          averageResolutionTime: 12,
          preferredStrategy: "accept-newest",
        },
        {
          userId: "user3",
          userName: "Michael Brown",
          conflictsCreated: 15,
          conflictsResolved: 10,
          averageResolutionTime: 25,
          preferredStrategy: "manual",
        },
        {
          userId: "user4",
          userName: "Sarah Davis",
          conflictsCreated: 12,
          conflictsResolved: 8,
          averageResolutionTime: 20,
          preferredStrategy: "prefer-user",
        },
        {
          userId: "user5",
          userName: "David Wilson",
          conflictsCreated: 10,
          conflictsResolved: 14,
          averageResolutionTime: 10,
          preferredStrategy: "merge-changes",
        },
      ],
      byDocument: [
        {
          documentId: "doc1",
          documentName: "Project Proposal",
          conflicts: 22,
          resolved: 18,
          hotspots: [
            { section: "Executive Summary", conflicts: 8 },
            { section: "Budget", conflicts: 6 },
            { section: "Timeline", conflicts: 4 },
            { section: "Resources", conflicts: 3 },
            { section: "Risks", conflicts: 1 },
          ],
        },
        {
          documentId: "doc2",
          documentName: "Technical Specification",
          conflicts: 18,
          resolved: 15,
          hotspots: [
            { section: "API Design", conflicts: 7 },
            { section: "Database Schema", conflicts: 5 },
            { section: "Authentication", conflicts: 3 },
            { section: "Performance", conflicts: 2 },
            { section: "Security", conflicts: 1 },
          ],
        },
        {
          documentId: "doc3",
          documentName: "Marketing Plan",
          conflicts: 15,
          resolved: 12,
          hotspots: [
            { section: "Target Audience", conflicts: 6 },
            { section: "Budget Allocation", conflicts: 4 },
            { section: "Campaign Timeline", conflicts: 3 },
            { section: "Metrics", conflicts: 1 },
            { section: "Competitors", conflicts: 1 },
          ],
        },
      ],
      byStrategy: [
        {
          strategy: "smart-merge",
          count: 28,
          averageResolutionTime: 15,
          successRate: 0.85,
        },
        {
          strategy: "accept-newest",
          count: 18,
          averageResolutionTime: 8,
          successRate: 0.78,
        },
        {
          strategy: "manual",
          count: 12,
          averageResolutionTime: 35,
          successRate: 0.92,
        },
        {
          strategy: "prefer-user",
          count: 8,
          averageResolutionTime: 12,
          successRate: 0.75,
        },
        {
          strategy: "merge-changes",
          count: 6,
          averageResolutionTime: 20,
          successRate: 0.83,
        },
        {
          strategy: "accept-oldest",
          count: 0,
          averageResolutionTime: 0,
          successRate: 0,
        },
      ],
    }
  }

  const getMockTimeline = (): ConflictTimelineItem[] => {
    return [
      {
        id: "conflict1",
        documentId: "doc1",
        documentName: "Project Proposal",
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        users: ["John Smith", "Emma Johnson"],
        severity: "high",
        resolved: true,
        resolutionTime: 15,
        strategy: "smart-merge",
      },
      {
        id: "conflict2",
        documentId: "doc2",
        documentName: "Technical Specification",
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        users: ["Michael Brown", "Sarah Davis"],
        severity: "medium",
        resolved: true,
        resolutionTime: 22,
        strategy: "manual",
      },
      {
        id: "conflict3",
        documentId: "doc1",
        documentName: "Project Proposal",
        timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
        users: ["John Smith", "David Wilson"],
        severity: "low",
        resolved: true,
        resolutionTime: 10,
        strategy: "accept-newest",
      },
      {
        id: "conflict4",
        documentId: "doc3",
        documentName: "Marketing Plan",
        timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
        users: ["Emma Johnson", "Sarah Davis"],
        severity: "medium",
        resolved: false,
      },
      {
        id: "conflict5",
        documentId: "doc2",
        documentName: "Technical Specification",
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 24 hours ago
        users: ["Michael Brown", "John Smith"],
        severity: "high",
        resolved: true,
        resolutionTime: 30,
        strategy: "prefer-user",
      },
    ]
  }

  const getMockUserStats = (userId: string): UserConflictStats => {
    return {
      userId,
      userName: "John Smith",
      totalEdits: 156,
      totalConflicts: 24,
      conflictRate: 0.15,
      collaborators: [
        {
          userId: "user2",
          userName: "Emma Johnson",
          conflicts: 10,
          resolutionRate: 0.8,
        },
        {
          userId: "user3",
          userName: "Michael Brown",
          conflicts: 8,
          resolutionRate: 0.75,
        },
        {
          userId: "user5",
          userName: "David Wilson",
          conflicts: 6,
          resolutionRate: 0.83,
        },
      ],
      preferredResolutions: {
        "accept-newest": 5,
        "accept-oldest": 1,
        "prefer-user": 3,
        "merge-changes": 2,
        "smart-merge": 7,
        manual: 0,
      },
    }
  }

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Get severity badge color
  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Conflict Analytics Dashboard</h2>
          <p className="text-muted-foreground">Analyze collaboration patterns and conflict resolution statistics</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last 365 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.totalConflicts}</div>
                    <p className="text-xs text-muted-foreground">{analytics.summary.resolvedConflicts} resolved</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(analytics.summary.resolutionRate)}</div>
                    <Progress value={analytics.summary.resolutionRate * 100} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.averageResolutionTime} min</div>
                    <p className="text-xs text-muted-foreground">From detection to resolution</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Strategy</CardTitle>
                    <Zap className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.byStrategy.length > 0 ? strategyLabels[analytics.byStrategy[0].strategy] : "None"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.byStrategy.length > 0
                        ? `${formatPercentage(analytics.byStrategy[0].successRate)} success rate`
                        : "No data available"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conflicts Over Time</CardTitle>
                    <CardDescription>Total conflicts and resolutions by {analytics.byTime.period}</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <AreaChart
                      data={getTimeChartData()}
                      index="name"
                      categories={["total", "resolved"]}
                      colors={["#f59e0b", "#10b981"]}
                      valueFormatter={(value) => `${value} conflicts`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Conflict Sources</CardTitle>
                    <CardDescription>Users and documents with the most conflicts</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Users</h4>
                        <PieChart
                          data={getUserChartData()}
                          index="name"
                          category="value"
                          valueFormatter={(value) => `${value} conflicts`}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Documents</h4>
                        <PieChart
                          data={analytics.byDocument.slice(0, 5).map((doc) => ({
                            name: doc.documentName,
                            value: doc.conflicts,
                          }))}
                          index="name"
                          category="value"
                          valueFormatter={(value) => `${value} conflicts`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>Automatically generated insights from your conflict data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.summary.resolutionRate > 0.8 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>High Resolution Rate</AlertTitle>
                        <AlertDescription>
                          Your team resolves {formatPercentage(analytics.summary.resolutionRate)} of conflicts, which is
                          excellent.
                        </AlertDescription>
                      </Alert>
                    )}

                    {analytics.byDocument.length > 0 && analytics.byDocument[0].hotspots.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Conflict Hotspot Detected</AlertTitle>
                        <AlertDescription>
                          The "{analytics.byDocument[0].hotspots[0].section}" section in "
                          {analytics.byDocument[0].documentName}" has {analytics.byDocument[0].hotspots[0].conflicts}{" "}
                          conflicts. Consider coordinating edits in this area.
                        </AlertDescription>
                      </Alert>
                    )}

                    {analytics.byStrategy.length > 0 && analytics.byStrategy[0].successRate > 0.8 && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertTitle>Effective Resolution Strategy</AlertTitle>
                        <AlertDescription>
                          The "{strategyLabels[analytics.byStrategy[0].strategy]}" strategy has a
                          {formatPercentage(analytics.byStrategy[0].successRate)} success rate. Consider using this
                          strategy more often.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Conflict Metrics</CardTitle>
                      <CardDescription>Conflicts created and resolved by user</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <BarChart
                        data={analytics.byUser}
                        index="userName"
                        categories={["conflictsCreated", "conflictsResolved"]}
                        colors={["#f59e0b", "#10b981"]}
                        valueFormatter={(value) => `${value} conflicts`}
                        layout="vertical"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time</CardTitle>
                      <CardDescription>Average time to resolve conflicts</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <BarChart
                        data={analytics.byUser.slice(0, 5)}
                        index="userName"
                        categories={["averageResolutionTime"]}
                        colors={["#3b82f6"]}
                        valueFormatter={(value) => `${value} min`}
                        layout="vertical"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* User Details */}
              {selectedUserId && userStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile: {userStats.userName}</CardTitle>
                    <CardDescription>Detailed conflict statistics and patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-4">Conflict Statistics</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Conflict Rate</span>
                              <span className="font-medium">{formatPercentage(userStats.conflictRate)}</span>
                            </div>
                            <Progress value={userStats.conflictRate * 100} className="h-2 mt-1" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Total Edits</div>
                              <div className="text-2xl font-bold">{userStats.totalEdits}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Total Conflicts</div>
                              <div className="text-2xl font-bold">{userStats.totalConflicts}</div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">Preferred Resolution Strategies</h5>
                            <div className="space-y-2">
                              {Object.entries(userStats.preferredResolutions)
                                .sort(([, a], [, b]) => b - a)
                                .filter(([, count]) => count > 0)
                                .map(([strategy, count]) => (
                                  <div key={strategy} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: strategyColors[strategy as ResolutionStrategy] }}
                                      ></div>
                                      <span className="text-sm">{strategyLabels[strategy as ResolutionStrategy]}</span>
                                    </div>
                                    <span className="text-sm font-medium">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-4">Collaboration Network</h4>
                        <div className="space-y-4">
                          {userStats.collaborators.map((collaborator) => (
                            <div key={collaborator.userId} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{collaborator.userName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {collaborator.conflicts} conflicts
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  {formatPercentage(collaborator.resolutionRate)}
                                </div>
                                <div className="text-xs text-muted-foreground">resolution rate</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User List */}
              <Card>
                <CardHeader>
                  <CardTitle>User List</CardTitle>
                  <CardDescription>Select a user to view detailed statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.byUser.map((user) => (
                      <div
                        key={user.userId}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                          selectedUserId === user.userId ? "bg-gray-100" : ""
                        }`}
                        onClick={() => setSelectedUserId(user.userId)}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{user.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.conflictsCreated} conflicts, {user.conflictsResolved} resolved
                            </div>
                          </div>
                        </div>
                        <Badge>{strategyLabels[user.preferredStrategy]}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* Document Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Conflict Metrics</CardTitle>
                      <CardDescription>Conflicts by document</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <BarChart
                        data={analytics.byDocument}
                        index="documentName"
                        categories={["conflicts", "resolved"]}
                        colors={["#f59e0b", "#10b981"]}
                        valueFormatter={(value) => `${value} conflicts`}
                        layout="vertical"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Conflict Hotspots</CardTitle>
                      <CardDescription>Sections with the most conflicts</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <DonutChart
                        data={getHotspotChartData()}
                        category="value"
                        index="name"
                        valueFormatter={(value) => `${value} conflicts`}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Document List */}
              <Card>
                <CardHeader>
                  <CardTitle>Document List</CardTitle>
                  <CardDescription>Select a document to view detailed statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.byDocument.map((doc) => (
                      <div
                        key={doc.documentId}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                          selectedDocumentId === doc.documentId ? "bg-gray-100" : ""
                        }`}
                        onClick={() => setSelectedDocumentId(doc.documentId)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                              <FileIcon className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">{doc.documentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {doc.conflicts} conflicts, {doc.resolved} resolved
                              </div>
                            </div>
                          </div>
                          <div>
                            <Progress value={(doc.resolved / doc.conflicts) * 100} className="h-2 w-24" />
                            <div className="text-xs text-right mt-1">
                              {formatPercentage(doc.resolved / doc.conflicts)} resolved
                            </div>
                          </div>
                        </div>

                        {selectedDocumentId === doc.documentId && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Conflict Hotspots</h4>
                            <div className="space-y-2">
                              {doc.hotspots.map((hotspot) => (
                                <div key={hotspot.section} className="flex justify-between items-center">
                                  <div className="text-sm">{hotspot.section}</div>
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium mr-2">{hotspot.conflicts}</div>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(hotspot.conflicts / doc.conflicts) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              {/* Strategy Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Strategies</CardTitle>
                      <CardDescription>Usage and effectiveness of different resolution strategies</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <BarChart
                        data={analytics.byStrategy}
                        index="strategy"
                        categories={["count"]}
                        colors={["#8b5cf6"]}
                        valueFormatter={(value) => `${value} conflicts`}
                        layout="vertical"
                        customTooltip={(props) => {
                          const { payload, active } = props
                          if (!active || !payload || !payload.length) return null

                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <div className="font-medium">{strategyLabels[data.strategy]}</div>
                              <div className="text-sm">Count: {data.count}</div>
                              <div className="text-sm">Success Rate: {formatPercentage(data.successRate)}</div>
                              <div className="text-sm">Avg Time: {data.averageResolutionTime} min</div>
                            </div>
                          )
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Strategy Success Rate</CardTitle>
                      <CardDescription>Percentage of conflicts successfully resolved</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <DonutChart
                        data={analytics.byStrategy.map((strategy) => ({
                          name: strategyLabels[strategy.strategy],
                          value: strategy.successRate * 100,
                          color: strategyColors[strategy.strategy],
                        }))}
                        category="value"
                        index="name"
                        valueFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Strategy Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Comparison</CardTitle>
                  <CardDescription>Detailed metrics for each resolution strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Strategy</th>
                          <th className="text-left py-3 px-4">Usage</th>
                          <th className="text-left py-3 px-4">Success Rate</th>
                          <th className="text-left py-3 px-4">Avg. Resolution Time</th>
                          <th className="text-left py-3 px-4">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.byStrategy.map((strategy) => (
                          <tr key={strategy.strategy} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: strategyColors[strategy.strategy] }}
                                ></div>
                                <span>{strategyLabels[strategy.strategy]}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {strategy.count} conflicts
                              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${(strategy.count / analytics.summary.resolvedConflicts) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {formatPercentage(strategy.successRate)}
                              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className={`h-2 rounded-full ${
                                    strategy.successRate > 0.8
                                      ? "bg-green-500"
                                      : strategy.successRate > 0.5
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${strategy.successRate * 100}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{strategy.averageResolutionTime} min</td>
                            <td className="py-3 px-4">
                              {strategy.successRate > 0.8 ? (
                                <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                              ) : strategy.successRate > 0.5 ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Consider</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Avoid</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Insights</CardTitle>
                  <CardDescription>
                    AI-generated recommendations based on your conflict resolution patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.byStrategy.length > 0 && analytics.byStrategy[0].successRate > 0.8 && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle>Effective Strategy</AlertTitle>
                        <AlertDescription>
                          The "{strategyLabels[analytics.byStrategy[0].strategy]}" strategy has been highly effective
                          with a {formatPercentage(analytics.byStrategy[0].successRate)} success rate. Continue using
                          this approach for similar conflicts.
                        </AlertDescription>
                      </Alert>
                    )}

                    {analytics.byStrategy.some((s) => s.successRate < 0.5 && s.count > 5) && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertTitle>Ineffective Strategy</AlertTitle>
                        <AlertDescription>
                          {(() => {
                            const ineffectiveStrategy = analytics.byStrategy.find(
                              (s) => s.successRate < 0.5 && s.count > 5,
                            )
                            return ineffectiveStrategy
                              ? `The "${strategyLabels[ineffectiveStrategy.strategy]}" strategy has a low success rate of ${formatPercentage(ineffectiveStrategy.successRate)}. Consider alternative approaches for these conflicts.`
                              : ""
                          })()}
                        </AlertDescription>
                      </Alert>
                    )}

                    {analytics.byStrategy.some((s) => s.averageResolutionTime < 10 && s.successRate > 0.7) && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <AlertTitle>Time-Efficient Strategy</AlertTitle>
                        <AlertDescription>
                          {(() => {
                            const efficientStrategy = analytics.byStrategy.find(
                              (s) => s.averageResolutionTime < 10 && s.successRate > 0.7,
                            )
                            return efficientStrategy
                              ? `The "${strategyLabels[efficientStrategy.strategy]}" strategy resolves conflicts quickly (${efficientStrategy.averageResolutionTime} min) with good results. Consider this approach when time is a factor.`
                              : ""
                          })()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Conflict Timeline</CardTitle>
                  <CardDescription>Chronological view of conflicts and resolutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timeline.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No conflicts found in the selected time range
                      </div>
                    ) : (
                      timeline.map((item, index) => (
                        <div key={item.id} className="relative pl-8">
                          {/* Timeline connector */}
                          {index < timeline.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                          )}

                          {/* Timeline dot */}
                          <div
                            className={`absolute left-0 top-1.5 h-6 w-6 rounded-full flex items-center justify-center ${
                              item.severity === "high"
                                ? "bg-red-100"
                                : item.severity === "medium"
                                  ? "bg-yellow-100"
                                  : "bg-blue-100"
                            }`}
                          >
                            <AlertTriangle
                              className={`h-3 w-3 ${
                                item.severity === "high"
                                  ? "text-red-500"
                                  : item.severity === "medium"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{item.documentName}</h4>
                                <p className="text-sm text-muted-foreground">{formatTime(item.timestamp)}</p>
                              </div>
                              <Badge className={getSeverityColor(item.severity)}>
                                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.users.map((user, i) => (
                                <div key={i} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  {user}
                                </div>
                              ))}
                            </div>

                            {item.resolved ? (
                              <div className="bg-green-50 rounded p-3 text-sm">
                                <div className="flex justify-between">
                                  <div className="flex items-center text-green-700">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolved
                                  </div>
                                  <div className="text-muted-foreground">{item.resolutionTime} min</div>
                                </div>
                                {item.strategy && (
                                  <div className="mt-2 flex items-center">
                                    <div
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: strategyColors[item.strategy] }}
                                    ></div>
                                    <span>{strategyLabels[item.strategy]}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-yellow-50 rounded p-3 text-sm flex items-center text-yellow-700">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Unresolved
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
