"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus, AlertCircle, HelpCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { predictMemoryGrowth } from "@/lib/mem0"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MemoryGrowthPredictionProps {
  userId: number
  aiMemberId?: number
}

export function MemoryGrowthPrediction({ userId, aiMemberId }: MemoryGrowthPredictionProps) {
  const [predictionData, setPredictionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"3months" | "6months" | "12months">("3months")

  useEffect(() => {
    fetchPredictionData()
  }, [userId, aiMemberId, timeframe])

  const fetchPredictionData = async () => {
    setLoading(true)
    try {
      const monthsToPredict = timeframe === "3months" ? 3 : timeframe === "6months" ? 6 : 12
      const data = await predictMemoryGrowth(userId, aiMemberId, monthsToPredict)
      setPredictionData(data)
    } catch (error) {
      console.error("Error fetching prediction data:", error)
      toast({
        title: "Error",
        description: "Failed to load memory growth prediction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  const getTrendIcon = () => {
    if (!predictionData) return <Minus className="h-5 w-5" />

    switch (predictionData.trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "decreasing":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "stable":
        return <Minus className="h-5 w-5 text-blue-500" />
      case "insufficient_data":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Minus className="h-5 w-5" />
    }
  }

  const getTrendDescription = () => {
    if (!predictionData) return "No prediction data available"

    switch (predictionData.trend) {
      case "increasing":
        return `Memory creation is trending upward at approximately ${Math.round(predictionData.averageGrowthRate * 100)}% per month`
      case "decreasing":
        return `Memory creation is trending downward at approximately ${Math.abs(Math.round(predictionData.averageGrowthRate * 100))}% per month`
      case "stable":
        return "Memory creation is relatively stable month-to-month"
      case "insufficient_data":
        return "Not enough historical data to make a reliable prediction"
      default:
        return "No prediction data available"
    }
  }

  const getConfidenceLabel = () => {
    if (!predictionData) return "Unknown"

    const confidence = predictionData.confidence
    if (confidence > 0.7) return "High"
    if (confidence > 0.4) return "Medium"
    return "Low"
  }

  const getConfidenceColor = () => {
    if (!predictionData) return "bg-gray-400"

    const confidence = predictionData.confidence
    if (confidence > 0.7) return "bg-green-500"
    if (confidence > 0.4) return "bg-yellow-500"
    return "bg-red-500"
  }

  const prepareChartData = () => {
    if (!predictionData) return []

    const historical = predictionData.historical.map((item: any) => ({
      month: formatMonthLabel(item.month),
      actual: item.count,
      predicted: null,
      monthKey: item.month,
    }))

    const predicted = predictionData.predicted.map((item: any) => ({
      month: formatMonthLabel(item.month),
      actual: null,
      predicted: item.count,
      monthKey: item.month,
    }))

    // If we have historical data, use the last point as the first prediction point
    // to connect the lines
    if (historical.length > 0 && predicted.length > 0) {
      const lastHistorical = historical[historical.length - 1]
      predicted[0] = {
        ...predicted[0],
        actual: lastHistorical.actual,
      }
    }

    return [...historical, ...predicted]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload[0].value !== null && (
            <p className="text-sm">
              Actual: <span className="font-medium">{payload[0].value}</span>
            </p>
          )}
          {payload[1]?.value !== null && (
            <p className="text-sm">
              Predicted: <span className="font-medium">{payload[1].value}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Growth Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">Loading prediction data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle>Memory Growth Prediction</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <button className="ml-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This prediction is based on historical memory creation patterns. The confidence level indicates how
                  reliable the prediction is based on data consistency.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
          <TabsList>
            <TabsTrigger value="3months">3 Months</TabsTrigger>
            <TabsTrigger value="6months">6 Months</TabsTrigger>
            <TabsTrigger value="12months">12 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {!predictionData || predictionData.historical.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>Not enough historical data to make a reliable prediction.</p>
            <p className="text-sm mt-2">
              Continue using the system to generate more memories for accurate growth predictions.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4 flex items-center">
                <div className="mr-3">{getTrendIcon()}</div>
                <div>
                  <div className="text-sm text-muted-foreground">Trend</div>
                  <div className="font-medium capitalize">{predictionData.trend.replace("_", " ")}</div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Prediction Confidence</div>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getConfidenceColor()}`}></div>
                  <div className="font-medium">{getConfidenceLabel()}</div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground">
                  Projected in {timeframe.replace("months", " Months")}
                </div>
                <div className="font-medium">
                  {predictionData.predicted.length > 0
                    ? predictionData.predicted[predictionData.predicted.length - 1].count
                    : "N/A"}{" "}
                  memories
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Prediction Insights</h3>
              <p className="text-sm">{getTrendDescription()}</p>
              {predictionData.trend !== "insufficient_data" && (
                <div className="mt-3 text-sm">
                  <p>
                    Based on current trends, you can expect to have approximately{" "}
                    <span className="font-medium">
                      {predictionData.predicted.length > 0
                        ? predictionData.predicted[predictionData.predicted.length - 1].count
                        : "N/A"}
                    </span>{" "}
                    memories by{" "}
                    {predictionData.predicted.length > 0
                      ? formatMonthLabel(predictionData.predicted[predictionData.predicted.length - 1].month)
                      : "N/A"}
                    .
                  </p>
                  {predictionData.trend === "increasing" && predictionData.averageGrowthRate > 0.2 && (
                    <p className="mt-2 text-yellow-600">
                      Memory growth is accelerating rapidly. Consider implementing a memory management strategy.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
