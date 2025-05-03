import { memoryStore } from "./memory-store"
import { performanceMonitor } from "./performance-monitor"
import { dbService } from "./db-service"

// Define types for benchmarks
export interface BenchmarkResult {
  id: string
  name: string
  description: string
  timestamp: number
  duration: number
  operations: BenchmarkOperationResult[]
  environment: BenchmarkEnvironment
}

export interface BenchmarkOperationResult {
  name: string
  operationType: string
  iterations: number
  totalDuration: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  successRate: number
  errorCount: number
}

export interface BenchmarkEnvironment {
  storageMode: "api" | "database" | "local"
  browser: string
  platform: string
  timestamp: number
  memoryUsage?: number
  connectionSpeed?: string
}

export interface BenchmarkConfig {
  name: string
  description: string
  operations: BenchmarkOperation[]
}

export interface BenchmarkOperation {
  name: string
  operationType: string
  iterations: number
  fn: () => Promise<void>
}

// Maximum number of benchmark results to keep
const MAX_BENCHMARK_HISTORY = 20

class BenchmarkService {
  private benchmarkResults: BenchmarkResult[] = []
  private isRunning = false
  private currentBenchmark: BenchmarkResult | null = null
  private listeners: Set<(results: BenchmarkResult[]) => void> = new Set()

  constructor() {
    // Try to load saved benchmark results from localStorage
    this.loadBenchmarkResults()
  }

  // Load benchmark results from localStorage
  private loadBenchmarkResults(): void {
    if (typeof window === "undefined") return

    try {
      const savedResults = localStorage.getItem("benchmark-results")
      if (savedResults) {
        this.benchmarkResults = JSON.parse(savedResults)
      }
    } catch (error) {
      console.error("Error loading benchmark results:", error)
    }
  }

