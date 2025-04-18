"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  FlaskConical,
  CheckCircle2,
  Calendar,
  BarChart3,
  LineChartIcon,
  StopCircle,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TestResultsProps {
  test: any
  onStopTest: (testId: string) => void
  onDeleteTest: (testId: string) => void
}

// Chart colors for variations
const VARIATION_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3, #4338ca)",
  "var(--chart-4, #0891b2)",
  "var(--chart-5, #ca8a04)",
  "var(--chart-6, #be185d)",
  "var(--chart-7, #059669)",
  "var(--chart-8, #9333ea)",
]

export function TestResults({ test, onStopTest, onDeleteTest }: TestResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Format dates
  const startDate = new Date(test.startDate)
  const endDate = new Date(test.endDate)
  const startFormatted = startDate.toLocaleDateString()
  const endFormatted = endDate.toLocaleDateString()

  // Calculate test progress for active tests
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const remainingDays = Math.max(0, totalDays - elapsedDays)
  const progressPercent = Math.min(Math.round((elapsedDays / totalDays) * 100), 100)

  // Get variation keys (A, B, C, etc.)
  const variationKeys = Object.keys(test.variations)

  // Prepare chart config for variations
  const chartConfig = variationKeys.reduce((config, key, index) => {
    config[key] = {
      label: `${key}: ${test.variations[key].name}`,
      color: VARIATION_COLORS[index % VARIATION_COLORS.length],
    }
    return config
  }, {})

  // Prepare data for charts
  const prepareMetricsData = () => {
    const metrics = ["impressions", "usageCount", "effectiveness", "responseTime", "userSatisfaction"]

    return metrics.map((metricName) => {
      const metricData: any = {
        name: formatMetricName(metricName),
      }

      // Add data for each variation
      variationKeys.forEach((key) => {
        metricData[key] = test.metrics[metricName][key]
      })

      // Add diff values comparing to variation A
      variationKeys.slice(1).forEach((key) => {
        const baseValue = test.metrics[metricName]["A"]
        const compareValue = test.metrics[metricName][key]

        // For response time, lower is better, so invert the diff calculation
        const diff =
          metricName === "responseTime"
            ? calculateDiff(baseValue, compareValue)
            : calculateDiff(compareValue, baseValue)

        metricData[`${key}_diff`] = diff
      })

      return metricData
    })
  }

  // Format metric names for display
  const formatMetricName = (name: string) => {
    switch (name) {
      case "impressions":
        return "Impressions"
      case "usageCount":
        return "Usage Count"
      case "effectiveness":
        return "Effectiveness"
      case "responseTime":
        return "Response Time"
      case "userSatisfaction":
        return "User Satisfaction"
      default:
        return name
    }
  }

  // Helper to calculate percentage difference
  const calculateDiff = (valueB: number, valueA: number) => {
    if (valueA === 0) return 0
    return ((valueB - valueA) / valueA) * 100
  }

  // Determine if there's a winning variation
  const determineWinner = () => {
    if (test.status === "completed" && test.winner) {
      return test.winner
    }

    // For active tests, calculate based on metrics
    const metrics = prepareMetricsData()
    const scores: Record<string, number> = {}

    // Initialize scores for each variation
    variationKeys.forEach((key) => {
      scores[key] = 0
    })

    // Weight different metrics
    const weights = {
      "Usage Count": 0.3,
      Effectiveness: 0.3,
      "Response Time": 0.1,
      "User Satisfaction": 0.3,
    }

    // Calculate scores for each variation compared to A
    metrics.forEach((metric) => {
      const metricName = metric.name

      if (metricName in weights) {
        const weight = weights[metricName as keyof typeof weights]

        // Compare each variation to A
        variationKeys.slice(1).forEach((key) => {
          const diffKey = `${key}_diff`
          const diff = metric[diffKey]

          if (diff > 5) {
            // This variation is better than A by more than 5%
            scores[key] += weight
          } else if (diff < -5) {
            // A is better than this variation by more than 5%
            scores["A"] += weight
          }
        })
      }
    })

    // Find the variation with the highest score
    let winner = null
    let highestScore = 0

    Object.entries(scores).forEach(([key, score]) => {
      if (score > highestScore) {
        highestScore = score
        winner = key
      }
    })

    // Only declare a winner if the score difference is significant
    const runnerUpScore = Object.entries(scores)
      .filter(([key]) => key !== winner)
      .reduce((max, [_, score]) => Math.max(max, score), 0)

    return highestScore > runnerUpScore + 0.1 ? winner : null
  }

  const winner = determineWinner()

  // Format trend data for the line chart
  const prepareTrendData = () => {
    if (!test.dailyData) return []

    return test.dailyData.map((day: any) => {
      const data: any = {
        date: new Date(day.date).toLocaleDateString(),
      }

      // Add cumulative data for each variation
      variationKeys.forEach((key) => {
        data[key] = day.cumulative[key] || 0
      })

      return data
    })
  }

  const metricsData = prepareMetricsData()
  const trendData = prepareTrendData()

  // Handle stopping the test
  const handleStopTest = () => {
    onStopTest(test.id)
    setIsStopDialogOpen(false)
  }

  // Handle deleting the test
  const handleDeleteTest = () => {
    onDeleteTest(test.id)
    setIsDeleteDialogOpen(false)
  }

  // Format value based on metric type
  const formatMetricValue = (value: number, metricName: string) => {
    if (metricName === "Response Time") {
      return `${value.toLocaleString()}ms`
    } else if (metricName === "Effectiveness" || metricName === "User Satisfaction") {
      return `${value.toLocaleString()}%`
    }
    return value.toLocaleString()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center">
                {test.status === "active" ? (
                  <FlaskConical className="mr-2 h-5 w-5" />
                ) : (
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                {test.name}
              </CardTitle>
              <CardDescription>Testing variations for {test.templateName}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={test.status === "active" ? "default" : "outline"}>
                {test.status === "active" ? "Active" : "Completed"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="sr-only">Open menu</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {test.status === "active" && (
                    <DropdownMenuItem onClick={() => setIsStopDialogOpen(true)}>
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop Test
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Test
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between text-sm mb-4">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">Period:</span>
              <span>
                {startFormatted} - {endFormatted}
              </span>
            </div>

            {test.status === "active" && (
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-muted-foreground mr-1">Progress:</span>
                <span>{progressPercent}% complete</span>
                <span className="text-muted-foreground ml-2">({remainingDays} days remaining)</span>
              </div>
            )}
          </div>

          {test.description && <p className="text-sm text-muted-foreground mb-4">{test.description}</p>}

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Test Variations ({variationKeys.length})</h4>
            <ScrollArea className="h-[200px] border rounded-md">
              <div className="p-4 grid gap-4">
                {variationKeys.map((key) => (
                  <div key={key} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Variation {key}</Badge>
                        <h4 className="text-sm font-medium">{test.variations[key].name}</h4>
                        {key === "A" && <Badge variant="secondary">Original</Badge>}
                        {winner === key && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{test.variations[key].description}</p>
                    <div className="bg-muted rounded-md p-2 text-xs font-mono h-16 overflow-y-auto">
                      {test.variations[key].template.substring(0, 200)}
                      {test.variations[key].template.length > 200 && "..."}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {test.status === "completed" && test.conclusion && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Test Conclusion</AlertTitle>
              <AlertDescription>{test.conclusion}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Metrics Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <LineChartIcon className="mr-2 h-4 w-4" />
                Usage Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {variationKeys.map((key, index) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={VARIATION_COLORS[index % VARIATION_COLORS.length]}
                          name={`${key}: ${test.variations[key].name}`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                {metricsData.map((metric) => (
                  <Card key={metric.name} className="overflow-hidden">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm">{metric.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {variationKeys.map((key) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground">Variation {key}</p>
                            <p className="text-lg font-medium">{formatMetricValue(metric[key], metric.name)}</p>
                            {key !== "A" && (
                              <div className="mt-1 flex items-center">
                                <p className="text-xs text-muted-foreground mr-1">vs A:</p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-normal",
                                    metric[`${key}_diff`] > 0
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : metric[`${key}_diff`] < 0
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-gray-50 text-gray-700 border-gray-200",
                                  )}
                                >
                                  {metric[`${key}_diff`] > 0 ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3" />
                                  ) : metric[`${key}_diff`] < 0 ? (
                                    <ArrowDownRight className="mr-1 h-3 w-3" />
                                  ) : (
                                    <Minus className="mr-1 h-3 w-3" />
                                  )}
                                  {Math.abs(metric[`${key}_diff`]).toFixed(1)}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="pt-4">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => value.split("/").slice(0, 2).join("/")} />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {variationKeys.map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={VARIATION_COLORS[index % VARIATION_COLORS.length]}
                          name={`${key}: ${test.variations[key].name}`}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cumulative Usage</CardTitle>
                    <CardDescription>Total usage count over time for each variation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {variationKeys.map((key) => (
                        <div key={key}>
                          <h4 className="text-sm font-medium">
                            Variation {key}: {test.variations[key].name}
                          </h4>
                          <p className="text-2xl font-bold">{test.metrics.usageCount[key].toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            From {test.metrics.impressions[key].toLocaleString()} impressions (
                            {((test.metrics.usageCount[key] / test.metrics.impressions[key]) * 100).toFixed(1)}% usage
                            rate)
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        {test.status === "active" && (
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full" onClick={() => setIsStopDialogOpen(true)}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Test Early
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Stop Test Dialog */}
      <AlertDialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Multivariate Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop this test? This will end the test early and declare a winner based on
              current results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStopTest}>Stop Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Test Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multivariate Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test? This action cannot be undone and all test data will be
              permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTest} className="bg-destructive text-destructive-foreground">
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
