"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Tag, Calendar, Clock, BrainCircuit, Download, FileText, FileSpreadsheet } from "lucide-react"
import { exportAsCSV, exportAsPDF, prepareAnalyticsDataForExport } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"

interface MemoryAnalyticsProps {
  userId: number
  aiMemberId?: number
}

type CategoryStat = {
  name: string
  count: number
  percentage: number
  color: string
}

type MonthlyData = {
  month: string
  count: number
}

export function MemoryAnalytics({ userId, aiMemberId }: MemoryAnalyticsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [exportLoading, setExportLoading] = useState<"csv" | "pdf" | null>(null)

  useEffect(() => {
    fetchStats()
  }, [userId, aiMemberId])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stats",
          userId,
          aiMemberId,
        }),
      })

      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)

        // Format monthly data for chart
        const monthlyData = Object.entries(data.stats.monthlyDistribution || {})
          .map(([month, count]) => {
            const [year, monthNum] = month.split("-")
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const displayMonth = `${monthNames[Number.parseInt(monthNum) - 1]} ${year}`
            return {
              month: displayMonth,
              count: count as number,
            }
          })
          .sort((a, b) => {
            // Sort by date (assuming format is "MMM YYYY")
            const [aMonth, aYear] = a.month.split(" ")
            const [bMonth, bYear] = b.month.split(" ")

            if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)

            const monthOrder = {
              Jan: 0,
              Feb: 1,
              Mar: 2,
              Apr: 3,
              May: 4,
              Jun: 5,
              Jul: 6,
              Aug: 7,
              Sep: 8,
              Oct: 9,
              Nov: 10,
              Dec: 11,
            }
            return monthOrder[aMonth as keyof typeof monthOrder] - monthOrder[bMonth as keyof typeof monthOrder]
          })

        setMonthlyData(monthlyData)
      }
    } catch (error) {
      console.error("Error fetching memory stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSpan = (timeSpan: number) => {
    const days = Math.floor(timeSpan / (1000 * 60 * 60 * 24))
    if (days > 30) {
      const months = Math.floor(days / 30)
      return `${months} month${months !== 1 ? "s" : ""}`
    }
    return `${days} day${days !== 1 ? "s" : ""}`
  }

  const handleExportCSV = async () => {
    if (!stats) return

    try {
      setExportLoading("csv")
      const analyticsData = prepareAnalyticsDataForExport(stats)

      // Generate filename with date and AI member if applicable
      const date = new Date().toISOString().split("T")[0]
      const aiMemberSuffix = aiMemberId ? `-ai-${aiMemberId}` : ""
      const fileName = `memory-analytics-${date}${aiMemberSuffix}`

      exportAsCSV(analyticsData, fileName)

      toast({
        title: "Export Successful",
        description: "Memory analytics data has been exported as CSV",
      })
    } catch (error) {
      console.error("Error exporting as CSV:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(null)
    }
  }

  const handleExportPDF = async () => {
    if (!stats) return

    try {
      setExportLoading("pdf")
      const analyticsData = prepareAnalyticsDataForExport(stats)

      // Generate filename with date and AI member if applicable
      const date = new Date().toISOString().split("T")[0]
      const aiMemberSuffix = aiMemberId ? `-ai-${aiMemberId}` : ""
      const fileName = `memory-analytics-${date}${aiMemberSuffix}`

      exportAsPDF(analyticsData, fileName)

      toast({
        title: "Export Successful",
        description: "Memory analytics data has been exported as PDF",
      })
    } catch (error) {
      console.error("Error exporting as PDF:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(null)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-sm">
          <p className="font-medium">
            {payload[0].name}: {payload[0].value}
          </p>
          <p className="text-sm text-muted-foreground">{payload[0].payload.percentage}% of total</p>
        </div>
      )
    }
    return null
  }

  const MonthlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-sm">
          <p className="font-medium">{payload[0].payload.month}</p>
          <p className="text-sm">Memories: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading analytics...</div>
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
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No memory data available for analysis.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" />
          Memory Analytics
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exportLoading !== null}>
              <Download className="mr-2 h-4 w-4" />
              {exportLoading === "csv" ? "Exporting CSV..." : exportLoading === "pdf" ? "Exporting PDF..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV} disabled={exportLoading !== null}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} disabled={exportLoading !== null}>
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{stats.count}</div>
            <div className="text-sm text-muted-foreground">Total Memories</div>
          </div>
          <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              <div className="text-3xl font-bold">{stats.categoryDistribution.length}</div>
            </div>
            <div className="text-sm text-muted-foreground">Categories Used</div>
          </div>
          <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <div className="text-3xl font-bold">{stats.timeSpan ? formatTimeSpan(stats.timeSpan) : "N/A"}</div>
            </div>
            <div className="text-sm text-muted-foreground">Memory Span</div>
          </div>
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">
              <Tag className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="mr-2 h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                {stats.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {stats.categoryDistribution.map((entry: CategoryStat, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No category data available
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-3">Category Distribution</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {stats.categoryDistribution.map((category: CategoryStat) => (
                    <div key={category.name} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                        <span>{category.name || "Uncategorized"}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          {category.count}
                        </Badge>
                        <Badge
                          style={{
                            backgroundColor: category.color,
                            color: "white",
                          }}
                        >
                          {category.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="h-80">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<MonthlyTooltip />} />
                    <Bar dataKey="count" name="Memories" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No timeline data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Insights</h3>
          <ul className="space-y-2 text-sm">
            <li>
              {stats.uncategorizedCount > 0 ? (
                <>
                  <span className="font-medium">{stats.uncategorizedCount}</span> memories (
                  {Math.round((stats.uncategorizedCount / stats.count) * 100)}%) are uncategorized.
                </>
              ) : (
                <>All memories have been categorized. Great organization!</>
              )}
            </li>
            {stats.categoryDistribution.length > 0 && (
              <li>
                Most used category: <span className="font-medium">{stats.categoryDistribution[0].name}</span> with{" "}
                <span className="font-medium">{stats.categoryDistribution[0].count}</span> memories (
                {stats.categoryDistribution[0].percentage}%)
              </li>
            )}
            {monthlyData.length > 1 && (
              <li>
                Memory creation has{" "}
                {monthlyData[monthlyData.length - 1].count > monthlyData[monthlyData.length - 2].count
                  ? "increased"
                  : "decreased"}{" "}
                in the most recent month.
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
