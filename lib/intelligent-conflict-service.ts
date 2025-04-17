import { Memory } from "./mem0-client"
import { serverConfig } from "./config"
import { v4 as uuidv4 } from "uuid"

// Types for intelligent conflict resolution
export interface EditingConflict {
  id: string
  documentId: string
  documentType: string
  section: string
  position: {
    start: number
    end: number
  }
  users: {
    id: string
    name: string
    content: string
    timestamp: number
  }[]
  context: {
    before: string
    after: string
  }
  severity: "low" | "medium" | "high"
  detected: number
  resolved?: {
    content: string
    strategy: ResolutionStrategy
    resolvedBy: string
    timestamp: number
    reasoning?: string
  }
}

export type ResolutionStrategy =
  | "accept-newest"
  | "accept-oldest"
  | "prefer-user"
  | "merge-changes"
  | "smart-merge"
  | "manual"

export interface UserEditingPattern {
  userId: string
  documentTypes: Record<string, number> // document type -> frequency
  editingTimes: number[] // timestamps of edits
  editingDurations: number[] // durations of editing sessions
  conflictFrequency: number
  preferredResolutions: Record<ResolutionStrategy, number>
  collaborators: Record<
    string,
    {
      userId: string
      frequency: number
      conflicts: number
      preferredResolution: ResolutionStrategy
    }
  >
  lastUpdated: number
}

export interface ConflictPrediction {
  likelihood: number // 0-1
  potentialUsers: string[]
  suggestedAction: "notify" | "lock-section" | "suggest-coordination" | "none"
  reasoning: string
}

export class IntelligentConflictService {
  private memory: Memory
  private userPatterns: Map<string, UserEditingPattern> = new Map()
  private documentConflicts: Map<string, EditingConflict[]> = new Map()
  private isInitialized = false

  constructor() {
    this.memory = new Memory()
  }

  /**
   * Initialize the service for a specific user
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load user editing patterns
      const pattern = await this.memory.retrieveMemory<UserEditingPattern>(`editing-pattern-${userId}`, userId)

      if (pattern) {
        this.userPatterns.set(userId, pattern)
      }

      this.isInitialized = true
    } catch (error) {
      console.error("Error initializing intelligent conflict service:", error)
    }
  }

  /**
   * Detect conflicts between multiple users editing the same document
   */
  async detectConflict(
    documentId: string,
    documentType: string,
    section: string,
    position: { start: number; end: number },
    userEdits: { userId: string; userName: string; content: string; timestamp: number }[],
    context: { before: string; after: string },
  ): Promise<EditingConflict | null> {
    // If there's only one user edit, there's no conflict
    if (userEdits.length <= 1) return null

    // Create a conflict object
    const conflict: EditingConflict = {
      id: uuidv4(),
      documentId,
      documentType,
      section,
      position,
      users: userEdits,
      context,
      severity: await this.calculateConflictSeverity(userEdits, position),
      detected: Date.now(),
    }

    // Store the conflict in memory
    await this.storeConflict(conflict)

    // Update user patterns
    for (const edit of userEdits) {
      await this.updateUserPattern(edit.userId, documentType, conflict.id)
    }

    return conflict
  }

  /**
   * Calculate the severity of a conflict based on the size of changes and overlap
   */
  async calculateConflictSeverity(
    userEdits: { userId: string; userName: string; content: string; timestamp: number }[],
    position: { start: number; end: number },
  ): Promise<"low" | "medium" | "high"> {
    // Calculate the total size of the conflicting area
    const conflictSize = position.end - position.start

    // Calculate the average difference between edits
    let totalDiff = 0
    for (let i = 0; i < userEdits.length; i++) {
      for (let j = i + 1; j < userEdits.length; j++) {
        const diff = await this.calculateDifference(userEdits[i].content, userEdits[j].content)
        totalDiff += diff
      }
    }

    const avgDiff = totalDiff / ((userEdits.length * (userEdits.length - 1)) / 2)

    // Determine severity based on conflict size and difference
    if (conflictSize > 100 && avgDiff > 0.7) {
      return "high"
    } else if (conflictSize > 50 || avgDiff > 0.4) {
      return "medium"
    } else {
      return "low"
    }
  }

