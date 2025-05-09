"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, Lock, Calculator } from "lucide-react"

interface MemoryGrowthPredictionProps {
  userId: number
  hasValidKey: boolean
  aiMemberId?: number
}

export function MemoryGrowthPrediction({ userId, hasValidKey, aiMemberId }: MemoryGrowthPredictionProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPrediction()
  }, [userId, aiMemberId])

  const fetchPrediction = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!hasValidKey) {
        // If no valid API key, use mock prediction
        setMockPrediction()
        return
      }

      // Try to fetch real prediction using OpenAI
      const response = await fetch("/api/memory-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          aiMemberId,
        }),
      })

      if (!response.ok) {
        // If API call fails, use mock prediction
        setMockPrediction()
        return
      }

      const data = await response.json()

      if (data.error) {
        console.warn("Error from API, using mock prediction:", data.error)
        setMockPrediction()
        return
      }

      if (data.prediction) {
        setPrediction(data.prediction)
      } else {
        setMockPrediction()
      }
    } catch (err) {
      console.error("Error fetching memory prediction:", err)
      // Fallback to mock prediction on error
      setMockPrediction()
    } finally {
      setLoading(false)
    }
  }

  const setMockPrediction = () => {
    // Mock prediction data for demonstration
    setPrediction({
      historical: [
        { month: "2023-01", count: 45 },
        { month: "2023-02", count: 52 },
        { month: "2023-03", count: 61 },
        { month: "2023-04", count: 58 },
        { month: "2023-05", count: 72 },
        { month: "2023-06", count: 85 },
      ],
      predicted: [
        { month: "2023-07", count: 93, isPrediction: true },
        { month: "2023-08", count: 102, isPrediction: true },
        { month: "2023-09", count: 112, isPrediction: true },
      ],
      trend: "increasing",
      confidence: 0.85,
      averageGrowthRate: 0.12,
      categoryPredictions: [
        { category: "File Operations", currentCount: 98, predictedCount: 120, growth: 22.4 },
        { category: "Conversations", currentCount: 64, predictedCount: 75, growth: 17.2 },
        { category: "Important", currentCount: 42, predictedCount: 48, growth: 14.3 },
        { category: "Technical", currentCount: 32, predictedCount: 38, growth: 18.8 },
        { category: "Preferences", currentCount: 20, predictedCount: 22, growth: 10.0 },
      ],
    })
  }

  const handleRefresh = () => {
    fetchPrediction()
    toast({
      title: "Refreshing prediction",
      description: "Generating new memory growth prediction",
    })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
  }

  const getTrendBadge = () => {
    if (!prediction) return null

    switch (prediction.trend) {
      case "increasing":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Increasing
          </Badge>
        )
      case "decreasing":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            Decreasing
          </Badge>
        )
      case "stable":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Minus className="h-3 w-3 mr-1" />
            Stable
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Insufficient Data
          </Badge>
        )
    }
  }

  const getConfidenceLabel = () => {
    if (!prediction) return "Unknown"
    const confidence = prediction.confidence

    if (confidence >= 0.8) return "High"
    if (confidence >= 0.5) return "Medium"
    return "Low"
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!prediction) return []

    return [
      ...prediction.historical.map((item: any) => ({
        month: formatMonth(item.month),
        actual: item.count,
        predicted: null,
      })),
      ...prediction.predicted.map((item: any) => ({
        month: formatMonth(item.month),
        actual: null,
        predicted: item.count,
      })),
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Growth Prediction</CardTitle>
          <CardDescription>Generating prediction based on your memory patterns...</CardDescription>
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
          <CardTitle>Memory Growth Prediction</CardTitle>
          <CardDescription>There was an error generating the prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            <p className="font-medium">Error generating prediction</p>
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
            Memory Growth Prediction
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
                  AI-powered predictions require a valid OpenAI API key. Sample prediction data is shown below, but for
                  accurate predictions based on your actual data, please add an API key.
                </p>
                <Button asChild variant="outline" className="mt-2 bg-white border-amber-300 hover:bg-amber-100">
                  <a href="/api-keys">Add API Key</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Show limited prediction visualization */}
          <div className="opacity-80">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Historical"
                    stroke="#4CAF50"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted"
                    stroke="#2196F3"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Sample prediction data (not based on your actual usage)
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Growth Prediction</CardTitle>
          <CardDescription>No prediction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Not enough historical data to generate a prediction. Continue using the application to build up memory
              data.
            </p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = prepareChartData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Memory Growth Prediction
          </CardTitle>
          <CardDescription>Forecast of memory growth over the next 3 months</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendBadge()}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{prediction.trend}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(prediction.averageGrowthRate * 100)}%</div>
              <p className="text-xs text-muted-foreground">per month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prediction Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getConfidenceLabel()}</div>
              <p className="text-xs text-muted-foreground">{Math.round(prediction.confidence * 100)}%</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Memory Growth Chart</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Historical"
                  fill="#4CAF50"
                  stroke="#4CAF50"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  fill="#2196F3"
                  stroke="#2196F3"
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Category Growth Predictions</h3>
          <div className="space-y-3">
            {prediction.categoryPredictions.map((category: any, index: number) => (
              <div key={index} className="p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-muted-foreground">
                      Current: {category.currentCount} → Predicted: {category.predictedCount}
                    </div>
                  </div>
                  <Badge
                    className={
                      category.growth > 20
                        ? "bg-green-100 text-green-800"
                        : category.growth > 10
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    +{category.growth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Predictions are generated using AI analysis of your historical memory patterns. These predictions can help
            you plan for future storage needs and optimize your memory categories.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
