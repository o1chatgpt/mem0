import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

// Types for collaborative editing
export interface CollaborationSession {
  id: string
  fileId: string
  fileName: string
  createdAt: string
  activeUsers: CollaborationUser[]
  isActive: boolean
}

export interface CollaborationUser {
  id: string
  name: string
  color: string
  lastActive: string
}

export interface CollaborationOperation {
  id: string
  sessionId: string
  userId: string
  timestamp: string
  type: "insert" | "delete" | "cursor" | "selection"
  position?: number
  text?: string
  cursor?: {
    line: number
    ch: number
  }
  selection?: {
    from: { line: number; ch: number }
    to: { line: number; ch: number }
  }
}

// Available user colors for collaboration
const USER_COLORS = [
  "#F44336", // Red
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#00BCD4", // Cyan
  "#FFEB3B", // Yellow
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
]

class CollaborativeEditingService {
  private sessions: Map<string, CollaborationSession> = new Map()
  private userId: string | null = null
  private userName: string | null = null
  private userColor: string | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  // Initialize the collaborative editing service
  async initialize(userId: string, userName: string) {
    this.userId = userId
    this.userName = userName
    this.userColor = this.getRandomColor()

    console.log("Collaborative editing service initialized")
    this.emit("connection", { status: "connected" })

    return this
  }

  // Create a new collaboration session
  async createSession(fileId: string, fileName: string): Promise<CollaborationSession> {
    if (!this.userId || !this.userName) {
      throw new Error("User not initialized")
    }

    const sessionId = uuidv4()
    const session: CollaborationSession = {
      id: sessionId,
      fileId,
      fileName,
      createdAt: new Date().toISOString(),
      activeUsers: [
        {
          id: this.userId,
          name: this.userName,
          color: this.userColor || this.getRandomColor(),
          lastActive: new Date().toISOString(),
        },
      ],
      isActive: true,
    }

    // Store session in local cache
    this.sessions.set(sessionId, session)

    // Store session in database
    try {
      const { data, error } = await supabase
        .from("collaboration_sessions")
        .insert([
          {
            id: sessionId,
            file_id: fileId,
            file_name: fileName,
            created_at: session.createdAt,
            active_users: session.activeUsers,
            is_active: true,
          },
        ])
        .select()

      if (error) throw error

      this.emit("session_created", session)
      return session
    } catch (error) {
      console.error("Error creating collaboration session:", error)
      throw error
    }
  }

  // Join an existing collaboration session
  async joinSession(sessionId: string): Promise<CollaborationSession> {
    if (!this.userId || !this.userName) {
      throw new Error("User not initialized")
    }

    try {
      // Get session from database
      const { data: sessionData, error } = await supabase
        .from("collaboration_sessions")
        .select("*")
        .eq("id", sessionId)
        .single()

      if (error) throw error
      if (!sessionData) throw new Error("Session not found")

      // Convert from database format to our format
      const session: CollaborationSession = {
        id: sessionData.id,
        fileId: sessionData.file_id,
        fileName: sessionData.file_name,
        createdAt: sessionData.created_at,
        activeUsers: sessionData.active_users || [],
        isActive: sessionData.is_active,
      }

      // Check if user is already in the session
      const existingUserIndex = session.activeUsers.findIndex((u) => u.id === this.userId)

      if (existingUserIndex === -1) {
        // Add user to session
        const newUser: CollaborationUser = {
          id: this.userId,
          name: this.userName,
          color: this.userColor || this.getRandomColor(),
          lastActive: new Date().toISOString(),
        }

        session.activeUsers.push(newUser)
      } else {
        // Update user's last active time
        session.activeUsers[existingUserIndex].lastActive = new Date().toISOString()
      }

      // Update session in database
      const { error: updateError } = await supabase
        .from("collaboration_sessions")
        .update({
          active_users: session.activeUsers,
        })
        .eq("id", sessionId)

      if (updateError) throw updateError

      // Store session in local cache
      this.sessions.set(sessionId, session)

      this.emit("session_joined", session)
      return session
    } catch (error) {
      console.error("Error joining collaboration session:", error)
      throw error
    }
  }

  // Leave a collaboration session
  async leaveSession(sessionId: string): Promise<void> {
    if (!this.userId) {
      throw new Error("User not initialized")
    }

    try {
      const session = this.sessions.get(sessionId)
      if (!session) throw new Error("Session not found in local cache")

      // Remove user from session
      session.activeUsers = session.activeUsers.filter((u) => u.id !== this.userId)

      // If no users left, mark session as inactive
      if (session.activeUsers.length === 0) {
        session.isActive = false
      }

      // Update session in database
      const { error } = await supabase
        .from("collaboration_sessions")
        .update({
          active_users: session.activeUsers,
          is_active: session.isActive,
        })
        .eq("id", sessionId)

      if (error) throw error

      // Remove session from local cache if inactive
      if (!session.isActive) {
        this.sessions.delete(sessionId)
      }

      this.emit("session_left", { sessionId, userId: this.userId })
    } catch (error) {
      console.error("Error leaving collaboration session:", error)
      throw error
    }
  }

  // Send an operation to the collaboration session
  async sendOperation(
    sessionId: string,
    operation: Omit<CollaborationOperation, "id" | "sessionId" | "userId" | "timestamp">,
  ): Promise<void> {
    if (!this.userId) {
      throw new Error("User not initialized")
    }

    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found in local cache")

    const fullOperation: CollaborationOperation = {
      id: uuidv4(),
      sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      ...operation,
    }

    // Emit operation to listeners
    this.emit("operation", fullOperation)

    // Store operation in database
    try {
      const { error } = await supabase.from("collaboration_operations").insert([
        {
          id: fullOperation.id,
          session_id: fullOperation.sessionId,
          user_id: fullOperation.userId,
          timestamp: fullOperation.timestamp,
          operation_type: fullOperation.type,
          operation_data: {
            position: fullOperation.position,
            text: fullOperation.text,
            cursor: fullOperation.cursor,
            selection: fullOperation.selection,
          },
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error("Error storing operation:", error)
    }
  }

  // Get active sessions for a file
  async getActiveSessionsForFile(fileId: string): Promise<CollaborationSession[]> {
    try {
      const { data, error } = await supabase
        .from("collaboration_sessions")
        .select("*")
        .eq("file_id", fileId)
        .eq("is_active", true)

      if (error) throw error

      // Convert from database format to our format
      return (data || []).map((session) => ({
        id: session.id,
        fileId: session.file_id,
        fileName: session.file_name,
        createdAt: session.created_at,
        activeUsers: session.active_users || [],
        isActive: session.is_active,
      }))
    } catch (error) {
      console.error("Error getting active sessions:", error)
      return []
    }
  }

  // Get a random color for user
  private getRandomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
  }

  // Event emitter methods
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback)
    return this
  }

  off(event: string, callback: (data: any) => void) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
    return this
  }

  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)!) {
        callback(data)
      }
    }
  }
}

// Create and export singleton instance
export const collaborativeEditingService = new CollaborativeEditingService()
