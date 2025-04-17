"use client"

import { useState, useEffect, useCallback } from "react"
import type { Conflict } from "@/lib/conflict-resolution-service"

// This is a client-side hook that will communicate with the server-side conflict resolution service
export function useConflictResolution(userId: string, documentId: string) {
  const [activeConflicts, setActiveConflicts] = useState<Conflict[]>([])
  const [isResolving, setIsResolving] = useState(false)

  // Function to detect conflicts
  const detectConflict = useCallback(
    async (
      section: string,
      userAId: string,
      userAName: string,
      userAContent: string,
      userBId: string,
      userBName: string,
      userBContent: string,
    ) => {
      try {
        const response = await fetch("/api/conflicts/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
            section,
            userA: {
              id: userAId,
              name: userAName,
              content: userAContent,
            },
            userB: {
              id: userBId,
              name: userBName,
              content: userBContent,
            },
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to detect conflict")
        }

        const conflict = await response.json()

        if (conflict) {
          setActiveConflicts((prev) => [...prev, conflict])
          return conflict
        }

        return null
      } catch (error) {
        console.error("Error detecting conflict:", error)
        return null
      }
    },
    [documentId],
  )

  // Function to resolve conflicts
  const resolveConflict = useCallback(
    async (conflictId: string, resolution: "user-a" | "user-b" | "merge" | "custom", customContent?: string) => {
      setIsResolving(true)

      try {
        const response = await fetch("/api/conflicts/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conflictId,
            resolution,
            customContent,
            resolvedBy: userId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to resolve conflict")
        }

        const resolvedConflict = await response.json()

        // Update the active conflicts list
        setActiveConflicts(
          (prev) => prev.map((c) => (c.id === resolvedConflict.id ? resolvedConflict : c)).filter((c) => !c.resolved), // Remove resolved conflicts
        )

        return resolvedConflict
      } catch (error) {
        console.error("Error resolving conflict:", error)
        return null
      } finally {
        setIsResolving(false)
      }
    },
    [userId],
  )

  // Function to get conflict suggestions
  const getSuggestion = useCallback(
    async (conflictId: string) => {
      try {
        const response = await fetch(`/api/conflicts/suggest?conflictId=${conflictId}&userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to get conflict suggestion")
        }

        return await response.json()
      } catch (error) {
        console.error("Error getting conflict suggestion:", error)
        return null
      }
    },
    [userId],
  )

  // Load active conflicts for this document
  useEffect(() => {
    const loadConflicts = async () => {
      try {
        const response = await fetch(`/api/conflicts?documentId=${documentId}`)

        if (!response.ok) {
          throw new Error("Failed to load conflicts")
        }

        const conflicts = await response.json()
        setActiveConflicts(conflicts.filter((c: Conflict) => !c.resolved))
      } catch (error) {
        console.error("Error loading conflicts:", error)
      }
    }

    loadConflicts()
  }, [documentId])

  return {
    activeConflicts,
    detectConflict,
    resolveConflict,
    getSuggestion,
    isResolving,
  }
}
