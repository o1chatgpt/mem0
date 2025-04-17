import { Memory } from "@/lib/mem0-client"

export interface CollaborationInsight {
  type: "pattern" | "suggestion" | "statistic"
  content: string
  confidence: number
}

export class CollaborationAnalyzer {
  private memory: Memory

  constructor() {
    this.memory = new Memory()
  }

  async getCollaborationInsights(userId: string): Promise<CollaborationInsight[]> {
    try {
      // Search for collaboration patterns
      const result = await this.memory.search({
        query: "collaboration pattern",
        user_id: userId,
        limit: 20,
      })

      if (!result || !result.results || result.results.length === 0) {
        return []
      }

      // Analyze the memories to extract insights
      const insights: CollaborationInsight[] = []

      // Count edit operations by type
      const operationCounts: Record<string, number> = {}
      let totalOperations = 0

      for (const item of result.results) {
        const memory = item.memory

        // Extract operation type
        if (memory.includes("performed insert operation")) {
          operationCounts["insert"] = (operationCounts["insert"] || 0) + 1
          totalOperations++
        } else if (memory.includes("performed delete operation")) {
          operationCounts["delete"] = (operationCounts["delete"] || 0) + 1
          totalOperations++
        }
      }

      // Generate insights based on operation patterns
      if (totalOperations > 0) {
        // Calculate percentages
        const insertPercentage = ((operationCounts["insert"] || 0) / totalOperations) * 100
        const deletePercentage = ((operationCounts["delete"] || 0) / totalOperations) * 100

        insights.push({
          type: "statistic",
          content: `You've made ${totalOperations} edits in collaborative sessions (${Math.round(insertPercentage)}% insertions, ${Math.round(deletePercentage)}% deletions)`,
          confidence: 0.9,
        })

        // Add pattern insights
        if (insertPercentage > 70) {
          insights.push({
            type: "pattern",
            content: "You primarily add content when collaborating with others",
            confidence: 0.8,
          })
        } else if (deletePercentage > 70) {
          insights.push({
            type: "pattern",
            content: "You primarily remove or refine content when collaborating",
            confidence: 0.8,
          })
        }
      }

      // Add suggestions based on patterns
      if (insights.length > 0) {
        insights.push({
          type: "suggestion",
          content: "Consider using comments to explain significant changes to collaborators",
          confidence: 0.7,
        })
      }

      return insights
    } catch (error) {
      console.error("Error analyzing collaboration patterns:", error)
      return []
    }
  }

  async getCollaboratorRecommendations(userId: string, fileId: string): Promise<string[]> {
    try {
      // Search for collaboration history with this file
      const result = await this.memory.search({
        query: `file ${fileId} collaboration`,
        user_id: userId,
        limit: 10,
      })

      if (!result || !result.results || result.results.length === 0) {
        return []
      }

      // Extract user names from collaboration memories
      const collaborators = new Set<string>()

      for (const item of result.results) {
        const memory = item.memory

        // Extract user names using regex
        const userMatch = memory.match(/User ([a-zA-Z0-9_\s]+) (joined|left|performed)/)
        if (userMatch && userMatch[1]) {
          const userName = userMatch[1].trim()
          if (userName) {
            collaborators.add(userName)
          }
        }
      }

      return Array.from(collaborators)
    } catch (error) {
      console.error("Error getting collaborator recommendations:", error)
      return []
    }
  }
}

export const collaborationAnalyzer = new CollaborationAnalyzer()
