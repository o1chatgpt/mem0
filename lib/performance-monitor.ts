// Performance monitoring service for tracking memory operations

// Define types for performance metrics
export interface PerformanceMetric {
  operationId: string
  operationType: string
  startTime: number
  endTime: number
  duration: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface PerformanceSummary {
  operationType: string
  count: number
  totalDuration: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  successRate: number
  errorCount: number
}

// Maximum number of metrics to keep in memory
const MAX_METRICS_HISTORY = 1000

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private listeners: Set<(metrics: PerformanceMetric[]) => void> = new Set()
  private isRecording = true

  // Start tracking a new operation
  startOperation(operationType: string, metadata?: Record<string, any>): string {
    if (!this.isRecording) return ""

    const operationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Don't actually add the metric yet, just return the ID
    // We'll add it when the operation completes
    return operationId
  }

  // Complete a tracked operation
  completeOperation(operationId: string, success: boolean, error?: string): void {
    if (!this.isRecording || !operationId) return

    const startTime = Number.parseInt(operationId.split("-")[0], 10)
    if (isNaN(startTime)) return

    const endTime = Date.now()
    const duration = endTime - startTime

    // Extract operation type from the ID if available
    const operationType = operationId.includes(":") ? operationId.split(":")[0] : "unknown"

    const metric: PerformanceMetric = {
      operationId,
      operationType,
      startTime,
      endTime,
      duration,
      success,
      error,
    }

    this.addMetric(metric)
  }

  // Track an operation from start to finish
  async trackOperation<T>(
    operationType: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    if (!this.isRecording) return operation()

    const operationId = `${operationType}:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const startTime = Date.now()

    try {
      const result = await operation()

      const endTime = Date.now()
      const duration = endTime - startTime

      const metric: PerformanceMetric = {
        operationId,
        operationType,
        startTime,
        endTime,
        duration,
        success: true,
        metadata,
      }

      this.addMetric(metric)

      return result
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      const metric: PerformanceMetric = {
        operationId,
        operationType,
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata,
      }

      this.addMetric(metric)

      throw error
    }
  }

  // Add a metric to the collection and notify listeners
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Trim the metrics array if it gets too large
    if (this.metrics.length > MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-MAX_METRICS_HISTORY)
    }

    // Notify all listeners
    this.notifyListeners()
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Get metrics for a specific operation type
  getMetricsByType(operationType: string): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.operationType === operationType)
  }

  // Get metrics from a specific time range
  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.startTime >= startTime && metric.endTime <= endTime)
  }

  // Calculate summary statistics for all operations
  getSummary(): PerformanceSummary[] {
    const operationTypes = new Set(this.metrics.map((metric) => metric.operationType))

    return Array.from(operationTypes).map((operationType) => {
      const typeMetrics = this.getMetricsByType(operationType)
      const count = typeMetrics.length
      const totalDuration = typeMetrics.reduce((sum, metric) => sum + metric.duration, 0)
      const durations = typeMetrics.map((metric) => metric.duration)
      const successCount = typeMetrics.filter((metric) => metric.success).length

      return {
        operationType,
        count,
        totalDuration,
        averageDuration: count > 0 ? totalDuration / count : 0,
        minDuration: count > 0 ? Math.min(...durations) : 0,
        maxDuration: count > 0 ? Math.max(...durations) : 0,
        successRate: count > 0 ? (successCount / count) * 100 : 100,
        errorCount: count - successCount,
      }
    })
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = []
    this.notifyListeners()
  }

  // Enable or disable recording
  setRecording(isRecording: boolean): void {
    this.isRecording = isRecording
  }

  // Add a listener for real-time updates
  addListener(listener: (metrics: PerformanceMetric[]) => void): () => void {
    this.listeners.add(listener)

    // Return a function to remove the listener
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of updates
  private notifyListeners(): void {
    const metrics = this.getMetrics()
    this.listeners.forEach((listener) => {
      try {
        listener(metrics)
      } catch (error) {
        console.error("Error in performance monitor listener:", error)
      }
    })
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor()