  /**
   * Calculate a simple difference score between two strings (0-1)
   */
  async calculateDifference(a: string, b: string): Promise<number> {
    if (a === b) return 0
    if (a.length === 0 || b.length === 0) return 1

    // Simple difference calculation based on length and character differences
    const maxLength = Math.max(a.length, b.length)
    let differences = 0

    for (let i = 0; i < maxLength; i++) {
      if (a[i] !== b[i]) {
        differences++
      }
    }

    return differences / maxLength
  }

  /**
   * Store a conflict in Mem0 for future reference
   */
  async storeConflict(conflict: EditingConflict): Promise<void> {
    try {
      // Store in Mem0
      await this.memory.storeMemory(`conflict-${conflict.id}`, conflict, serverConfig.systemUserId || "system")

      // Store in local cache
      if (!this.documentConflicts.has(conflict.documentId)) {
        this.documentConflicts.set(conflict.documentId, [])
      }

      this.documentConflicts.get(conflict.documentId)!.push(conflict)

      // Store as memory for learning
      const userIds = conflict.users.map((u) => u.id).join(", ")
      await this.memory.add(
        [
          { role: "system", content: "Conflict detection" },
          {
            role: "user",
            content: `Conflict detected in document ${conflict.documentId} (${conflict.documentType}) between users ${userIds} in section ${conflict.section}. Severity: ${conflict.severity}.`,
          },
        ],
        serverConfig.systemUserId || "system",
      )
    } catch (error) {
      console.error("Error storing conflict:", error)
    }
  }

  /**
   * Update a user's editing pattern based on new activity
   */
  async updateUserPattern(userId: string, documentType: string, conflictId?: string): Promise<void> {
    try {
      // Get or create user pattern
      let pattern = this.userPatterns.get(userId)

      if (!pattern) {
        pattern = {
          userId,
          documentTypes: {},
          editingTimes: [],
          editingDurations: [],
          conflictFrequency: 0,
          preferredResolutions: {
            "accept-newest": 0,
            "accept-oldest": 0,
            "prefer-user": 0,
            "merge-changes": 0,
            "smart-merge": 0,
            manual: 0,
          },
          collaborators: {},
          lastUpdated: Date.now(),
        }
      }

      // Update document type frequency
      pattern.documentTypes[documentType] = (pattern.documentTypes[documentType] || 0) + 1

      // Add current time to editing times
      pattern.editingTimes.push(Date.now())

      // Keep only the last 100 editing times
      if (pattern.editingTimes.length > 100) {
        pattern.editingTimes = pattern.editingTimes.slice(-100)
      }

      // Update conflict frequency if this is a conflict
      if (conflictId) {
        pattern.conflictFrequency = pattern.conflictFrequency * 0.9 + 0.1 // Exponential moving average
      }

      // Update last updated timestamp
      pattern.lastUpdated = Date.now()

      // Save updated pattern
      this.userPatterns.set(userId, pattern)

      // Store in Mem0
      await this.memory.storeMemory(`editing-pattern-${userId}`, pattern, userId)
    } catch (error) {
      console.error("Error updating user pattern:", error)
    }
  }

  /**
   * Get a conflict by ID
   */
  async getConflict(conflictId: string): Promise<EditingConflict | null> {
    try {
      // Try to get from Mem0
      const conflict = await this.memory.retrieveMemory<EditingConflict>(
        `conflict-${conflictId}`,
        serverConfig.systemUserId || "system",
      )

      return conflict
    } catch (error) {
      console.error("Error getting conflict:", error)
      return null
    }
  }

  /**
   * Get all conflicts for a document
   */
  async getDocumentConflicts(documentId: string): Promise<EditingConflict[]> {
    // Return from cache if available
    if (this.documentConflicts.has(documentId)) {
      return this.documentConflicts.get(documentId)!
    }

    try {
      // Search for conflicts in Mem0
      const results = await this.memory.search({
        query: `conflict document ${documentId}`,
        user_id: serverConfig.systemUserId || "system",
        limit: 50,
      })

      const conflicts: EditingConflict[] = []

      if (results && results.results) {
        for (const result of results.results) {
          try {
            // Extract conflict ID from the memory
            const match = result.memory.match(/conflict-([a-zA-Z0-9-]+)/)
            if (match) {
              const conflictId = match[1]
              const conflict = await this.getConflict(conflictId)
              if (conflict && conflict.documentId === documentId) {
                conflicts.push(conflict)
              }
            }
          } catch (e) {
            console.error("Error parsing conflict from search result:", e)
          }
        }
      }

      // Cache the results
      this.documentConflicts.set(documentId, conflicts)

      return conflicts
    } catch (error) {
      console.error("Error getting document conflicts:", error)
      return []
    }
  }

