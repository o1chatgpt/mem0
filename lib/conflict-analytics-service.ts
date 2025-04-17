"use server"
import { serverConfig } from "./config"
import { Memory } from "./mem0-client"
import type { EditingConflict, ResolutionStrategy } from "./intelligent-conflict-service"

export interface ConflictAnalytics {
  summary: {
    totalConflicts: number
    resolvedConflicts: number
    resolutionRate: number
    averageResolutionTime: number // in minutes
  }
  byTime: {
    period: string // day, week, month
    conflicts: Array<{
      date: string
      count: number
      resolved: number
    }>
  }
  byUser: Array<{
    userId: string
    userName: string
    conflictsCreated: number
    conflictsResolved: number
    averageResolutionTime: number
    preferredStrategy: ResolutionStrategy
  }>
  byDocument: Array<{
    documentId: string
    documentName: string
    conflicts: number
    resolved: number
    hotspots: Array<{
      section: string
      conflicts: number
    }>
  }>
  byStrategy: Array<{
    strategy: ResolutionStrategy
    count: number
    averageResolutionTime: number
    successRate: number
  }>
}

export interface ConflictTimelineItem {
  id: string
  documentId: string
  documentName: string
  timestamp: number
  users: string[]
  severity: "low" | "medium" | "high"
  resolved: boolean
  resolutionTime?: number // in minutes
  strategy?: ResolutionStrategy
}

export interface UserConflictStats {
  userId: string
  userName: string
  totalEdits: number
  totalConflicts: number
  conflictRate: number
  collaborators: Array<{
    userId: string
    userName: string
    conflicts: number
    resolutionRate: number
  }>
  preferredResolutions: Record<ResolutionStrategy, number>
}

export class ConflictAnalyticsService {
  private memory: Memory

  constructor() {
    this.memory = new Memory()
  }

  /**
   * Get comprehensive conflict analytics
   */
  async getConflictAnalytics(
    timeRange: "week" | "month" | "year" = "month",
    userId?: string,
  ): Promise<ConflictAnalytics> {
    try {
      // Get all conflicts from memory
      const conflicts = await this.getAllConflicts(timeRange, userId)

      // Process conflicts into analytics data
      return this.processConflictsIntoAnalytics(conflicts, timeRange)
    } catch (error) {
      console.error("Error getting conflict analytics:", error)
      return this.getEmptyAnalytics()
    }
  }

  /**
   * Get conflict timeline for visualization
   */
  async getConflictTimeline(
    timeRange: "week" | "month" | "year" = "month",
    userId?: string,
  ): Promise<ConflictTimelineItem[]> {
    try {
      // Get all conflicts from memory
      const conflicts = await this.getAllConflicts(timeRange, userId)

      // Convert to timeline format
      return conflicts.map((conflict) => ({
        id: conflict.id,
        documentId: conflict.documentId,
        documentName: this.getDocumentName(conflict.documentId),
        timestamp: conflict.detected,
        users: conflict.users.map((u) => u.name),
        severity: conflict.severity,
        resolved: !!conflict.resolved,
        resolutionTime: conflict.resolved
          ? Math.round((conflict.resolved.timestamp - conflict.detected) / 60000)
          : undefined,
        strategy: conflict.resolved?.strategy,
      }))
    } catch (error) {
      console.error("Error getting conflict timeline:", error)
      return []
    }
  }

