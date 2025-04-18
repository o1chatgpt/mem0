"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Calendar, Filter, Download, FlaskConical } from "lucide-react"
import Link from "next/link"
import { TemplateUsageOverview } from "@/components/template-analytics/template-usage-overview"
import { TemplateEffectivenessChart } from "@/components/template-analytics/template-effectiveness-chart"
import { TemplateUsageTable } from "@/components/template-analytics/template-usage-table"
import { TemplateComparisonChart } from "@/components/template-analytics/template-comparison-chart"
import { TemplateCategoryDistribution } from "@/components/template-analytics/template-category-distribution"
import { DateRangePicker } from "@/components/date-range-picker"
import { TemplateFilterDropdown } from "@/components/template-analytics/template-filter-dropdown"
import { TemplateInsights } from "@/components/template-analytics/template-insights"

export default function TemplateAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  })
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)

      // In a real implementation, this would be an API call to fetch actual data
      // For now, we'll simulate a delay and return mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for the dashboard
      const mockData = generateMockAnalyticsData(dateRange, selectedTemplates)
      setAnalyticsData(mockData)
      setIsLoading(false)
    }

    fetchAnalyticsData()
  }, [dateRange, selectedTemplates])

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV or JSON file with the analytics data
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `template-analytics-${dateRange.from.toISOString().split("T")[0]}-to-${dateRange.to.toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/template-features">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Template Features
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Template Analytics</h1>
        </div>
        <div className="flex space-x-2">
          <Link href="/template-ab-testing">
            <Button variant="outline">
              <FlaskConical className="mr-2 h-4 w-4" />
              A/B Testing
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TemplateFilterDropdown selectedTemplates={selectedTemplates} onSelectionChange={setSelectedTemplates} />
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4 mr-1" />
          {isLoading ? "Loading analytics..." : "Data updated just now"}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
              <div className="md:col-span-2 lg:col-span-4 h-80 bg-muted rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <TemplateUsageOverview data={analyticsData?.overview} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TemplateEffectivenessChart data={analyticsData?.effectiveness} />
                <TemplateCategoryDistribution data={analyticsData?.categoryDistribution} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {isLoading ? (
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ) : (
            <TemplateUsageTable data={analyticsData?.usageDetails} />
          )}
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          {isLoading ? (
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ) : (
            <TemplateComparisonChart data={analyticsData?.comparison} />
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <TemplateInsights data={analyticsData?.insights} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to generate mock data for the dashboard
function generateMockAnalyticsData(dateRange: { from: Date; to: Date }, selectedTemplates: string[]) {
  // Template names
  const templateNames = [
    "Research Assistant",
    "Creative Writing Coach",
    "File Organizer",
    "Technical Advisor",
    "Project Planner",
    "Learning Coach",
    "Personal Assistant",
    "Data Analyst",
  ]

  // Filter templates if selection is provided
  const templates =
    selectedTemplates.length > 0 ? templateNames.filter((name) => selectedTemplates.includes(name)) : templateNames

  // Categories
  const categories = ["Academic", "Creative", "Productivity", "Technical", "Personal"]

  // Generate random usage counts
  const generateUsageCounts = () => {
    return templates.map((template) => ({
      name: template,
      count: Math.floor(Math.random() * 500) + 50,
      category: categories[Math.floor(Math.random() * categories.length)],
    }))
  }

  // Generate effectiveness scores (0-100)
  const generateEffectivenessScores = () => {
    return templates.map((template) => ({
      name: template,
      score: Math.floor(Math.random() * 40) + 60, // 60-100 range
      responseTime: Math.floor(Math.random() * 2000) + 500, // 500-2500ms
      userSatisfaction: Math.floor(Math.random() * 40) + 60, // 60-100 range
      memoryUtilization: Math.floor(Math.random() * 40) + 60, // 60-100 range
    }))
  }

  // Generate daily usage data for the date range
  const generateDailyUsage = () => {
    const days = []
    const currentDate = new Date(dateRange.from)

    while (currentDate <= dateRange.to) {
      const dayData = {
        date: new Date(currentDate),
        templates: templates.map((template) => ({
          name: template,
          count: Math.floor(Math.random() * 30) + 1,
        })),
      }
      days.push(dayData)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  // Generate category distribution
  const generateCategoryDistribution = () => {
    return categories.map((category) => ({
      category,
      count: Math.floor(Math.random() * 1000) + 100,
    }))
  }

  // Generate insights
  const generateInsights = () => {
    return [
      {
        title: "Most Effective Template",
        description: `The "${templates[0]}" template has the highest effectiveness score at ${Math.floor(Math.random() * 10) + 90}%. Consider using this template's structure as a model for other templates.`,
        type: "positive",
      },
      {
        title: "Underutilized Template",
        description: `The "${templates[templates.length - 1]}" template is rarely used but has good effectiveness scores. Consider promoting this template or merging its features with more popular templates.`,
        type: "warning",
      },
      {
        title: "Usage Trend",
        description: `Template usage has ${Math.random() > 0.5 ? "increased" : "decreased"} by ${Math.floor(Math.random() * 30) + 5}% over the selected time period. This suggests ${Math.random() > 0.5 ? "growing adoption" : "potential issues with template discovery"}.`,
        type: "info",
      },
      {
        title: "Optimization Opportunity",
        description: `Templates in the "${categories[Math.floor(Math.random() * categories.length)]}" category have lower memory utilization scores. Consider reviewing these templates to improve their memory retrieval instructions.`,
        type: "warning",
      },
      {
        title: "User Satisfaction",
        description: `User satisfaction is highest with templates that have clear, specific instructions and examples. The top-performing templates average ${Math.floor(Math.random() * 10) + 90}% satisfaction ratings.`,
        type: "positive",
      },
    ]
  }

  // Calculate total usage
  const usageCounts = generateUsageCounts()
  const totalUsage = usageCounts.reduce((sum, item) => sum + item.count, 0)

  // Calculate average effectiveness
  const effectivenessScores = generateEffectivenessScores()
  const avgEffectiveness = effectivenessScores.reduce((sum, item) => sum + item.score, 0) / effectivenessScores.length

  return {
    overview: {
      totalUsage,
      avgEffectiveness,
      totalTemplates: templates.length,
      topTemplate: templates[0],
      usageCounts,
    },
    effectiveness: effectivenessScores,
    usageDetails: {
      dailyUsage: generateDailyUsage(),
      templateUsage: usageCounts,
    },
    categoryDistribution: generateCategoryDistribution(),
    comparison: {
      templates: effectivenessScores,
      metrics: ["Effectiveness", "Response Time", "User Satisfaction", "Memory Utilization"],
    },
    insights: generateInsights(),
  }
}
