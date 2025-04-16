"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-context"
import {
  collaborativeEditingService,
  type CollaborationSession,
  type CollaborationOperation,
} from "@/lib/collaborative-editing-service"

export function useCollaborativeEditing(fileId?: string) {
  const { user } = useSupabase()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([])
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [operations, setOperations] = useState<CollaborationOperation[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize collaborative editing service
  useEffect(() => {
    if (!user) return

    const initService = async () => {
      try {
        await collaborativeEditingService.initialize(
          user.id,
          user.user_metadata?.name || user.email || "Anonymous User",
        )
        setIsInitialized(true)
      } catch (err) {
        console.error("Failed to initialize collaborative editing:", err)
        setError("Failed to initialize collaborative editing")
      }
    }

    initService()

    return () => {
      // Clean up if needed
    }
  }, [user])

  // Set up event listeners
  useEffect(() => {
    if (!isInitialized) return

    const handleConnection = (data: { status: string }) => {
      setIsConnected(data.status === "connected")
      if (data.status !== "connected") {
        setError("Connection to collaborative editing server lost")
      } else {
        setError(null)
      }
    }

    const handleOperation = (operation: CollaborationOperation) => {
      setOperations((prev) => [...prev, operation])
    }

    const handleSessionCreated = (session: CollaborationSession) => {
      setActiveSessions((prev) => {
        const exists = prev.some((s) => s.id === session.id)
        if (exists) {
          return prev.map((s) => (s.id === session.id ? session : s))
        } else {
          return [...prev, session]
        }
      })
    }

    const handleSessionUpdated = (session: CollaborationSession) => {
      setActiveSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))

      if (currentSession?.id === session.id) {
        setCurrentSession(session)
      }
    }

    const handleSessionDeleted = (session: { id: string }) => {
      setActiveSessions((prev) => prev.filter((s) => s.id !== session.id))

      if (currentSession?.id === session.id) {
        setCurrentSession(null)
      }
    }

    // Subscribe to events
    collaborativeEditingService
      .on("connection", handleConnection)
      .on("operation", handleOperation)
      .on("session_created", handleSessionCreated)
      .on("session_updated", handleSessionUpdated)
      .on("session_deleted", handleSessionDeleted)

    return () => {
      // Unsubscribe from events
      collaborativeEditingService
        .off("connection", handleConnection)
        .off("operation", handleOperation)
        .off("session_created", handleSessionCreated)
        .off("session_updated", handleSessionUpdated)
        .off("session_deleted", handleSessionDeleted)
    }
  }, [isInitialized, currentSession])

  // Load active sessions for file
  useEffect(() => {
    if (!isInitialized || !fileId) return

    const loadSessions = async () => {
      try {
        const sessions = await collaborativeEditingService.getActiveSessionsForFile(fileId)
        setActiveSessions(sessions)
      } catch (err) {
        console.error("Failed to load active sessions:", err)
        setError("Failed to load active collaboration sessions")
      }
    }

    loadSessions()
  }, [isInitialized, fileId])

  // Create a new session
  const createSession = useCallback(
    async (fileName: string) => {
      if (!isInitialized || !fileId) {
        throw new Error("Cannot create session: service not initialized or file ID missing")
      }

      try {
        const session = await collaborativeEditingService.createSession(fileId, fileName)
        setCurrentSession(session)
        return session
      } catch (err) {
        console.error("Failed to create collaboration session:", err)
        setError("Failed to create collaboration session")
        throw err
      }
    },
    [isInitialized, fileId],
  )

  // Join an existing session
  const joinSession = useCallback(
    async (sessionId: string) => {
      if (!isInitialized) {
        throw new Error("Cannot join session: service not initialized")
      }

      try {
        const session = await collaborativeEditingService.joinSession(sessionId)
        setCurrentSession(session)
        return session
      } catch (err) {
        console.error("Failed to join collaboration session:", err)
        setError("Failed to join collaboration session")
        throw err
      }
    },
    [isInitialized],
  )

  // Leave the current session
  const leaveSession = useCallback(async () => {
    if (!isInitialized || !currentSession) {
      return
    }

    try {
      await collaborativeEditingService.leaveSession(currentSession.id)
      setCurrentSession(null)
    } catch (err) {
      console.error("Failed to leave collaboration session:", err)
      setError("Failed to leave collaboration session")
    }
  }, [isInitialized, currentSession])

  // Send an operation to the current session
  const sendOperation = useCallback(
    (operation: Omit<CollaborationOperation, "id" | "sessionId" | "userId" | "timestamp">) => {
      if (!isInitialized || !currentSession) {
        console.warn("Cannot send operation: no active session")
        return
      }

      collaborativeEditingService.sendOperation(currentSession.id, operation)
    },
    [isInitialized, currentSession],
  )

  // Send a text insertion operation
  const sendInsert = useCallback(
    (position: number, text: string) => {
      sendOperation({
        type: "insert",
        position,
        text,
      })
    },
    [sendOperation],
  )

  // Send a text deletion operation
  const sendDelete = useCallback(
    (position: number, text: string) => {
      sendOperation({
        type: "delete",
        position,
        text,
      })
    },
    [sendOperation],
  )

  // Send a cursor position update
  const sendCursorPosition = useCallback(
    (line: number, ch: number) => {
      sendOperation({
        type: "cursor",
        cursor: { line, ch },
      })
    },
    [sendOperation],
  )

  // Send a selection update
  const sendSelection = useCallback(
    (from: { line: number; ch: number }, to: { line: number; ch: number }) => {
      sendOperation({
        type: "selection",
        selection: { from, to },
      })
    },
    [sendOperation],
  )

  return {
    isInitialized,
    isConnected,
    activeSessions,
    currentSession,
    operations,
    error,
    createSession,
    joinSession,
    leaveSession,
    sendInsert,
    sendDelete,
    sendCursorPosition,
    sendSelection,
  }
}
