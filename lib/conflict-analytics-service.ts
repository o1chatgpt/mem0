"use server"

import { db } from "@/lib/db"
import { cacheService } from "@/lib/cache"
import { serverConfig } from "./config"
import { Memory } from "./mem0-client"
import type { EditingConflict, ResolutionStrategy } from "./intelligent-conflict-service"

// Cache namespaces
const CACHE_NAMESPACES = {
  ANALYTICS: "conflict-analytics",
  TIMELINE: "conflict-timeline",
  USER_STATS: "user-conflict-stats",
  DOC_STATS: "document-conflict-stats",
}

// Cache TTLs in seconds
const CACHE_TTL = {
  ANALYTICS: 60 * 5, // 5 minutes
  TIMELINE: 60 * 5, // 5 minutes
  USER_STATS: 60 * 10, // 10 minutes
  DOC_STATS: 60 * 10, // 10 minutes
}

export type ConflictAnalytics = {
  totalConflicts: number
  resolvedConflicts: number
  pendingConflicts: number
  conflictsByType: {
    type: string
    count: number
  }[]
  conflictsByUser: {
    userId: string
    userName: string
    count: number
  }[]
  conflictsByDocument: {
    documentId: string
    documentName: string
    count: number
  }[]
}

export type ConflictTimelineEntry = {
  date: string
  conflicts: number
  resolved: number
}

export type ConflictTimeline = ConflictTimelineEntry[]

export type UserConflictStats = {
  userId: string
  userName: string
  totalConflicts: number
  resolvedConflicts: number
  pendingConflicts: number
  resolutionRate: number
  averageResolutionTime: number // in hours
  conflictsByType: {
    type: string
    count: number
  }[]
  recentConflicts: {
    id: string
    documentId: string
    documentName: string
    createdAt: string
    status: string
  }[]
}

