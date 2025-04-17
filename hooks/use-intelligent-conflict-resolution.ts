"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-context"
import type { EditingConflict, ResolutionStrategy, ConflictPrediction } from "@/lib/intelligent-conflict-service"

export function useIntelligentConflictResolution(documentId: string, documentType: string) {
  const { user } = useSupabase()
  const [activeConflicts, setActiveConflicts] = useState<EditingConflict[]>([])
  const [currentConflict, setCurrentConflict] = useState<EditingConflict | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    suggestedStrategy: ResolutionStrategy
    suggestedContent: string
    confidence: number
    reasoning: string
    alternativeStrategies: ResolutionStrategy[]
  } | null>(null)
  const [prediction, setPrediction] = useState<ConflictPrediction | null>(null)

  // Load active conflicts for this document
  useEffect(() => {
    if (!user || !documentId) return

    const loadConflicts = async () => {
      try {
        const response = await fetch(`/api/intelligent-conflicts?documentId=${documentId}`)

        if (response.ok) {
          const conflicts = await response.json()
          setActiveConflicts(conflicts.filter((c: EditingConflict) => !c.resolved))
        }
      } catch (error) {
        console.error("Error loading conflicts:", error)
      }
    }

    loadConflicts()

    // Set up polling for new conflicts
    const interval = setInterval(loadConflicts, 10000)

    return () => clearInterval(interval)
  }, [user, documentId])

  // Detect conflict
  const detectConflict = useCallback(
    async (
      section: string,
      position: { start: number; end: number },
      userEdits: { userId: string; userName: string; content: string; timestamp: number }[],
      context: { before: string; after: string },
    ) => {
      if (!user || !documentId) return null

      try {
        const response = await fetch("/api/intelligent-conflicts/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
            documentType,
            section,
            position,
            userEdits,
            context,
          }),
        })

        if (response.ok) {
          const conflict = await response.json()

          if (conflict) {
            setActiveConflicts((prev) => [...prev, conflict])
            return conflict
          }
        }

        return null
      } catch (error) {
        console.error("Error detecting conflict:", error)
        return null
      }
    },
    [user, documentId, documentType],
  )

  // Get suggestions for a conflict
  const getSuggestions = useCallback(
    async (conflictId: string) => {
      if (!user || !conflictId) return null

      try {
        const response = await fetch(`/api/intelligent-conflicts/suggest?conflictId=${conflictId}&userId=${user.id}`)

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data)
          return data
        }

        return null
      } catch (error) {
        console.error("Error getting suggestions:", error)
        return null
      }
    },
    [user],
  )

  // Resolve conflict
  const resolveConflict = useCallback(
    async (conflictId: string, strategy: ResolutionStrategy, content: string, reasoning?: string) => {
      if (!user || !conflictId) return null

      setIsResolving(true)

      try {
        const response = await fetch("/api/intelligent-conflicts/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conflictId,
            strategy,
            content,
            resolvedBy: user.id,
            reasoning,
          }),
        })

        if (response.ok) {
          const resolvedConflict = await response.json()

          // Update active conflicts
          setActiveConflicts((prev) => prev.filter((c) => c.id !== conflictId))

          // Clear current conflict if it was resolved
          if (currentConflict?.id === conflictId) {
            setCurrentConflict(null)
          }

          return resolvedConflict
        }

        return null
      } catch (error) {
        console.error("Error resolving conflict:", error)
        return null
      } finally {
        setIsResolving(false)
      }
    },
    [user, currentConflict],
  )

  // Predict conflicts
  const predictConflicts = useCallback(
    async (section: string) => {
      if (!user || !documentId) return null

      try {
        const response = await fetch(
          `/api/intelligent-conflicts/predict?documentId=${documentId}&userId=${user.id}&section=${section}`,
        )

        if (response.ok) {
          const data = await response.json()
          setPrediction(data.prediction)
          return data.prediction
        }

        return null
      } catch (error) {
        console.error("Error predicting conflicts:", error)
        return null
      }
    },
    [user, documentId],
  )

  // Set current conflict
  const setConflict = useCallback(
    (conflictId: string | null) => {
      if (!conflictId) {
        setCurrentConflict(null)
        setSuggestions(null)
        return
      }

      const conflict = activeConflicts.find((c) => c.id === conflictId)

      if (conflict) {
        setCurrentConflict(conflict)
        getSuggestions(conflictId)
      }
    },
    [activeConflicts, getSuggestions],
  )

  return {
    activeConflicts,
    currentConflict,
    suggestions,
    prediction,
    isResolving,
    detectConflict,
    resolveConflict,
    predictConflicts,
    setConflict,
  }
}