  /**
   * Get intelligent resolution suggestions for a conflict
   */
  async getSuggestions(
    conflictId: string,
    userId: string,
  ): Promise<{
    suggestedStrategy: ResolutionStrategy
    suggestedContent: string
    confidence: number
    reasoning: string
    alternativeStrategies: ResolutionStrategy[]
  }> {
    await this.initialize(userId)

    try {
      // Get the conflict
      const conflict = await this.getConflict(conflictId)

      if (!conflict) {
        throw new Error("Conflict not found")
      }

      // Get user pattern
      const userPattern = this.userPatterns.get(userId)

      // Default response
      const defaultResponse = {
        suggestedStrategy: "smart-merge" as ResolutionStrategy,
        suggestedContent: await this.getMergedContent(conflict),
        confidence: 0.5,
        reasoning: "Based on the conflict analysis, a smart merge of the changes is recommended.",
        alternativeStrategies: ["accept-newest", "manual"] as ResolutionStrategy[],
      }

      if (!userPattern) {
        return defaultResponse
      }

      // Analyze user's preferred resolution strategies
      const preferredStrategies = Object.entries(userPattern.preferredResolutions)
        .sort((a, b) => b[1] - a[1])
        .map(([strategy]) => strategy as ResolutionStrategy)

      // Find the user's edit in the conflict
      const userEdit = conflict.users.find((u) => u.id === userId)

      // Find other users in the conflict
      const otherUsers = conflict.users.filter((u) => u.id !== userId)

      // Check if user has a preferred collaborator
      let preferredCollaborator = null
      for (const otherUser of otherUsers) {
        const collaborator = userPattern.collaborators[otherUser.id]
        if (collaborator && collaborator.frequency > 5) {
          preferredCollaborator = collaborator
          break
        }
      }

      // Determine the best strategy based on patterns
      let suggestedStrategy: ResolutionStrategy
      let suggestedContent: string
      let confidence: number
      let reasoning: string

      if (preferredCollaborator) {
        // User has a preferred collaborator
        suggestedStrategy = preferredCollaborator.preferredResolution
        const collaboratorEdit = conflict.users.find((u) => u.id === preferredCollaborator!.userId)

        if (suggestedStrategy === "prefer-user") {
          // User typically prefers their own edits
          suggestedContent = userEdit ? userEdit.content : await this.getMergedContent(conflict)
          confidence = 0.8
          reasoning = `You typically prefer your own changes when collaborating with ${collaboratorEdit?.name}.`
        } else if (suggestedStrategy === "accept-newest") {
          // User typically accepts the newest edits
          const newestEdit = [...conflict.users].sort((a, b) => b.timestamp - a.timestamp)[0]
          suggestedContent = newestEdit.content
          confidence = 0.75
          reasoning = `You typically accept the most recent changes when collaborating with ${collaboratorEdit?.name}.`
        } else {
          // Default to smart merge
          suggestedContent = await this.getMergedContent(conflict)
          suggestedStrategy = "smart-merge"
          confidence = 0.7
          reasoning = `Based on your collaboration history with ${collaboratorEdit?.name}, a smart merge is recommended.`
        }
      } else if (preferredStrategies.length > 0 && userPattern.preferredResolutions[preferredStrategies[0]] > 5) {
        // User has a clear preferred strategy
        suggestedStrategy = preferredStrategies[0]

        switch (suggestedStrategy) {
          case "accept-newest":
            const newestEdit = [...conflict.users].sort((a, b) => b.timestamp - a.timestamp)[0]
            suggestedContent = newestEdit.content
            confidence = 0.8
            reasoning = "Based on your history, you typically prefer the most recent changes."
            break
          case "accept-oldest":
            const oldestEdit = [...conflict.users].sort((a, b) => a.timestamp - b.timestamp)[0]
            suggestedContent = oldestEdit.content
            confidence = 0.8
            reasoning = "Based on your history, you typically prefer the original changes."
            break
          case "prefer-user":
            suggestedContent = userEdit ? userEdit.content : await this.getMergedContent(conflict)
            confidence = 0.85
            reasoning = "Based on your history, you typically prefer your own changes."
            break
          case "merge-changes":
          case "smart-merge":
            suggestedContent = await this.getMergedContent(conflict)
            confidence = 0.75
            reasoning = "Based on your history, you typically prefer to merge changes."
            break
          default:
            suggestedContent = await this.getMergedContent(conflict)
            confidence = 0.6
            reasoning = "Based on your history, a smart merge is recommended."
        }
      } else {
        // No clear pattern, use default
        return defaultResponse
      }

      // Determine alternative strategies
      const alternativeStrategies = preferredStrategies.filter((s) => s !== suggestedStrategy).slice(0, 2)

      // If we don't have enough alternatives, add some defaults
      if (alternativeStrategies.length < 2) {
        const defaults: ResolutionStrategy[] = ["manual", "smart-merge", "accept-newest"]
        for (const strategy of defaults) {
          if (!alternativeStrategies.includes(strategy) && strategy !== suggestedStrategy) {
            alternativeStrategies.push(strategy)
            if (alternativeStrategies.length >= 2) break
          }
        }
      }

      return {
        suggestedStrategy,
        suggestedContent,
        confidence,
        reasoning,
        alternativeStrategies,
      }
    } catch (error) {
      console.error("Error getting suggestions:", error)

      // Return a safe default
      return {
        suggestedStrategy: "smart-merge",
        suggestedContent: "",
        confidence: 0.3,
        reasoning: "Unable to analyze conflict patterns. A manual review is recommended.",
        alternativeStrategies: ["manual", "accept-newest"],
      }
    }
  }

