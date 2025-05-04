"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BarChart, Clock, Play, Trash2, Layers, RefreshCw, Zap, Laptop, Globe, FileText } from "lucide-react"
import { benchmarkService, type BenchmarkResult, type BenchmarkConfig } from "@/lib/benchmark-service"
import { ReportGeneratorDialog } from "@/components/report-generator-dialog"

export default function MemoryBenchmarkPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("run")
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [currentBenchmark, setCurrentBenchmark] = useState<BenchmarkResult | null>(null)
  const [customBenchmarkName, setCustomBenchmarkName] = useState("")
  const [customBenchmarkDescription, setCustomBenchmarkDescription] = useState("")
  const [selectedOperations, setSelectedOperations] = useState<string[]>([])
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([])
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedReportResult, setSelectedReportResult] = useState<BenchmarkResult | null>(null)

  // Get predefined benchmarks
  const predefinedBenchmarks = useMemo(() => {
    return benchmarkService.getPredefinedBenchmarks()
  }, [])

  // Get all available operations for custom benchmarks
  const allOperations = useMemo(() => {
    const operations: { name: string; operationType: string }[] = []
    const operationNames = new Set<string>()

    predefinedBenchmarks.forEach((benchmark) => {
      benchmark.operations.forEach((operation) => {
        if (!operationNames.has(operation.name)) {
          operations.push({ name: operation.name, operationType: operation.operationType })
          operationNames.add(operation.name)
        }
      })
    })

    return operations
  }, [predefinedBenchmarks])

  // Subscribe to benchmark updates
  useEffect(() => {
    const removeListener = benchmarkService.addListener((results) => {
      setBenchmarkResults(results)

      // Update current benchmark if one is running
      const current = benchmarkService.getCurrentBenchmark()
      setCurrentBenchmark(current)
      setIsRunning(benchmarkService.isRunningBenchmark())
    })

    // Initial load of results
    setBenchmarkResults(benchmarkService.getBenchmarkResults())
    setIsRunning(benchmarkService.isRunningBenchmark())
    setCurrentBenchmark(benchmarkService.getCurrentBenchmark())

    return () => {
      removeListener()
    }
  }, [refreshKey])

  // Run the selected benchmark
  const runBenchmark = async () => {
    if (isRunning) return

    try {
      setIsRunning(true)

      let benchmarkConfig: BenchmarkConfig | undefined

      if (selectedBenchmark === "custom") {
        // Create a custom benchmark
        if (!customBenchmarkName || selectedOperations.length === 0) {
          alert("Please provide a name and select at least one operation for your custom benchmark.")
          setIsRunning(false)
          return
        }

        benchmarkConfig = benchmarkService.createCustomBenchmark(
          customBenchmarkName,
          customBenchmarkDescription || "Custom benchmark",
          selectedOperations,
        )
      } else {
        // Find the selected predefined benchmark
        benchmarkConfig = predefinedBenchmarks.find((b) => b.name === selectedBenchmark)
      }

      if (!benchmarkConfig) {
        alert("Please select a benchmark to run.")
        setIsRunning(false)
        return
      }

      // Run the benchmark
      await benchmarkService.runBenchmark(benchmarkConfig)
    } catch (error) {
      console.error("Error running benchmark:", error)
      alert(`Error running benchmark: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Delete a benchmark result
  const deleteBenchmarkResult = (id: string) => {
    if (confirm("Are you sure you want to delete this benchmark result?")) {
      benchmarkService.deleteBenchmarkResult(id)
      // Also remove from selected results if it's there
      setSelectedResultIds((prev) => prev.filter((resultId) => resultId !== id))
    }
  }

  // Clear all benchmark results
  const clearAllResults = () => {
    if (confirm("Are you sure you want to clear all benchmark results? This action cannot be undone.")) {
      benchmarkService.clearBenchmarkResults()
      setSelectedResultIds([])
    }
  }

  // Toggle selection of a result for comparison
  const toggleResultSelection = (id: string) => {
    setSelectedResultIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((resultId) => resultId !== id)
      } else {
        // Limit to 3 selections
        const newSelection = [...prev, id]
        if (newSelection.length > 3) {
          return newSelection.slice(1)
        }
        return newSelection
      }
    })
  }

  // Format duration in milliseconds to a readable string
  const formatDuration = (ms: number) => {
    if (ms < 1) return "< 1 ms"
    if (ms < 1000) return `${ms.toFixed(1)} ms`
    return `${(ms / 1000).toFixed(2)} s`
  }

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
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

  // Get the selected results for comparison
  const selectedResults = useMemo(() => {
    return benchmarkResults.filter((result) => selectedResultIds.includes(result.id))
  }, [benchmarkResults, selectedResultIds])

  // Get all operation types across selected results
  const comparisonOperationTypes = useMemo(() => {
    const types = new Set<string>()
    selectedResults.forEach((result) => {
      result.operations.forEach((operation) => {
        types.add(operation.name)
      })
    })
    return Array.from(types)
  }, [selectedResults])

  // Open the report dialog for a specific result
  const openReportDialog = (result: BenchmarkResult) => {
    setSelectedReportResult(result)
    setShowReportDialog(true)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/settings/mem0")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mem0 Settings
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <BarChart className="h-8 w-8 mr-2 text-primary" />
          Memory Benchmarks
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="run">
            <Play className="h-4 w-4 mr-2" />
            Run Benchmark
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="compare">
            <Layers className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Run Memory Benchmark
              </CardTitle>
              <CardDescription>Run standardized benchmarks to measure memory operation performance.</CardDescription>
            </CardHeader>
            <CardContent>
              {isRunning && currentBenchmark ? (
                <div className="space-y-6">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Benchmark in progress</AlertTitle>
                    <AlertDescription>
                      Running benchmark: {currentBenchmark.name}. Please wait until the benchmark completes.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>
                          {currentBenchmark.operations.length} / {currentBenchmark.operations.length} operations
                        </span>
                      </div>
                      <Progress
                        value={(currentBenchmark.operations.length / currentBenchmark.operations.length) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-4">Operation</div>
                        <div className="col-span-2">Iterations</div>
                        <div className="col-span-2">Avg Duration</div>
                        <div className="col-span-2">Success Rate</div>
                        <div className="col-span-2">Status</div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {currentBenchmark.operations.map((operation, index) => (
                          <div
                            key={`${operation.name}-${index}`}
                            className="grid grid-cols-12 gap-4 p-3 text-sm border-t"
                          >
                            <div className="col-span-4 font-medium">{operation.name}</div>
                            <div className="col-span-2">{operation.iterations}</div>
                            <div className={`col-span-2 ${getDurationColorClass(operation.averageDuration)}`}>
                              {formatDuration(operation.averageDuration)}
                            </div>
                            <div className={`col-span-2 ${getSuccessRateColorClass(operation.successRate)}`}>
                              {operation.successRate.toFixed(1)}%
                            </div>
                            <div className="col-span-2">
                              <Badge variant="outline" className="font-normal">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="benchmark-select">Select Benchmark</Label>
                      <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                        <SelectTrigger id="benchmark-select" className="mt-1">
                          <SelectValue placeholder="Select a benchmark to run" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Benchmark</SelectItem>
                          {predefinedBenchmarks.map((benchmark) => (
                            <SelectItem key={benchmark.name} value={benchmark.name}>
                              {benchmark.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBenchmark && selectedBenchmark !== "custom" && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {predefinedBenchmarks.find((b) => b.name === selectedBenchmark)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {predefinedBenchmarks.find((b) => b.name === selectedBenchmark)?.description}
                        </p>

                        <div className="border rounded-md overflow-hidden">
                          <div className="grid grid-cols-12 gap-4 p-3 bg-muted font-medium text-sm">
                            <div className="col-span-6">Operation</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-4">Iterations</div>
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {predefinedBenchmarks
                              .find((b) => b.name === selectedBenchmark)
                              ?.operations.map((operation, index) => (
                                <div
                                  key={`${operation.name}-${index}`}
                                  className="grid grid-cols-12 gap-4 p-3 text-sm border-t"
                                >
                                  <div className="col-span-6 font-medium">{operation.name}</div>
                                  <div className="col-span-2 text-muted-foreground">{operation.operationType}</div>
                                  <div className="col-span-4">{operation.iterations}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBenchmark === "custom" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="custom-name">Benchmark Name</Label>
                          <Input
                            id="custom-name"
                            value={customBenchmarkName}
                            onChange={(e) => setCustomBenchmarkName(e.target.value)}
                            placeholder="Enter a name for your custom benchmark"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-description">Description (Optional)</Label>
                          <Input
                            id="custom-description"
                            value={customBenchmarkDescription}
                            onChange={(e) => setCustomBenchmarkDescription(e.target.value)}
                            placeholder="Enter a description for your custom benchmark"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Select Operations</Label>
                          <div className="border rounded-md p-4 mt-1 max-h-[200px] overflow-y-auto">
                            {allOperations.map((operation) => (
                              <div key={operation.name} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`operation-${operation.name}`}
                                  checked={selectedOperations.includes(operation.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedOperations((prev) => [...prev, operation.name])
                                    } else {
                                      setSelectedOperations((prev) => prev.filter((name) => name !== operation.name))
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`operation-${operation.name}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {operation.name}{" "}
                                  <span className="text-muted-foreground">({operation.operationType})</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/settings/mem0")}>
                Cancel
              </Button>
              <Button onClick={runBenchmark} disabled={isRunning || !selectedBenchmark}>
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Benchmark
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Benchmark Results
              </CardTitle>
              <CardDescription>
                View the results of previous benchmark runs. Select results to compare them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benchmarkResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No benchmark results available. Run a benchmark to see results here.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {benchmarkResults.length} benchmark result{benchmarkResults.length !== 1 ? "s" : ""}
                    </div>
                    <Button variant="outline" size="sm" onClick={clearAllResults}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Results
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {benchmarkResults.map((result) => (
                      <Card key={result.id} className={selectedResultIds.includes(result.id) ? "border-primary" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{result.name}</CardTitle>
                              <CardDescription>{formatTimestamp(result.timestamp)}</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`select-${result.id}`}
                                checked={selectedResultIds.includes(result.id)}
                                onCheckedChange={() => toggleResultSelection(result.id)}
                              />
                              <Label htmlFor={`select-${result.id}`} className="text-xs cursor-pointer">
                                Compare
                              </Label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openReportDialog(result)}
                                title="Generate Report"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBenchmarkResult(result.id)}
                                title="Delete Result"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Duration: <span className="font-medium">{formatDuration(result.duration)}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Laptop className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Environment:{" "}
                                <span className="font-medium">
                                  {result.environment.browser} on {result.environment.platform}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Storage: <span className="font-medium">{result.environment.storageMode}</span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Operations</h4>
                              <span className="text-xs text-muted-foreground">
                                {result.operations.length} operation{result.operations.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <div className="grid grid-cols-12 gap-4 p-2 bg-muted font-medium text-xs">
                                <div className="col-span-4">Operation</div>
                                <div className="col-span-2">Iterations</div>
                                <div className="col-span-3">Avg Duration</div>
                                <div className="col-span-3">Success Rate</div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto">
                                {result.operations.map((operation, index) => (
                                  <div
                                    key={`${operation.name}-${index}`}
                                    className="grid grid-cols-12 gap-4 p-2 text-xs border-t"
                                  >
                                    <div className="col-span-4 font-medium">{operation.name}</div>
                                    <div className="col-span-2">{operation.iterations}</div>
                                    <div className={`col-span-3 ${getDurationColorClass(operation.averageDuration)}`}>
                                      {formatDuration(operation.averageDuration)}
                                    </div>
                                    <div className={`col-span-3 ${getSuccessRateColorClass(operation.successRate)}`}>
                                      {operation.successRate.toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Compare Benchmarks
              </CardTitle>
              <CardDescription>Compare the results of different benchmark runs side by side.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResults.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select at least two benchmark results from the Results tab to compare them.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Comparing {selectedResults.length} benchmark results
                    </div>
                    {selectedResults.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Generate a report for the first selected result with comparison
                          if (selectedResults.length > 0) {
                            openReportDialog(selectedResults[0])
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Comparison Report
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedResults.map((result) => (
                      <Card key={result.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{result.name}</CardTitle>
                          <CardDescription>{formatTimestamp(result.timestamp)}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Duration: <span className="font-medium">{formatDuration(result.duration)}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Laptop className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Environment:{" "}
                                <span className="font-medium">
                                  {result.environment.browser} on {result.environment.platform}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Storage: <span className="font-medium">{result.environment.storageMode}</span>
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Performance Comparison</h3>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Operation</TableHead>
                          {selectedResults.map((result) => (
                            <TableHead key={`header-${result.id}`}>
                              {result.name}{" "}
                              <span className="text-xs text-muted-foreground block">
                                {new Date(result.timestamp).toLocaleDateString()}
                              </span>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonOperationTypes.map((operationType) => (
                          <TableRow key={operationType}>
                            <TableCell className="font-medium">{operationType}</TableCell>
                            {selectedResults.map((result) => {
                              const operation = result.operations.find((op) => op.name === operationType)
                              return (
                                <TableCell key={`${result.id}-${operationType}`}>
                                  {operation ? (
                                    <div className="space-y-1">
                                      <div className={getDurationColorClass(operation.averageDuration)}>
                                        {formatDuration(operation.averageDuration)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {operation.iterations} iterations
                                      </div>
                                      <div className={`text-xs ${getSuccessRateColorClass(operation.successRate)}`}>
                                        {operation.successRate.toFixed(1)}% success
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Visual Comparison</h3>

                    <div className="space-y-6">
                      {comparisonOperationTypes.map((operationType) => (
                        <div key={`chart-${operationType}`} className="space-y-2">
                          <h4 className="text-sm font-medium">{operationType}</h4>
                          {selectedResults.map((result) => {
                            const operation = result.operations.find((op) => op.name === operationType)
                            if (!operation) return null

                            return (
                              <div key={`${result.id}-${operationType}-chart`} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{result.name}</span>
                                  <span className={getDurationColorClass(operation.averageDuration)}>
                                    {formatDuration(operation.averageDuration)}
                                  </span>
                                </div>
                                <div className="h-6 w-full bg-muted rounded-md overflow-hidden">
                                  <div
                                    className={`h-full ${getDurationColorClass(
                                      operation.averageDuration,
                                    )} bg-primary/20 rounded-md`}
                                    style={{
                                      width: `${Math.min(100, (operation.averageDuration / 500) * 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Generator Dialog */}
      <ReportGeneratorDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        benchmarkResult={selectedReportResult}
        comparisonResults={selectedResults.filter((r) => selectedReportResult && r.id !== selectedReportResult.id)}
      />
    </div>
  )
}
