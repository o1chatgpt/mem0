import { supabase } from "./supabase-client"
import { smartMemoryService } from "./smart-memory-service"
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
  cursor?: {
    line: number
    ch: number
  }
  selection?: {
    from: { line: number; ch: number }
    to: { line: number; ch: number }
  }
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
  private websocket: WebSocket | null = null
  private userId: string | null = null
  private userName: string | null = null
  private userColor: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private operationQueue: CollaborationOperation[] = []
  private isProcessingQueue = false

  // Initialize the collaborative editing service
  async initialize(userId: string, userName: string) {
    this.userId = userId
    this.userName = userName
    this.userColor = this.getRandomColor()

    // Connect to WebSocket server
    await this.connectWebSocket()

    // Set up Supabase realtime subscriptions for collaboration
    this.setupRealtimeSubscriptions()

    return this
  }

  // Connect to WebSocket server
  private async connectWebSocket() {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For this example, we'll simulate WebSocket behavior
      console.log("Connecting to collaborative editing WebSocket server...")

      // Simulate successful connection after a short delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      this.websocket = {} as WebSocket // Mock WebSocket object
      this.reconnectAttempts = 0

      console.log("Connected to collaborative editing server")
      this.emit("connection", { status: "connected" })

      // Simulate receiving messages
      this.simulateIncomingMessages()
    } catch (error) {
      console.error("Failed to connect to collaborative editing server:", error)
      this.handleConnectionError()
    }
  }

  // Handle connection errors and reconnection
  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`)

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connectWebSocket()
      }, delay)
    } else {
      console.error("Max reconnection attempts reached. Please try again later.")
      this.emit("connection", { status: "failed" })
    }
  }

  // Set up Supabase realtime subscriptions
  private setupRealtimeSubscriptions() {
    // Subscribe to collaboration_sessions table changes
    supabase
      .channel("collaboration_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collaboration_sessions",
        },
        (payload) => {
          this.handleCollaborationUpdate(payload)
        },
      )
      .subscribe()
  }

  // Handle collaboration updates from Supabase
  private handleCollaborationUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case "INSERT":
        this.emit("session_created", newRecord)
        break
      case "UPDATE":
        this.emit("session_updated", newRecord)
        break
      case "DELETE":
        this.emit("session_deleted", oldRecord)
        break
    }
  }

  // Simulate incoming WebSocket messages for demo purposes
  private simulateIncomingMessages() {
    // This method simulates receiving messages from the WebSocket server
    // In a real implementation, you would handle actual WebSocket messages
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

      // Record in smart memory
      await smartMemoryService.recordInteraction(
        fileId,
        "collaboration",
        `Started collaborative editing session for ${fileName}`,
      )

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

      // Record in smart memory
      await smartMemoryService.recordInteraction(
        session.fileId,
        "collaboration",
        `Joined collaborative editing session for ${session.fileName}`,
      )

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

      // Record in smart memory
      await smartMemoryService.recordInteraction(
        session.fileId,
        "collaboration",
        `Left collaborative editing session for ${session.fileName}`,
      )

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

    // Add operation to queue
    this.operationQueue.push(fullOperation)

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processOperationQueue()
    }

    // Update user's last active time
    this.updateUserActivity(sessionId)
  }

  // Process the operation queue
  private async processOperationQueue() {
    if (this.operationQueue.length === 0) {
      this.isProcessingQueue = false
      return
    }

    this.isProcessingQueue = true

    // Get next operation from queue
    const operation = this.operationQueue.shift()!

    try {
      // In a real implementation, send operation to server via WebSocket
      // For this example, we'll simulate sending and receiving operations

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Emit operation to listeners
      this.emit("operation", operation)

      // Store operation in database for history
      const { error } = await supabase.from("collaboration_operations").insert([
        {
          id: operation.id,
          session_id: operation.sessionId,
          user_id: operation.userId,
          timestamp: operation.timestamp,
          operation_type: operation.type,
          operation_data: {
            position: operation.position,
            text: operation.text,
            cursor: operation.cursor,
            selection: operation.selection,
          },
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error("Error processing operation:", error)
      // Re-add operation to queue for retry
      this.operationQueue.unshift(operation)
    } finally {
      // Process next operation in queue
      setTimeout(() => this.processOperationQueue(), 10)
    }
  }

  // Update user's activity timestamp
  private async updateUserActivity(sessionId: string) {
    if (!this.userId) return

    const session = this.sessions.get(sessionId)
    if (!session) return

    const userIndex = session.activeUsers.findIndex((u) => u.id === this.userId)
    if (userIndex === -1) return

    session.activeUsers[userIndex].lastActive = new Date().toISOString()

    // Debounce updates to database
    this.debounceUserActivityUpdate(sessionId)
  }

  // Debounce user activity updates to reduce database writes
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map()

  private debounceUserActivityUpdate(sessionId: string) {
    const existingTimeout = this.debounceTimeouts.get(sessionId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const timeout = setTimeout(() => {
      this.updateSessionUserActivity(sessionId)
      this.debounceTimeouts.delete(sessionId)
    }, 5000) // Update every 5 seconds at most

    this.debounceTimeouts.set(sessionId, timeout)
  }

  // Update session user activity in database
  private async updateSessionUserActivity(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    try {
      const { error } = await supabase
        .from("collaboration_sessions")
        .update({
          active_users: session.activeUsers,
        })
        .eq("id", sessionId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating user activity:", error)
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

  // Clean up resources
  destroy() {
    // Clear all timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    for (const timeout of this.debounceTimeouts.values()) {
      clearTimeout(timeout)
    }

    // Close WebSocket connection
    if (this.websocket) {
      // In a real implementation: this.websocket.close()
    }

    // Clear listeners
    this.listeners.clear()
  }
}

// Create and export singleton instance
export const collaborativeEditingService = new CollaborativeEditingService()
