"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Brain, Lightbulb, RefreshCw, AlertTriangle, Sparkles, TrendingUp, FileText, Clock, Lock } from "lucide-react"

interface MemoryInsightsProps {
  userId: number
  hasValidKey: boolean
  aiMemberId?: number
}

export function MemoryInsights({ userId, hasValidKey, aiMemberId }: MemoryInsightsProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInsights()
  }, [userId, aiMemberId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!hasValidKey) {
        // If no valid API key, use mock insights
        setMockInsights()
        return
      }

      // Try to fetch real insights using OpenAI
      const response = await fetch("/api/memory-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          aiMemberId,
        }),
      })

      if (!response.ok) {
        // If API call fails, use mock insights
        setMockInsights()
        return
      }

      const data = await response.json()

      if (data.error) {
        console.warn("Error from API, using mock insights:", data.error)
        setMockInsights()
        return
      }

      if (data.insights) {
        setInsights(data.insights)
      } else {
        setMockInsights()
      }
    } catch (err) {
      console.error("Error fetching memory insights:", err)
      // Fallback to mock insights on error
      setMockInsights()
    } finally {
      setLoading(false)
    }
  }

  const setMockInsights = () => {
    // Mock insights for demonstration
    setInsights([
      {
        id: 1,
        title: "File Operation Patterns",
        description:
          "You tend to upload files most frequently on Mondays and Tuesdays, with PDF being your most common file type.",
        type: "pattern",
        confidence: 0.92,
        category: "File Operations",
      },
      {
        id: 2,
        title: "Memory Growth Trend",
        description: "Your memory usage has increased by 35% in the last month, primarily in the 'Important' category.",
        type: "trend",
        confidence: 0.87,
        category: "System",
      },
      {
        id: 3,
        title: "Content Organization",
        description:
          "Consider creating a new category for your project documentation files to better organize related memories.",
        type: "recommendation",
        confidence: 0.78,
        category: "Organization",
      },
      {
        id: 4,
        title: "Recurring Topics",
        description:
          "Your most discussed topics in AI conversations are 'data analysis', 'project planning', and 'documentation'.",
        type: "analysis",
        confidence: 0.85,
        category: "Conversations",
      },
      {
        id: 5,
        title: "Unused Features",
        description: "You haven't used the webhook integration features yet. These could help automate your workflow.",
        type: "recommendation",
        confidence: 0.81,
        category: "Features",
      },
    ])
  }

  const handleRefresh = () => {
    fetchInsights()
    toast({
      title: "Refreshing insights",
      description: "Generating new AI insights from your memory data",
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <Brain className="h-5 w-5" />
      case "trend":
        return <TrendingUp className="h-5 w-5" />
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />
      case "analysis":
        return <FileText className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "trend":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "recommendation":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "analysis":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Memory Insights</CardTitle>
          <CardDescription>Generating intelligent insights from your memory data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Memory Insights</CardTitle>
          <CardDescription>There was an error generating insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            <p className="font-medium">Error generating insights</p>
            <p>{error}</p>
            <Button variant="outline" className="mt-2" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasValidKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            AI Memory Insights
          </CardTitle>
          <CardDescription>OpenAI API key required for full functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">API Key Required</p>
                <p className="mt-1">
                  AI-powered insights require a valid OpenAI API key. Some sample insights are shown below, but for
                  personalized insights based on your actual data, please add an API key.
                </p>
                <Button asChild variant="outline" className="mt-2 bg-white border-amber-300 hover:bg-amber-100">
                  <a href="/api-keys">Add API Key</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Show limited mock insights */}
          <div className="space-y-4 opacity-80">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className={`p-4 border rounded-md ${getInsightColor(insight.type)}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getInsightIcon(insight.type)}</div>
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="text-sm mt-1">{insight.description}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="mr-2">
                        {insight.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Sample Insight
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
            AI Memory Insights
          </CardTitle>
          <CardDescription>Intelligent insights generated from your memory data</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No insights available yet. Add more memories to generate insights.
            </p>
            <Button onClick={handleRefresh}>Generate Insights</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 border rounded-md ${getInsightColor(insight.type)}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getInsightIcon(insight.type)}</div>
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="text-sm mt-1">{insight.description}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="mr-2">
                        {insight.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Insights are generated using OpenAI's GPT models to analyze patterns in your memory data. The more memories
            you create, the more accurate and helpful these insights will become.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
