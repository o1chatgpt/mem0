import type { FileInfo } from "./file-service"
import type { MemoryStore } from "./memory-store"

export interface FileRecommendation {
  fileId: string
  fileName: string
  reason: string
  score: number
  type: "recent" | "frequent" | "related" | "similar" | "contextual"
}

export class RecommendationEngine {
  private memoryStore: MemoryStore
  private accessPatterns: Map<string, { count: number; lastAccessed: Date }> = new Map()
  private fileRelationships: Map<string, Set<string>> = new Map()
  private initialized = false

  constructor(memoryStore: MemoryStore) {
    this.memoryStore = memoryStore
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Load access patterns from memory
      const patterns =
        await this.memoryStore.retrieveMemory<Record<string, { count: number; lastAccessed: string }>>(
          "fileAccessPatterns",
        )

      if (patterns) {
        Object.entries(patterns).forEach(([fileId, data]) => {
          this.accessPatterns.set(fileId, {
            count: data.count,
            lastAccessed: new Date(data.lastAccessed),
          })
        })
      }

      // Load file relationships from memory
      const relationships = await this.memoryStore.retrieveMemory<Record<string, string[]>>("fileRelationships")

      if (relationships) {
        Object.entries(relationships).forEach(([fileId, relatedIds]) => {
          this.fileRelationships.set(fileId, new Set(relatedIds))
        })
      }

      this.initialized = true
    } catch (error) {
      console.error("Error initializing recommendation engine:", error)
    }
  }

  async recordFileAccess(fileId: string, fileName: string): Promise<void> {
    if (!this.initialized) await this.initialize()

    const now = new Date()
    const existing = this.accessPatterns.get(fileId)

    if (existing) {
      this.accessPatterns.set(fileId, {
        count: existing.count + 1,
        lastAccessed: now,
      })
    } else {
      this.accessPatterns.set(fileId, {
        count: 1,
        lastAccessed: now,
      })
    }

    // Record this action in memory
    await this.memoryStore.addMemory(`Accessed file: ${fileName} (${fileId})`)

    // Save updated access patterns
    await this.persistAccessPatterns()
  }

  async recordFileRelationship(sourceFileId: string, targetFileId: string): Promise<void> {
    if (!this.initialized) await this.initialize()

    // Don't record relationship with self
    if (sourceFileId === targetFileId) return

    // Get or create the set of related files for the source file
    const relatedFiles = this.fileRelationships.get(sourceFileId) || new Set<string>()

    // Add the target file to the set
    relatedFiles.add(targetFileId)

    // Update the map
    this.fileRelationships.set(sourceFileId, relatedFiles)

    // Also record the reverse relationship for bidirectional recommendations
    const reverseRelatedFiles = this.fileRelationships.get(targetFileId) || new Set<string>()
    reverseRelatedFiles.add(sourceFileId)
    this.fileRelationships.set(targetFileId, reverseRelatedFiles)

    // Save updated relationships
    await this.persistRelationships()
  }

  async getRecommendations(
    currentFileId: string | null,
    allFiles: FileInfo[],
    limit = 5,
  ): Promise<FileRecommendation[]> {
    if (!this.initialized) await this.initialize()

    const recommendations: FileRecommendation[] = []
    const fileMap = new Map(allFiles.map((file) => [file.id, file]))

    // 1. Add recommendations based on related files if we have a current file
    if (currentFileId) {
      const relatedFileIds = this.fileRelationships.get(currentFileId)

      if (relatedFileIds) {
        for (const relatedId of relatedFileIds) {
          const file = fileMap.get(relatedId)

          if (file) {
            recommendations.push({
              fileId: file.id,
              fileName: file.name,
              reason: "Often used together",
              score: 0.9,
              type: "related",
            })
          }
        }
      }
    }

    // 2. Add recommendations based on frequently accessed files
    const frequentFiles = Array.from(this.accessPatterns.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)

    for (const [fileId, data] of frequentFiles) {
      const file = fileMap.get(fileId)

      if (file && fileId !== currentFileId) {
        recommendations.push({
          fileId: file.id,
          fileName: file.name,
          reason: `Accessed ${data.count} times`,
          score: 0.7 + (Math.min(data.count, 10) / 10) * 0.3,
          type: "frequent",
        })
      }
    }

    // 3. Add recommendations based on recently accessed files
    const recentFiles = Array.from(this.accessPatterns.entries())
      .sort((a, b) => b[1].lastAccessed.getTime() - a[1].lastAccessed.getTime())
      .slice(0, limit)

    for (const [fileId, data] of recentFiles) {
      const file = fileMap.get(fileId)

      if (file && fileId !== currentFileId && !recommendations.some((r) => r.fileId === fileId)) {
        const daysSinceAccess = Math.floor((Date.now() - data.lastAccessed.getTime()) / (1000 * 60 * 60 * 24))
        const timeDescription =
          daysSinceAccess === 0 ? "today" : daysSinceAccess === 1 ? "yesterday" : `${daysSinceAccess} days ago`

        recommendations.push({
          fileId: file.id,
          fileName: file.name,
          reason: `Accessed ${timeDescription}`,
          score: 0.6 + Math.max(0, (7 - Math.min(daysSinceAccess, 7)) / 7) * 0.4,
          type: "recent",
        })
      }
    }

    // 4. Add recommendations based on similar tags (if we have a current file)
    if (currentFileId) {
      const currentFileTags = await this.memoryStore.getFileTags(currentFileId)

      if (currentFileTags.length > 0) {
        for (const file of allFiles) {
          if (file.id !== currentFileId && !recommendations.some((r) => r.fileId === file.id)) {
            const fileTags = await this.memoryStore.getFileTags(file.id)

            // Calculate tag similarity (intersection)
            const commonTags = currentFileTags.filter((tag) => fileTags.includes(tag))

            if (commonTags.length > 0) {
              const similarity = commonTags.length / Math.max(currentFileTags.length, fileTags.length)

              recommendations.push({
                fileId: file.id,
                fileName: file.name,
                reason: `Similar tags: ${commonTags.join(", ")}`,
                score: 0.5 + similarity * 0.5,
                type: "similar",
              })
            }
          }
        }
      }
    }

    // Sort by score and limit
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  private async persistAccessPatterns(): Promise<void> {
    try {
      const patterns: Record<string, { count: number; lastAccessed: string }> = {}

      this.accessPatterns.forEach((data, fileId) => {
        patterns[fileId] = {
          count: data.count,
          lastAccessed: data.lastAccessed.toISOString(),
        }
      })

      await this.memoryStore.storeMemory("fileAccessPatterns", patterns)
    } catch (error) {
      console.error("Error persisting access patterns:", error)
    }
  }

  private async persistRelationships(): Promise<void> {
    try {
      const relationships: Record<string, string[]> = {}

      this.fileRelationships.forEach((relatedIds, fileId) => {
        relationships[fileId] = Array.from(relatedIds)
      })

      await this.memoryStore.storeMemory("fileRelationships", relationships)
    } catch (error) {
      console.error("Error persisting file relationships:", error)
    }
  }
}