export type DocumentConflictStats = {
  documentId: string
  documentName: string
  totalConflicts: number
  resolvedConflicts: number
  pendingConflicts: number
  conflictsByUser: {
    userId: string
    userName: string
    count: number
  }[]
  conflictTimeline: ConflictTimelineEntry[]
  recentConflicts: {
    id: string
    userId: string
    userName: string
    createdAt: string
    status: string
  }[]
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

export interface UserConflictStatsOld {
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

class ConflictAnalyticsService {
  private memory: Memory

  constructor() {
    this.memory = new Memory()
  }

  /**
   * Get conflict analytics data
   */
  async getConflictAnalytics(
    timeRange: "week" | "month" | "year" = "month",
    userId?: string,
  ): Promise<ConflictAnalytics> {
    // Generate cache key based on parameters
    const cacheKey = `analytics:${timeRange}:${userId || "all"}`

    try {
      // Try to get from cache first
      const cached = await cacheService.get<ConflictAnalytics>(cacheKey, { namespace: CACHE_NAMESPACES.ANALYTICS })

      if (cached) {
        console.log(`Serving conflict analytics from cache: ${cacheKey}`)
        return cached
      }

      // If not in cache, fetch from database
      console.log(`Fetching conflict analytics from database: ${cacheKey}`)

      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      if (timeRange === "week") {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === "month") {
        startDate.setMonth(now.getMonth() - 1)
      } else if (timeRange === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Base query conditions
      let whereClause = {
        createdAt: {
          gte: startDate.toISOString(),
        },
      }

      // Add user filter if provided
      if (userId) {
        whereClause = {
          ...whereClause,
          userId,
        }
      }

      // Get total conflicts
      const totalConflicts = await db.conflict.count({
        where: whereClause,
      })

      // Get resolved conflicts
      const resolvedConflicts = await db.conflict.count({
        where: {
          ...whereClause,
          status: "resolved",
        },
      })

      // Get pending conflicts
      const pendingConflicts = await db.conflict.count({
        where: {
          ...whereClause,
          status: "pending",
        },
      })

      // Get conflicts by type
      const conflictsByType = await db.conflict.groupBy({
        by: ["type"],
        where: whereClause,
        _count: {
          type: true,
        },
      })

      // Get conflicts by user
      const conflictsByUser = await db.conflict.groupBy({
        by: ["userId"],
        where: whereClause,
        _count: {
          userId: true,
        },
      })

      // Get user details
      const userIds = conflictsByUser.map((item) => item.userId)
      const users = await db.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })

      // Get conflicts by document
      const conflictsByDocument = await db.conflict.groupBy({
        by: ["documentId"],
        where: whereClause,
        _count: {
          documentId: true,
        },
      })

      // Get document details
      const documentIds = conflictsByDocument.map((item) => item.documentId)
      const documents = await db.document.findMany({
        where: {
          id: {
            in: documentIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })

      // Format the results
      const result: ConflictAnalytics = {
        totalConflicts,
        resolvedConflicts,
        pendingConflicts,
        conflictsByType: conflictsByType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
        conflictsByUser: conflictsByUser.map((item) => {
          const user = users.find((u) => u.id === item.userId)
          return {
            userId: item.userId,
            userName: user?.name || "Unknown User",
            count: item._count.userId,
          }
        }),
        conflictsByDocument: conflictsByDocument.map((item) => {
          const document = documents.find((d) => d.id === item.documentId)
          return {
            documentId: item.documentId,
            documentName: document?.name || "Unknown Document",
            count: item._count.documentId,
          }
        }),
      }

      // Store in cache
      await cacheService.set(cacheKey, result, {
        namespace: CACHE_NAMESPACES.ANALYTICS,
        ttl: CACHE_TTL.ANALYTICS,
      })

      return result
    } catch (error) {
      console.error("Error getting conflict analytics:", error)
      throw error
    }
  }

  /**
   * Get conflict timeline for visualization
   */
  async getConflictTimeline(
    timeRange: "week" | "month" | "year" = "month",
    userId?: string,
  ): Promise<ConflictTimeline> {
    // Generate cache key based on parameters
    const cacheKey = `timeline:${timeRange}:${userId || "all"}`

    try {
      // Try to get from cache first
      const cached = await cacheService.get<ConflictTimeline>(cacheKey, { namespace: CACHE_NAMESPACES.TIMELINE })

      if (cached) {
        console.log(`Serving conflict timeline from cache: ${cacheKey}`)
        return cached
      }

      // If not in cache, fetch from database
      console.log(`Fetching conflict timeline from database: ${cacheKey}`)

      // Calculate date range
      const now = new Date()
      const startDate = new Date()
      let interval: "day" | "week" | "month" = "day"

      if (timeRange === "week") {
        startDate.setDate(now.getDate() - 7)
        interval = "day"
      } else if (timeRange === "month") {
        startDate.setMonth(now.getMonth() - 1)
        interval = "day"
      } else if (timeRange === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
        interval = "month"
      }

      // Base query conditions
      let whereClause = {
        createdAt: {
          gte: startDate.toISOString(),
        },
      }

      // Add user filter if provided
      if (userId) {
        whereClause = {
          ...whereClause,
          userId,
        }
      }

      // Get all conflicts in the time range
      const conflicts = await db.conflict.findMany({
        where: whereClause,
        select: {
          id: true,
          createdAt: true,
          status: true,
        },
      })

      // Group conflicts by date
      const conflictsByDate = new Map<string, { conflicts: number; resolved: number }>()

      // Generate all dates in the range
      const dateRange: string[] = []
      const tempDate = new Date(startDate)
      while (tempDate <= now) {
        let dateKey: string

        if (interval === "day") {
          dateKey = tempDate.toISOString().split("T")[0]
        } else if (interval === "week") {
          const weekStart = new Date(tempDate)
          weekStart.setDate(tempDate.getDate() - tempDate.getDay())
          dateKey = weekStart.toISOString().split("T")[0]
        } else {
          dateKey = `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1).toString().padStart(2, "0")}`
        }

        if (!conflictsByDate.has(dateKey)) {
          conflictsByDate.set(dateKey, { conflicts: 0, resolved: 0 })
        }

        if (interval === "day") {
          tempDate.setDate(tempDate.getDate() + 1)
        } else if (interval === "week") {
          tempDate.setDate(tempDate.getDate() + 7)
        } else {
          tempDate.setMonth(tempDate.getMonth() + 1)
        }
      }

      // Count conflicts by date
      conflicts.forEach((conflict) => {
        const date = new Date(conflict.createdAt)
        let dateKey: string

        if (interval === "day") {
          dateKey = date.toISOString().split("T")[0]
        } else if (interval === "week") {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          dateKey = weekStart.toISOString().split("T")[0]
        } else {
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
        }

        if (!conflictsByDate.has(dateKey)) {
          conflictsByDate.set(dateKey, { conflicts: 0, resolved: 0 })
        }

        const entry = conflictsByDate.get(dateKey)!
        entry.conflicts++

        if (conflict.status === "resolved") {
          entry.resolved++
        }
      })

      // Convert to array and sort by date
      const result: ConflictTimeline = Array.from(conflictsByDate.entries())
        .map(([date, counts]) => ({
          date,
          conflicts: counts.conflicts,
          resolved: counts.resolved,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Store in cache
      await cacheService.set(cacheKey, result, {
        namespace: CACHE_NAMESPACES.TIMELINE,
        ttl: CACHE_TTL.TIMELINE,
      })

      return result
    } catch (error) {
      console.error("Error getting conflict timeline:", error)
      throw error
    }
  }

  /**
   * Get user-specific conflict statistics
   */
  async getUserConflictStats(userId: string): Promise<UserConflictStats> {
    // Generate cache key based on parameters
    const cacheKey = `user-stats:${userId}`

    try {
      // Try to get from cache first
      const cached = await cacheService.get<UserConflictStats>(cacheKey, { namespace: CACHE_NAMESPACES.USER_STATS })

      if (cached) {
        console.log(`Serving user conflict stats from cache: ${cacheKey}`)
        return cached
      }

      // If not in cache, fetch from database
      console.log(`Fetching user conflict stats from database: ${cacheKey}`)

      // Get user details
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
        },
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      // Get total conflicts
      const totalConflicts = await db.conflict.count({
        where: {
          userId,
        },
      })

      // Get resolved conflicts
      const resolvedConflicts = await db.conflict.count({
        where: {
          userId,
          status: "resolved",
        },
      })

      // Get pending conflicts
      const pendingConflicts = await db.conflict.count({
        where: {
          userId,
          status: "pending",
        },
      })

      // Calculate resolution rate
      const resolutionRate = totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 0

      // Get conflicts by type
      const conflictsByType = await db.conflict.groupBy({
        by: ["type"],
        where: {
          userId,
        },
        _count: {
          type: true,
        },
      })

      // Get resolved conflicts with resolution time
      const resolvedConflictsWithTime = await db.conflict.findMany({
        where: {
          userId,
          status: "resolved",
          resolvedAt: {
            not: null,
          },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      })

      // Calculate average resolution time in hours
      let totalResolutionTime = 0
      resolvedConflictsWithTime.forEach((conflict) => {
        const createdAt = new Date(conflict.createdAt).getTime()
        const resolvedAt = new Date(conflict.resolvedAt!).getTime()
        const resolutionTime = (resolvedAt - createdAt) / (1000 * 60 * 60) // in hours
        totalResolutionTime += resolutionTime
      })

      const averageResolutionTime =
        resolvedConflictsWithTime.length > 0 ? totalResolutionTime / resolvedConflictsWithTime.length : 0

      // Get recent conflicts
      const recentConflicts = await db.conflict.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          documentId: true,
          createdAt: true,
          status: true,
          document: {
            select: {
              name: true,
            },
          },
        },
      })

      // Format the results
      const result: UserConflictStats = {
        userId: user.id,
        userName: user.name,
        totalConflicts,
        resolvedConflicts,
        pendingConflicts,
        resolutionRate,
        averageResolutionTime,
        conflictsByType: conflictsByType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
        recentConflicts: recentConflicts.map((conflict) => ({
          id: conflict.id,
          documentId: conflict.documentId,
          documentName: conflict.document?.name || "Unknown Document",
          createdAt: conflict.createdAt.toISOString(),
          status: conflict.status,
        })),
      }

      // Store in cache
      await cacheService.set(cacheKey, result, {
        namespace: CACHE_NAMESPACES.USER_STATS,
        ttl: CACHE_TTL.USER_STATS,
      })

      return result
    } catch (error) {
      console.error("Error getting user conflict stats:", error)
      throw error
    }
  }

  /**
   * Get document-specific conflict statistics
   */
  async getDocumentConflictStats(documentId: string): Promise<DocumentConflictStats> {
    // Generate cache key based on parameters
    const cacheKey = `doc-stats:${documentId}`

    try {
      // Try to get from cache first
      const cached = await cacheService.get<DocumentConflictStats>(cacheKey, { namespace: CACHE_NAMESPACES.DOC_STATS })

      if (cached) {
        console.log(`Serving document conflict stats from cache: ${cacheKey}`)
        return cached
      }

      // If not in cache, fetch from database
      console.log(`Fetching document conflict stats from database: ${cacheKey}`)

      // Get document details
      const document = await db.document.findUnique({
        where: {
          id: documentId,
        },
        select: {
          id: true,
          name: true,
        },
      })

      if (!document) {
        throw new Error(`Document with ID ${documentId} not found`)
      }

      // Get total conflicts
      const totalConflicts = await db.conflict.count({
        where: {
          documentId,
        },
      })

      // Get resolved conflicts
      const resolvedConflicts = await db.conflict.count({
        where: {
          documentId,
          status: "resolved",
        },
      })

      // Get pending conflicts
      const pendingConflicts = await db.conflict.count({
        where: {
          documentId,
          status: "pending",
        },
      })

      // Get conflicts by user
      const conflictsByUser = await db.conflict.groupBy({
        by: ["userId"],
        where: {
          documentId,
        },
        _count: {
          userId: true,
        },
      })

      // Get user details
      const userIds = conflictsByUser.map((item) => item.userId)
      const users = await db.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })

      // Get conflict timeline (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const conflicts = await db.conflict.findMany({
        where: {
          documentId,
          createdAt: {
            gte: thirtyDaysAgo.toISOString(),
          },
        },
        select: {
          id: true,
          createdAt: true,
          status: true,
        },
      })

      // Group conflicts by date
      const conflictsByDate = new Map<string, { conflicts: number; resolved: number }>()

      // Generate all dates in the range
      const dateRange: string[] = []
      const tempDate = new Date(thirtyDaysAgo)
      const now = new Date()
      while (tempDate <= now) {
        const dateKey = tempDate.toISOString().split("T")[0]
        if (!conflictsByDate.has(dateKey)) {
          conflictsByDate.set(dateKey, { conflicts: 0, resolved: 0 })
        }
        tempDate.setDate(tempDate.getDate() + 1)
      }

      // Count conflicts by date
      conflicts.forEach((conflict) => {
        const dateKey = new Date(conflict.createdAt).toISOString().split("T")[0]
        if (!conflictsByDate.has(dateKey)) {
          conflictsByDate.set(dateKey, { conflicts: 0, resolved: 0 })
        }
        const entry = conflictsByDate.get(dateKey)!
        entry.conflicts++
        if (conflict.status === "resolved") {
          entry.resolved++
        }
      })

      // Convert to array and sort by date
      const conflictTimeline = Array.from(conflictsByDate.entries())
        .map(([date, counts]) => ({
          date,
          conflicts: counts.conflicts,
          resolved: counts.resolved,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Get recent conflicts
      const recentConflicts = await db.conflict.findMany({
        where: {
          documentId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          userId: true,
          createdAt: true,
          status: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      // Format the results
      const result: DocumentConflictStats = {
        documentId: document.id,
        documentName: document.name,
        totalConflicts,
        resolvedConflicts,
        pendingConflicts,
        conflictsByUser: conflictsByUser.map((item) => {
          const user = users.find((u) => u.id === item.userId)
          return {
            userId: item.userId,
            userName: user?.name || "Unknown User",
            count: item._count.userId,
          }
        }),
        conflictTimeline,
        recentConflicts: recentConflicts.map((conflict) => ({
          id: conflict.id,
          userId: conflict.userId,
          userName: conflict.user?.name || "Unknown User",
          createdAt: conflict.createdAt.toISOString(),
          status: conflict.status,
        })),
      }

      // Store in cache
      await cacheService.set(cacheKey, result, {
        namespace: CACHE_NAMESPACES.DOC_STATS,
        ttl: CACHE_TTL.DOC_STATS,
      })

      return result
    } catch (error) {
      console.error("Error getting document conflict stats:", error)
      throw error
    }
  }

  /**
   * Invalidate all caches related to conflict analytics
   */
  async invalidateAllCaches(): Promise<void> {
    try {
      await Promise.all([
        cacheService.clearNamespace(CACHE_NAMESPACES.ANALYTICS),
        cacheService.clearNamespace(CACHE_NAMESPACES.TIMELINE),
        cacheService.clearNamespace(CACHE_NAMESPACES.USER_STATS),
        cacheService.clearNamespace(CACHE_NAMESPACES.DOC_STATS),
      ])
      console.log("All conflict analytics caches invalidated")
    } catch (error) {
      console.error("Error invalidating conflict analytics caches:", error)
      throw error
    }
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      // Delete specific user stats cache
      await cacheService.delete(`user-stats:${userId}`, {
        namespace: CACHE_NAMESPACES.USER_STATS,
      })

      // Clear analytics and timeline caches that might contain this user's data
      await Promise.all([
        cacheService.clearNamespace(CACHE_NAMESPACES.ANALYTICS),
        cacheService.clearNamespace(CACHE_NAMESPACES.TIMELINE),
      ])

      console.log(`Cache invalidated for user: ${userId}`)
    } catch (error) {
      console.error(`Error invalidating cache for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Invalidate cache for a specific document
   */
  async invalidateDocumentCache(documentId: string): Promise<void> {
    try {
      // Delete specific document stats cache
      await cacheService.delete(`doc-stats:${documentId}`, {
        namespace: CACHE_NAMESPACES.DOC_STATS,
      })

      // Clear analytics caches that might contain this document's data
      await cacheService.clearNamespace(CACHE_NAMESPACES.ANALYTICS)

      console.log(`Cache invalidated for document: ${documentId}`)
    } catch (error) {
      console.error(`Error invalidating cache for document ${documentId}:`, error)
      throw error
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

export const conflictAnalyticsService = new ConflictAnalyticsService()