  /**
   * Get user-specific conflict statistics
   */
  async getUserConflictStats(userId: string): Promise<UserConflictStats | null> {
    try {
      // Get all conflicts involving this user
      const conflicts = await this.getAllConflicts("year", userId)

      // Get user editing patterns from memory
      const pattern = await this.memory.retrieveMemory<any>(`editing-pattern-${userId}`, userId)

      if (!pattern) {
        return null
      }

      // Process user stats
      const userConflicts = conflicts.filter((c) => c.users.some((u) => u.id === userId))

      // Get collaborator stats
      const collaborators: Record<
        string,
        {
          userId: string
          userName: string
          conflicts: number
          resolved: number
        }
      > = {}

      for (const conflict of userConflicts) {
        for (const user of conflict.users) {
          if (user.id !== userId) {
            if (!collaborators[user.id]) {
              collaborators[user.id] = {
                userId: user.id,
                userName: user.name,
                conflicts: 0,
                resolved: 0,
              }
            }

            collaborators[user.id].conflicts++

            if (conflict.resolved && conflict.resolved.resolvedBy === userId) {
              collaborators[user.id].resolved++
            }
          }
        }
      }

      return {
        userId,
        userName: this.getUserName(userId),
        totalEdits: pattern.editingTimes?.length || 0,
        totalConflicts: userConflicts.length,
        conflictRate: pattern.conflictFrequency || 0,
        collaborators: Object.values(collaborators).map((c) => ({
          userId: c.userId,
          userName: c.userName,
          conflicts: c.conflicts,
          resolutionRate: c.conflicts > 0 ? c.resolved / c.conflicts : 0,
        })),
        preferredResolutions: pattern.preferredResolutions || {
          "accept-newest": 0,
          "accept-oldest": 0,
          "prefer-user": 0,
          "merge-changes": 0,
          "smart-merge": 0,
          manual: 0,
        },
      }
    } catch (error) {
      console.error("Error getting user conflict stats:", error)
      return null
    }
  }

  /**
   * Get document-specific conflict statistics
   */
  async getDocumentConflictStats(documentId: string): Promise<{
    documentId: string
    documentName: string
    totalConflicts: number
    resolvedConflicts: number
    hotspots: Array<{
      section: string
      conflicts: number
    }>
    users: Array<{
      userId: string
      userName: string
      conflicts: number
    }>
  } | null> {
    try {
      // Get all conflicts for this document
      const conflicts = await this.getAllConflicts("year", undefined, documentId)

      if (conflicts.length === 0) {
        return null
      }

      // Process document stats
      const sections: Record<string, number> = {}
      const users: Record<
        string,
        {
          userId: string
          userName: string
          conflicts: number
        }
      > = {}

      for (const conflict of conflicts) {
        // Count conflicts by section
        if (!sections[conflict.section]) {
          sections[conflict.section] = 0
        }
        sections[conflict.section]++

        // Count conflicts by user
        for (const user of conflict.users) {
          if (!users[user.id]) {
            users[user.id] = {
              userId: user.id,
              userName: user.name,
              conflicts: 0,
            }
          }
          users[user.id].conflicts++
        }
      }

      return {
        documentId,
        documentName: this.getDocumentName(documentId),
        totalConflicts: conflicts.length,
        resolvedConflicts: conflicts.filter((c) => c.resolved).length,
        hotspots: Object.entries(sections)
          .map(([section, conflicts]) => ({ section, conflicts }))
          .sort((a, b) => b.conflicts - a.conflicts),
        users: Object.values(users).sort((a, b) => b.conflicts - a.conflicts),
      }
    } catch (error) {
      console.error("Error getting document conflict stats:", error)
      return null
    }
  }