  // Save benchmark results to localStorage
  private saveBenchmarkResults(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("benchmark-results", JSON.stringify(this.benchmarkResults))
    } catch (error) {
      console.error("Error saving benchmark results:", error)
    }
  }

  // Get all benchmark results
  getBenchmarkResults(): BenchmarkResult[] {
    return [...this.benchmarkResults]
  }

  // Get a specific benchmark result by ID
  getBenchmarkResultById(id: string): BenchmarkResult | undefined {
    return this.benchmarkResults.find((result) => result.id === id)
  }

  // Check if a benchmark is currently running
  isRunningBenchmark(): boolean {
    return this.isRunning
  }

  // Get the current benchmark if one is running
  getCurrentBenchmark(): BenchmarkResult | null {
    return this.currentBenchmark
  }

  // Run a benchmark with the given configuration
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    if (this.isRunning) {
      throw new Error("A benchmark is already running")
    }

    this.isRunning = true

    // Create a new benchmark result
    const benchmarkId = `benchmark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const startTime = Date.now()

    // Detect environment
    const environment: BenchmarkEnvironment = {
      storageMode: memoryStore.getStorageMode(),
      browser: this.detectBrowser(),
      platform: this.detectPlatform(),
      timestamp: startTime,
      connectionSpeed: await this.estimateConnectionSpeed(),
    }

    // Try to get memory usage if available
    if (typeof performance !== "undefined" && "memory" in performance) {
      // @ts-ignore - memory is not in the standard Performance interface
      environment.memoryUsage = performance.memory?.usedJSHeapSize
    }

    this.currentBenchmark = {
      id: benchmarkId,
      name: config.name,
      description: config.description,
      timestamp: startTime,
      duration: 0,
      operations: [],
      environment,
    }

    // Notify listeners that a benchmark has started
    this.notifyListeners()

    try {
      // Clear performance metrics before starting
      performanceMonitor.clearMetrics()

      // Run each operation in the benchmark
      for (const operation of config.operations) {
        // Run the operation for the specified number of iterations
        const operationResults = await this.runBenchmarkOperation(operation)

        // Add the operation results to the benchmark
        if (this.currentBenchmark) {
          this.currentBenchmark.operations.push(operationResults)
          // Update the current benchmark to show progress
          this.notifyListeners()
        }
      }

      // Calculate the total duration
      const endTime = Date.now()
      const duration = endTime - startTime

      if (this.currentBenchmark) {
        this.currentBenchmark.duration = duration
      }

      // Add the benchmark to the results
      const result = { ...this.currentBenchmark! }
      this.benchmarkResults.unshift(result)

      // Trim the results if necessary
      if (this.benchmarkResults.length > MAX_BENCHMARK_HISTORY) {
        this.benchmarkResults = this.benchmarkResults.slice(0, MAX_BENCHMARK_HISTORY)
      }

      // Save the results
      this.saveBenchmarkResults()

      return result
    } finally {
      this.isRunning = false
      this.currentBenchmark = null
      this.notifyListeners()
    }
  }

  // Run a single benchmark operation
  private async runBenchmarkOperation(operation: BenchmarkOperation): Promise<BenchmarkOperationResult> {
    const durations: number[] = []
    let errorCount = 0

    // Run the operation for the specified number of iterations
    for (let i = 0; i < operation.iterations; i++) {
      const startTime = Date.now()

      try {
        await operation.fn()
        const endTime = Date.now()
        durations.push(endTime - startTime)
      } catch (error) {
        errorCount++
        console.error(`Error in benchmark operation ${operation.name}:`, error)
      }
    }

    // Calculate statistics
    const successCount = operation.iterations - errorCount
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0)
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0
    const successRate = operation.iterations > 0 ? (successCount / operation.iterations) * 100 : 0

    return {
      name: operation.name,
      operationType: operation.operationType,
      iterations: operation.iterations,
      totalDuration,
      averageDuration,
      minDuration,
      maxDuration,
      successRate,
      errorCount,
    }
  }

  // Delete a benchmark result
  deleteBenchmarkResult(id: string): void {
    this.benchmarkResults = this.benchmarkResults.filter((result) => result.id !== id)
    this.saveBenchmarkResults()
    this.notifyListeners()
  }

  // Clear all benchmark results
  clearBenchmarkResults(): void {
    this.benchmarkResults = []
    this.saveBenchmarkResults()
    this.notifyListeners()
  }

  // Add a listener for benchmark updates
  addListener(listener: (results: BenchmarkResult[]) => void): () => void {
    this.listeners.add(listener)

    // Return a function to remove the listener
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of updates
  private notifyListeners(): void {
    const results = this.getBenchmarkResults()
    this.listeners.forEach((listener) => {
      try {
        listener(results)
      } catch (error) {
        console.error("Error in benchmark listener:", error)
      }
    })
  }

  // Helper methods for environment detection
  private detectBrowser(): string {
    if (typeof window === "undefined") return "server"

    const userAgent = window.navigator.userAgent

    if (userAgent.indexOf("Chrome") > -1) return "Chrome"
    if (userAgent.indexOf("Safari") > -1) return "Safari"
    if (userAgent.indexOf("Firefox") > -1) return "Firefox"
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer"
    if (userAgent.indexOf("Edge") > -1) return "Edge"

    return "Unknown"
  }

  private detectPlatform(): string {
    if (typeof window === "undefined") return "server"

    const userAgent = window.navigator.userAgent

    if (userAgent.indexOf("Windows") > -1) return "Windows"
    if (userAgent.indexOf("Mac") > -1) return "Mac"
    if (userAgent.indexOf("Linux") > -1) return "Linux"
    if (userAgent.indexOf("Android") > -1) return "Android"
    if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1)
      return "iOS"

    return "Unknown"
  }

  // Estimate connection speed by downloading a small test file
  private async estimateConnectionSpeed(): Promise<string> {
    if (typeof window === "undefined") return "Unknown"

    try {
      const startTime = Date.now()
      // Use a small image or text file for testing
      const response = await fetch("/api/ping?size=50000", { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to fetch test file")

      await response.text() // Ensure the download completes
      const endTime = Date.now()
      const duration = endTime - startTime

      // Calculate speed in KB/s (assuming 50KB test file)
      const speedKBps = 50 / (duration / 1000)

      if (speedKBps < 50) return "Slow"
      if (speedKBps < 200) return "Medium"
      if (speedKBps < 1000) return "Fast"
      return "Very Fast"
    } catch (error) {
      console.error("Error estimating connection speed:", error)
      return "Unknown"
    }
  }

  // Get predefined benchmark configurations
  getPredefinedBenchmarks(): BenchmarkConfig[] {
    return [
      {
        name: "Memory Store Basic Operations",
        description: "Tests basic memory store operations like adding, retrieving, and searching memories",
        operations: [
          {
            name: "Add Memory",
            operationType: "addMemory",
            iterations: 20,
            fn: async () => {
              const randomText = `Test memory ${Math.random().toString(36).substring(2, 15)}`
              await memoryStore.addMemory(randomText, { benchmark: true })
            },
          },
          {
            name: "Store Structured Memory",
            operationType: "storeMemory",
            iterations: 20,
            fn: async () => {
              const key = `test-key-${Math.random().toString(36).substring(2, 9)}`
              const data = { value: Math.random(), timestamp: Date.now() }
              await memoryStore.storeMemory(key, data)
            },
          },
          {
            name: "Retrieve Structured Memory",
            operationType: "retrieveMemory",
            iterations: 20,
            fn: async () => {
              // First store a value to retrieve
              const key = `test-key-${Math.random().toString(36).substring(2, 9)}`
              const data = { value: Math.random(), timestamp: Date.now() }
              await memoryStore.storeMemory(key, data)

              // Then retrieve it
              await memoryStore.retrieveMemory(key)
            },
          },
          {
            name: "Search Memories",
            operationType: "searchMemories",
            iterations: 10,
            fn: async () => {
              await memoryStore.searchMemories("test", 5)
            },
          },
        ],
      },
      {
        name: "File Operations with Memory",
        description: "Tests file-related memory operations like tagging and recommendations",
        operations: [
          {
            name: "Remember Tag",
            operationType: "rememberTag",
            iterations: 10,
            fn: async () => {
              // Create a test file ID
              const fileId = `test-file-${Math.random().toString(36).substring(2, 9)}`

              // Remember a random tag
              const tag = `tag-${Math.random().toString(36).substring(2, 9)}`
              await memoryStore.rememberTag(fileId, tag)
            },
          },
          {
            name: "Get File Tags",
            operationType: "getFileTags",
            iterations: 10,
            fn: async () => {
              // Create a test file ID
              const fileId = `test-file-${Math.random().toString(36).substring(2, 9)}`

              // Add some tags
              await memoryStore.rememberTag(fileId, `tag-1-${Math.random().toString(36).substring(2, 9)}`)
              await memoryStore.rememberTag(fileId, `tag-2-${Math.random().toString(36).substring(2, 9)}`)

              // Get the tags
              await memoryStore.getFileTags(fileId)
            },
          },
          {
            name: "Track File Interaction",
            operationType: "trackFileInteraction",
            iterations: 10,
            fn: async () => {
              // Create a test file ID that might exist in the database
              // This might fail if the file doesn't exist, but that's OK for benchmarking
              try {
                const fileId = `test-file-${Math.random().toString(36).substring(2, 9)}`
                await memoryStore.trackFileInteraction(fileId, "view", "benchmark test")
              } catch (error) {
                // Ignore errors for benchmark purposes
              }
            },
          },
          {
            name: "Get File Recommendations",
            operationType: "getFileRecommendations",
            iterations: 5,
            fn: async () => {
              await memoryStore.getFileRecommendations(5)
            },
          },
        ],
      },
      {
        name: "Database Operations",
        description: "Tests database operations related to memory storage",
        operations: [
          {
            name: "Store Memory in Database",
            operationType: "dbStoreMemory",
            iterations: 10,
            fn: async () => {
              const userId = `test-user-${Math.random().toString(36).substring(2, 9)}`
              const content = `Test memory ${Math.random().toString(36).substring(2, 15)}`
              const metadata = { benchmark: true, timestamp: Date.now() }

              try {
                await dbService.storeMemory(userId, content, metadata)
              } catch (error) {
                // Ignore errors for benchmark purposes
                console.error("Error in database benchmark:", error)
              }
            },
          },
          {
            name: "Search Memories in Database",
            operationType: "dbSearchMemories",
            iterations: 5,
            fn: async () => {
              const userId = `test-user-${Math.random().toString(36).substring(2, 9)}`

              // First add some memories to search
              for (let i = 0; i < 5; i++) {
                const content = `Test memory ${i} ${Math.random().toString(36).substring(2, 15)}`
                const metadata = { benchmark: true, index: i }

                try {
                  await dbService.storeMemory(userId, content, metadata)
                } catch (error) {
                  // Ignore errors
                }
              }

              // Then search for them
              try {
                await dbService.searchMemories(userId, "Test memory", 10)
              } catch (error) {
                // Ignore errors for benchmark purposes
                console.error("Error in database search benchmark:", error)
              }
            },
          },
        ],
      },
    ]
  }

  // Create a custom benchmark configuration
  createCustomBenchmark(name: string, description: string, operations: string[]): BenchmarkConfig {
    const predefinedBenchmarks = this.getPredefinedBenchmarks()
    const allOperations: BenchmarkOperation[] = []

    // Collect all operations from predefined benchmarks
    predefinedBenchmarks.forEach((benchmark) => {
      benchmark.operations.forEach((operation) => {
        if (operations.includes(operation.name)) {
          allOperations.push(operation)
        }
      })
    })

    return {
      name,
      description,
      operations: allOperations,
    }
  }
}

// Create a singleton instance
export const benchmarkService = new BenchmarkService()

// Create a ping API endpoint for connection speed testing
export const createPingEndpoint = async (req: Request) => {
  const url = new URL(req.url)
  const size = Number.parseInt(url.searchParams.get("size") || "10000", 10)

  // Generate a string of the requested size
  const data = "X".repeat(size)

  return new Response(data, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