  /**
   * Get a merged version of the conflicting content
   */
  async getMergedContent(conflict: EditingConflict): Promise<string> {
    // Simple merge strategy - could be improved with diff algorithms
    if (conflict.users.length === 0) return ""

    // If there's only one user, return their content
    if (conflict.users.length === 1) return conflict.users[0].content

    // Sort edits by timestamp (newest first)
    const sortedEdits = [...conflict.users].sort((a, b) => b.timestamp - a.timestamp)

    // For now, use a simple strategy: take the newest content
    // In a real implementation, you'd use a more sophisticated merge algorithm
    return sortedEdits[0].content
  }

  /**
   * Resolve a conflict with the chosen strategy
   */
  async resolveConflict(
    conflictId: string,
    strategy: ResolutionStrategy,
    content: string,
    reasoning?: string,
  ): Promise<EditingConflict | null> {
    try {
      // Get the conflict
      const conflict = await this.getConflict(conflictId)

      if (!conflict) {
        throw new Error("Conflict not found")
      }

      // Update the conflict with resolution
      const resolvedConflict: EditingConflict = {
        ...conflict,
        resolved: {
          content: content,
          strategy: strategy,
          resolvedBy: serverConfig.systemUserId || "system",
          timestamp: Date.now(),
          reasoning: reasoning,
        },
      }

      // Store the resolved conflict
      await this.memory.storeMemory(`conflict-${conflictId}`, resolvedConflict, serverConfig.systemUserId || "system")

      // Update local cache
      if (this.documentConflicts.has(conflict.documentId)) {
        const conflicts = this.documentConflicts.get(conflict.documentId)!
        const index = conflicts.findIndex((c) => c.id === conflictId)
        if (index >= 0) {
          conflicts[index] = resolvedConflict
        }
      }

      return resolvedConflict
    } catch (error) {
      console.error("Error resolving conflict:", error)
      return null
    }
  }

  /**
   * Predict potential conflicts based on current editing patterns
   */
  async predictConflicts(section: string): Promise<ConflictPrediction | null> {
    try {
      // For now, return null
      return null
    } catch (error) {
      console.error("Error predicting conflicts:", error)
      return null
    }
  }
}

// Export singleton instance
export const intelligentConflictService = new IntelligentConflictService()