  /**
   * Get all conflicts from memory
   */
  private async getAllConflicts(
    timeRange: "week" | "month" | "year" = "month",
    userId?: string,
    documentId?: string,
  ): Promise<EditingConflict[]> {
    // Calculate time range
    const now = Date.now()
    let startTime: number

    switch (timeRange) {
      case "week":
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case "month":
        startTime = now - 30 * 24 * 60 * 60 * 1000
        break
      case "year":
        startTime = now - 365 * 24 * 60 * 60 * 1000
        break
      default:
        startTime = now - 30 * 24 * 60 * 60 * 1000
    }

    // Build search query
    let query = "conflict"

    if (documentId) {
      query += ` document ${documentId}`
    }

    if (userId) {
      query += ` user ${userId}`
    }

    // Search for conflicts in memory
    const results = await this.memory.search({
      query,
      user_id: serverConfig.systemUserId || "system",
      limit: 500,
    })

    if (!results || !results.results) {
      return []
    }

    // Extract conflicts from search results
    const conflicts: EditingConflict[] = []
    const processedIds = new Set<string>()

    for (const result of results.results) {
      try {
        // Extract conflict ID from the memory
        const match = result.memory.match(/conflict-([a-zA-Z0-9-]+)/)
        if (match) {
          const conflictId = match[1]

          // Skip if already processed
          if (processedIds.has(conflictId)) {
            continue
          }

          // Get conflict details
          const conflict = await this.memory.retrieveMemory<EditingConflict>(
            `conflict-${conflictId}`,
            serverConfig.systemUserId || "system",
          )

          if (conflict) {
            // Filter by time range
            if (conflict.detected >= startTime) {
              // Filter by document ID if specified
              if (!documentId || conflict.documentId === documentId) {
                // Filter by user ID if specified
                if (!userId || conflict.users.some((u) => u.id === userId)) {
                  conflicts.push(conflict)
                  processedIds.add(conflictId)
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Error processing conflict from search result:", e)
      }
    }

    return conflicts
  }

  /**
   * Process conflicts into analytics data
   */
  private processConflictsIntoAnalytics(
    conflicts: EditingConflict[],
    timeRange: "week" | "month" | "year",
  ): ConflictAnalytics {
    // Initialize analytics object
    const analytics: ConflictAnalytics = this.getEmptyAnalytics()

    if (conflicts.length === 0) {
      return analytics
    }

    // Process summary statistics
    const resolvedConflicts = conflicts.filter((c) => c.resolved)

    analytics.summary = {
      totalConflicts: conflicts.length,
      resolvedConflicts: resolvedConflicts.length,
      resolutionRate: conflicts.length > 0 ? resolvedConflicts.length / conflicts.length : 0,
      averageResolutionTime: this.calculateAverageResolutionTime(resolvedConflicts),
    }

    // Process conflicts by time
    analytics.byTime = this.processConflictsByTime(conflicts, timeRange)

    // Process conflicts by user
    analytics.byUser = this.processConflictsByUser(conflicts)

    // Process conflicts by document
    analytics.byDocument = this.processConflictsByDocument(conflicts)

    // Process conflicts by strategy
    analytics.byStrategy = this.processConflictsByStrategy(resolvedConflicts)

    return analytics
  }

  /**
   * Calculate average resolution time in minutes
   */
  private calculateAverageResolutionTime(resolvedConflicts: EditingConflict[]): number {
    if (resolvedConflicts.length === 0) {
      return 0
    }

    const totalTime = resolvedConflicts.reduce((sum, conflict) => {
      if (conflict.resolved) {
        return sum + (conflict.resolved.timestamp - conflict.detected)
      }
      return sum
    }, 0)

    // Convert to minutes
    return Math.round(totalTime / resolvedConflicts.length / 60000)
  }

  /**
   * Process conflicts by time period
   */
  private processConflictsByTime(
    conflicts: EditingConflict[],
    timeRange: "week" | "month" | "year",
  ): ConflictAnalytics["byTime"] {
    let period: string
    let format: Intl.DateTimeFormatOptions
    let groupingFn: (date: Date) => string

    switch (timeRange) {
      case "week":
        period = "day"
        format = { month: "short", day: "numeric" }
        groupingFn = (date) => date.toLocaleDateString(undefined, format)
        break
      case "month":
        period = "day"
        format = { month: "short", day: "numeric" }
        groupingFn = (date) => date.toLocaleDateString(undefined, format)
        break
      case "year":
        period = "month"
        format = { year: "numeric", month: "short" }
        groupingFn = (date) => date.toLocaleDateString(undefined, format)
        break
      default:
        period = "day"
        format = { month: "short", day: "numeric" }
        groupingFn = (date) => date.toLocaleDateString(undefined, format)
    }

    // Group conflicts by date
    const conflictsByDate: Record<
      string,
      {
        count: number
        resolved: number
      }
    > = {}

    for (const conflict of conflicts) {
      const date = new Date(conflict.detected)
      const dateKey = groupingFn(date)

      if (!conflictsByDate[dateKey]) {
        conflictsByDate[dateKey] = { count: 0, resolved: 0 }
      }

      conflictsByDate[dateKey].count++

      if (conflict.resolved) {
        conflictsByDate[dateKey].resolved++
      }
    }

    // Convert to array and sort by date
    const result = Object.entries(conflictsByDate).map(([date, data]) => ({
      date,
      count: data.count,
      resolved: data.resolved,
    }))

    // Sort by date (assuming date strings are comparable)
    result.sort((a, b) => a.date.localeCompare(b.date))

    return {
      period,
      conflicts: result,
    }
  }

  /**
   * Process conflicts by user
   */
  private processConflictsByUser(conflicts: EditingConflict[]): ConflictAnalytics["byUser"] {
    // Group conflicts by user
    const userStats: Record<
      string,
      {
        userId: string
        userName: string
        conflictsCreated: number
        conflictsResolved: number
        resolutionTimes: number[]
        strategies: Record<ResolutionStrategy, number>
      }
    > = {}

    for (const conflict of conflicts) {
      // Count conflicts created by each user
      for (const user of conflict.users) {
        if (!userStats[user.id]) {
          userStats[user.id] = {
            userId: user.id,
            userName: user.name,
            conflictsCreated: 0,
            conflictsResolved: 0,
            resolutionTimes: [],
            strategies: {
              "accept-newest": 0,
              "accept-oldest": 0,
              "prefer-user": 0,
              "merge-changes": 0,
              "smart-merge": 0,
              manual: 0,
            },
          }
        }

        userStats[user.id].conflictsCreated++
      }

      // Count conflicts resolved by each user
      if (conflict.resolved) {
        const resolverId = conflict.resolved.resolvedBy

        if (!userStats[resolverId]) {
          userStats[resolverId] = {
            userId: resolverId,
            userName: this.getUserName(resolverId),
            conflictsCreated: 0,
            conflictsResolved: 0,
            resolutionTimes: [],
            strategies: {
              "accept-newest": 0,
              "accept-oldest": 0,
              "prefer-user": 0,
              "merge-changes": 0,
              "smart-merge": 0,
              manual: 0,
            },
          }
        }

        userStats[resolverId].conflictsResolved++

        // Track resolution time
        const resolutionTime = (conflict.resolved.timestamp - conflict.detected) / 60000 // in minutes
        userStats[resolverId].resolutionTimes.push(resolutionTime)

        // Track preferred strategy
        userStats[resolverId].strategies[conflict.resolved.strategy]++
      }
    }

    // Convert to array and calculate averages
    return Object.values(userStats)
      .map((user) => {
        // Calculate average resolution time
        const averageResolutionTime =
          user.resolutionTimes.length > 0
            ? user.resolutionTimes.reduce((sum, time) => sum + time, 0) / user.resolutionTimes.length
            : 0

        // Find preferred strategy
        let preferredStrategy: ResolutionStrategy = "manual"
        let maxCount = 0

        for (const [strategy, count] of Object.entries(user.strategies)) {
          if (count > maxCount) {
            maxCount = count
            preferredStrategy = strategy as ResolutionStrategy
          }
        }

        return {
          userId: user.userId,
          userName: user.userName,
          conflictsCreated: user.conflictsCreated,
          conflictsResolved: user.conflictsResolved,
          averageResolutionTime,
          preferredStrategy,
        }
      })
      .sort((a, b) => b.conflictsCreated - a.conflictsCreated)
  }

  /**
   * Process conflicts by document
   */
  private processConflictsByDocument(conflicts: EditingConflict[]): ConflictAnalytics["byDocument"] {
    // Group conflicts by document
    const documentStats: Record<
      string,
      {
        documentId: string
        documentName: string
        conflicts: number
        resolved: number
        sections: Record<string, number>
      }
    > = {}

    for (const conflict of conflicts) {
      if (!documentStats[conflict.documentId]) {
        documentStats[conflict.documentId] = {
          documentId: conflict.documentId,
          documentName: this.getDocumentName(conflict.documentId),
          conflicts: 0,
          resolved: 0,
          sections: {},
        }
      }

      documentStats[conflict.documentId].conflicts++

      if (conflict.resolved) {
        documentStats[conflict.documentId].resolved++
      }

      // Track conflicts by section
      if (!documentStats[conflict.documentId].sections[conflict.section]) {
        documentStats[conflict.documentId].sections[conflict.section] = 0
      }

      documentStats[conflict.documentId].sections[conflict.section]++
    }

    // Convert to array and format hotspots
    return Object.values(documentStats)
      .map((doc) => {
        // Convert sections to hotspots array
        const hotspots = Object.entries(doc.sections)
          .map(([section, conflicts]) => ({ section, conflicts }))
          .sort((a, b) => b.conflicts - a.conflicts)
          .slice(0, 5) // Top 5 hotspots

        return {
          documentId: doc.documentId,
          documentName: doc.documentName,
          conflicts: doc.conflicts,
          resolved: doc.resolved,
          hotspots,
        }
      })
      .sort((a, b) => b.conflicts - a.conflicts)
  }

  /**
   * Process conflicts by resolution strategy
   */
  private processConflictsByStrategy(resolvedConflicts: EditingConflict[]): ConflictAnalytics["byStrategy"] {
    // Group conflicts by strategy
    const strategyStats: Record<
      ResolutionStrategy,
      {
        count: number
        resolutionTimes: number[]
        // We'll define "success" as no further conflicts in the same section within 24 hours
        successes: number
      }
    > = {
      "accept-newest": { count: 0, resolutionTimes: [], successes: 0 },
      "accept-oldest": { count: 0, resolutionTimes: [], successes: 0 },
      "prefer-user": { count: 0, resolutionTimes: [], successes: 0 },
      "merge-changes": { count: 0, resolutionTimes: [], successes: 0 },
      "smart-merge": { count: 0, resolutionTimes: [], successes: 0 },
      manual: { count: 0, resolutionTimes: [], successes: 0 },
    }

    // Map of document+section to last conflict time
    const lastConflictTime: Record<string, number> = {}

    // Sort conflicts by detection time
    const sortedConflicts = [...resolvedConflicts].sort((a, b) => a.detected - b.detected)

    for (const conflict of sortedConflicts) {
      if (!conflict.resolved) continue

      const strategy = conflict.resolved.strategy
      const key = `${conflict.documentId}:${conflict.section}`

      // Check if this is a "success" (no conflicts within 24h of previous resolution)
      const lastTime = lastConflictTime[key]
      if (lastTime && conflict.detected - lastTime > 24 * 60 * 60 * 1000) {
        // Find the strategy used in the previous resolution
        const prevConflict = sortedConflicts.find(
          (c) =>
            c.documentId === conflict.documentId &&
            c.section === conflict.section &&
            c.resolved &&
            c.resolved.timestamp === lastTime,
        )

        if (prevConflict && prevConflict.resolved) {
          strategyStats[prevConflict.resolved.strategy].successes++
        }
      }

      // Update last conflict time
      lastConflictTime[key] = conflict.resolved.timestamp

      // Update strategy stats
      strategyStats[strategy].count++

      // Track resolution time
      const resolutionTime = (conflict.resolved.timestamp - conflict.detected) / 60000 // in minutes
      strategyStats[strategy].resolutionTimes.push(resolutionTime)
    }

    // Convert to array and calculate averages
    return Object.entries(strategyStats)
      .map(([strategy, stats]) => {
        // Calculate average resolution time
        const averageResolutionTime =
          stats.resolutionTimes.length > 0
            ? stats.resolutionTimes.reduce((sum, time) => sum + time, 0) / stats.resolutionTimes.length
            : 0

        // Calculate success rate
        const successRate = stats.count > 0 ? stats.successes / stats.count : 0

        return {
          strategy: strategy as ResolutionStrategy,
          count: stats.count,
          averageResolutionTime,
          successRate,
        }
      })
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get empty analytics object
   */
  private getEmptyAnalytics(): ConflictAnalytics {
    return {
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
  }

  /**
   * Get document name from ID (placeholder implementation)
   */
  private getDocumentName(documentId: string): string {
    // In a real implementation, you would fetch this from your database
    // For now, we'll just return a placeholder
    return `Document ${documentId.substring(0, 8)}`
  }

  /**
   * Get user name from ID (placeholder implementation)
   */
  private getUserName(userId: string): string {
    // In a real implementation, you would fetch this from your database
    // For now, we'll just return a placeholder
    return `User ${userId.substring(0, 8)}`
  }
}

// Export singleton instance
export const conflictAnalyticsService = new ConflictAnalyticsService()
