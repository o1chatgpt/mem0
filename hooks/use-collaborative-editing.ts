"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSupabase } from "@/lib/supabase-context"
import {
  collaborativeEditingService,
  type CollaborationSession,
  type CollaborationOperation,
} from "@/lib/collaborative-editing-service"
import { useToast } from "@/hooks/use-toast"

export function useCollaborativeEditing(fileId?: string) {
  const { user } = useSupabase()
  const { toast } = useToast()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([])
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [operations, setOperations] = useState<CollaborationOperation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [collaborators, setCollaborators] = useState<Map<string, { name: string; color: string }>>(new Map())

  // Use refs to track the latest state in event handlers
  const currentSessionRef = useRef<CollaborationSession | null>(null)
  const operationsRef = useRef<CollaborationOperation[]>([])

  // Update refs when state changes
  useEffect(() => {
    currentSessionRef.current = currentSession
    operationsRef.current = operations
  }, [currentSession, operations])

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
        toast({
          title: "Initialization Failed",
          description: "Could not initialize collaborative editing service",
          variant: "destructive",
        })
      }
    }

    initService()

    // Clean up on unmount
    return () => {
      collaborativeEditingService.cleanup()
    }
  }, [user, toast])

  // Set up event listeners
  useEffect(() => {
    if (!isInitialized) return

    const handleConnection = (data: { status: string }) => {
      setIsConnected(data.status === "connected")

      if (data.status === "connected") {
        setError(null)
        toast({
          title: "Connected",
          description: "Real-time collaboration is now active",
          variant: "default",
        })
      } else {
        setError("Connection to collaborative editing server lost")
        toast({
          title: "Disconnected",
          description: "Connection to collaboration server lost. Attempting to reconnect...",
          variant: "destructive",
        })
      }
    }

    const handleOperation = (operation: CollaborationOperation) => {
      // Skip our own operations to avoid duplicates
      if (user && operation.userId === user.id) return

      setOperations((prev) => [...prev, operation])

      // Update collaborator's last activity
      if (currentSessionRef.current && operation.userId && operation.userName) {
        setCollaborators((prev) => {
          const newMap = new Map(prev)
          const existingUser = currentSessionRef.current?.activeUsers.find((u) => u.id === operation.userId)

          if (existingUser) {
            newMap.set(operation.userId, {
              name: operation.userName || existingUser.name,
              color: existingUser.color,
            })
          }

          return newMap
        })
      }
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

      toast({
        title: "Session Created",
        description: `Collaboration session for "${session.fileName}" created`,
        variant: "default",
      })
    }

    const handleSessionJoined = (session: CollaborationSession) => {
      setCurrentSession(session)

      // Initialize collaborators map
      const collaboratorsMap = new Map<string, { name: string; color: string }>()
      session.activeUsers.forEach((user) => {
        collaboratorsMap.set(user.id, { name: user.name, color: user.color })
      })
      setCollaborators(collaboratorsMap)

      toast({
        title: "Session Joined",
        description: `You joined the collaboration session for "${session.fileName}"`,
        variant: "default",
      })
    }

    const handleSessionUpdated = (session: CollaborationSession) => {
      setActiveSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))

      if (currentSessionRef.current?.id === session.id) {
        setCurrentSession(session)

        // Update collaborators map
        const collaboratorsMap = new Map<string, { name: string; color: string }>()
        session.activeUsers.forEach((user) => {
          collaboratorsMap.set(user.id, { name: user.name, color: user.color })
        })
        setCollaborators(collaboratorsMap)
      }
    }

    const handleSessionLeft = (data: { sessionId: string; userId: string }) => {
      if (currentSessionRef.current?.id === data.sessionId && user?.id === data.userId) {
        setCurrentSession(null)
        setCollaborators(new Map())

        toast({
          title: "Session Left",
          description: "You left the collaboration session",
          variant: "default",
        })
      }
    }

    const handleSessionDeleted = (session: { id: string }) => {
      setActiveSessions((prev) => prev.filter((s) => s.id !== session.id))

      if (currentSessionRef.current?.id === session.id) {
        setCurrentSession(null)
        setCollaborators(new Map())

        toast({
          title: "Session Ended",
          description: "The collaboration session has ended",
          variant: "default",
        })
      }
    }

    // Subscribe to events
    collaborativeEditingService
      .on("connection", handleConnection)
      .on("operation", handleOperation)
      .on("session_created", handleSessionCreated)
      .on("session_joined", handleSessionJoined)
      .on("session_updated", handleSessionUpdated)
      .on("session_left", handleSessionLeft)
      .on("session_deleted", handleSessionDeleted)

    return () => {
      // Unsubscribe from events
      collaborativeEditingService
        .off("connection", handleConnection)
        .off("operation", handleOperation)
        .off("session_created", handleSessionCreated)
        .off("session_joined", handleSessionJoined)
        .off("session_updated", handleSessionUpdated)
        .off("session_left", handleSessionLeft)
        .off("session_deleted", handleSessionDeleted)
    }
  }, [isInitialized, user, toast])

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
        toast({
          title: "Session Creation Failed",
          description: "Could not create collaboration session",
          variant: "destructive",
        })
        throw err
      }
    },
    [isInitialized, fileId, toast],
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
        toast({
          title: "Join Failed",
          description: "Could not join collaboration session",
          variant: "destructive",
        })
        throw err
      }
    },
    [isInitialized, toast],
  )

  // Leave the current session
  const leaveSession = useCallback(async () => {
    if (!isInitialized || !currentSession) {
      return
    }

    try {
      await collaborativeEditingService.leaveSession(currentSession.id)
      setCurrentSession(null)
      setCollaborators(new Map())
    } catch (err) {
      console.error("Failed to leave collaboration session:", err)
      setError("Failed to leave collaboration session")
      toast({
        title: "Leave Failed",
        description: "Could not leave collaboration session properly",
        variant: "destructive",
      })
    }
  }, [isInitialized, currentSession, toast])

  // Send a text insertion operation
  const sendInsert = useCallback(
    (position: number, text: string) => {
      if (!isInitialized || !currentSession) {
        console.warn("Cannot send operation: no active session")
        return
      }

      collaborativeEditingService.sendOperation(currentSession.id, {
        type: "insert",
        position,
        text,
      })
    },
    [isInitialized, currentSession],
  )

  // Send a text deletion operation
  const sendDelete = useCallback(
    (position: number, text: string) => {
      if (!isInitialized || !currentSession) {
        console.warn("Cannot send operation: no active session")
        return
      }

      collaborativeEditingService.sendOperation(currentSession.id, {
        type: "delete",
        position,
        text,
      })
    },
    [isInitialized, currentSession],
  )

  return {
    isInitialized,
    isConnected,
    activeSessions,
    currentSession,
    operations,
    error,
    collaborators,
    createSession,
    joinSession,
    leaveSession,
    sendInsert,
    sendDelete,
  }
}
