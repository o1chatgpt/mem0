"use client"

import { v4 as uuidv4 } from "uuid"
import { Memory } from "@/lib/mem0-client"
import { conflictResolutionService, type ConflictOperation } from "@/lib/conflict-resolution-service"

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
  userName?: string
  timestamp: string
  type: "insert" | "delete"
  position?: number
  text?: string
}

// Available user colors for collaboration
const USER_COLORS = [
  "#F44336", // Red
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FF9800", // Orange
  "#9C27B0", // Purple
]

class CollaborativeEditingService {
  private sessions: Map<string, CollaborationSession> = new Map()
  private userId: string | null = null
  private userName: string | null = null
  private userColor: string | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private memory: Memory | null = null
  private recentOperations: Map<string, ConflictOperation[]> = new Map()

  // Initialize the collaborative editing service
  async initialize(userId: string, userName: string) {
    this.userId = userId
    this.userName = userName
    this.userColor = this.getRandomColor()
    this.memory = new Memory()

    // Store initialization in Mem0
    try {
      await this.memory.add(
        [
          { role: "system", content: "Collaborative editing initialization" },
          { role: "user", content: `User ${userName} (${userId}) initialized collaborative editing` },
        ],
        userId,
      )
    } catch (error) {
      console.error("Failed to store initialization in Mem0:", error)
    }

    // Connect to WebSocket
    this.connectWebSocket()

    return this
  }

  // Connect to WebSocket server
  private connectWebSocket() {
    if (!this.userId || !this.userName) {
      throw new Error("User not initialized")
    }

    // Close existing connection if any
    if (this.socket) {
      this.socket.close()
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/api/websocket?userId=${this.userId}&userName=${encodeURIComponent(this.userName)}`

    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      console.log("WebSocket connection established")
      this.reconnectAttempts = 0
      this.emit("connection", { status: "connected" })

      // Rejoin active sessions
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.isActive) {
          this.sendWebSocketMessage({
            type: "join_session",
            sessionId,
          })
        }
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case "user_joined":
            this.handleUserJoined(message)
            break

          case "user_left":
            this.handleUserLeft(message)
            break

          case "operation":
            this.handleOperation(message)
            break

          default:
            console.log(`Unknown message type: ${message.type}`)
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error)
      }
    }

    this.socket.onclose = () => {
      console.log("WebSocket connection closed")
      this.emit("connection", { status: "disconnected" })

      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

        this.reconnectTimeout = setTimeout(() => {
          this.connectWebSocket()
        }, delay)
      } else {
        console.error("Max reconnect attempts reached")
      }
    }

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  // Send message through WebSocket
  private sendWebSocketMessage(message: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, message not sent")
      return false
    }

    try {
      this.socket.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error("Error sending WebSocket message:", error)
      return false
    }
  }

  // Handle user joined message
  private handleUserJoined(message: any) {
    const { sessionId, userId, userName, timestamp } = message
    const session = this.sessions.get(sessionId)

    if (session) {
      // Check if user already exists
      const existingUserIndex = session.activeUsers.findIndex((u) => u.id === userId)

      if (existingUserIndex === -1) {
        // Add new user
        session.activeUsers.push({
          id: userId,
          name: userName,
          color: this.getRandomColor(),
          lastActive: timestamp,
        })
      } else {
        // Update existing user
        session.activeUsers[existingUserIndex].lastActive = timestamp
      }

      this.emit("session_updated", session)
    }
  }

  // Handle user left message
  private handleUserLeft(message: any) {
    const { sessionId, userId } = message
    const session = this.sessions.get(sessionId)

    if (session) {
      // Remove user from session
      session.activeUsers = session.activeUsers.filter((u) => u.id !== userId)

      // If no users left, mark session as inactive
      if (session.activeUsers.length === 0) {
        session.isActive = false
        this.sessions.delete(sessionId)
        this.emit("session_deleted", { id: sessionId })
      } else {
        this.emit("session_updated", session)
      }
    }
  }

  // Handle operation message
  private handleOperation(message: any) {
    const operation: CollaborationOperation = {
      id: message.id || uuidv4(),
      sessionId: message.sessionId,
      userId: message.userId,
      userName: message.userName,
      timestamp: message.timestamp,
      type: message.operation.type,
      position: message.operation.position,
      text: message.operation.text,
    }

    // Check for conflicts
    this.checkForConflicts(operation)

    this.emit("operation", operation)
  }

  // Check for conflicts
  private checkForConflicts(operation: CollaborationOperation) {
    if (!this.userId || !operation.sessionId || operation.userId === this.userId) return

    // Convert to conflict operation format
    const conflictOp: ConflictOperation = {
      userId: operation.userId,
      userName: operation.userName || "Unknown User",
      type: operation.type,
      position: operation.position || 0,
      text: operation.text || "",
      timestamp: operation.timestamp,
    }

    // Get recent operations for this session
    const sessionOperations = this.recentOperations.get(operation.sessionId) || []

    // Add to recent operations
    this.recentOperations.set(
      operation.sessionId,
      [...sessionOperations, conflictOp].slice(-20), // Keep last 20 operations
    )

    // Get session
    const session = this.sessions.get(operation.sessionId)
    if (!session) return

    // Detect conflicts
    const conflict = conflictResolutionService.detectConflict(
      session.fileId,
      operation.sessionId,
      conflictOp,
      sessionOperations,
    )

    if (conflict) {
      this.emit("conflict_detected", conflict)
    }
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

    // Initialize recent operations for this session
    this.recentOperations.set(sessionId, [])

    // Join session via WebSocket
    this.sendWebSocketMessage({
      type: "join_session",
      sessionId,
    })

    // Store session creation in Mem0
    if (this.memory) {
      try {
        await this.memory.add(
          [
            { role: "system", content: "Collaboration session creation" },
            { role: "user", content: `User ${this.userName} created session for file ${fileName} (${fileId})` },
          ],
          this.userId,
        )
      } catch (error) {
        console.error("Failed to store session creation in Mem0:", error)
      }
    }

    this.emit("session_created", session)
    return session
  }

  // Join an existing session
  async joinSession(sessionId: string): Promise<CollaborationSession> {
    if (!this.userId || !this.userName) {
      throw new Error("User not initialized")
    }

    // Check if session exists in local cache
    let session = this.sessions.get(sessionId)

    if (!session) {
      // Create a placeholder session
      session = {
        id: sessionId,
        fileId: "unknown",
        fileName: "Unknown File",
        createdAt: new Date().toISOString(),
        activeUsers: [],
        isActive: true,
      }

      this.sessions.set(sessionId, session)
    }

    // Initialize recent operations for this session if not exists
    if (!this.recentOperations.has(sessionId)) {
      this.recentOperations.set(sessionId, [])
    }

    // Add current user if not already in the session
    const existingUserIndex = session.activeUsers.findIndex((u) => u.id === this.userId)

    if (existingUserIndex === -1) {
      session.activeUsers.push({
        id: this.userId!,
        name: this.userName!,
        color: this.userColor || this.getRandomColor(),
        lastActive: new Date().toISOString(),
      })
    } else {
      session.activeUsers[existingUserIndex].lastActive = new Date().toISOString()
    }

    // Join session via WebSocket
    this.sendWebSocketMessage({
      type: "join_session",
      sessionId,
    })

    // Store session join in Mem0
    if (this.memory) {
      try {
        await this.memory.add(
          [
            { role: "system", content: "Collaboration session join" },
            { role: "user", content: `User ${this.userName} joined session ${sessionId}` },
          ],
          this.userId,
        )
      } catch (error) {
        console.error("Failed to store session join in Mem0:", error)
      }
    }

    this.emit("session_joined", session)
    return session
  }

  // Leave a collaboration session
  async leaveSession(sessionId: string): Promise<void> {
    if (!this.userId) {
      throw new Error("User not initialized")
    }

    const session = this.sessions.get(sessionId)
    if (!session) return

    // Leave session via WebSocket
    this.sendWebSocketMessage({
      type: "leave_session",
      sessionId,
    })

    // Remove user from session locally
    session.activeUsers = session.activeUsers.filter((u) => u.id !== this.userId)

    // If no users left, mark session as inactive
    if (session.activeUsers.length === 0) {
      session.isActive = false
      this.sessions.delete(sessionId)

      // Clean up recent operations
      this.recentOperations.delete(sessionId)
    }

    // Store session leave in Mem0
    if (this.memory && this.userName) {
      try {
        await this.memory.add(
          [
            { role: "system", content: "Collaboration session leave" },
            { role: "user", content: `User ${this.userName} left session ${sessionId}` },
          ],
          this.userId,
        )
      } catch (error) {
        console.error("Failed to store session leave in Mem0:", error)
      }
    }

    this.emit("session_left", { sessionId, userId: this.userId })
  }

  // Send an operation to the collaboration session
  async sendOperation(
    sessionId: string,
    operation: Omit<CollaborationOperation, "id" | "sessionId" | "userId" | "timestamp">,
  ): Promise<void> {
    if (!this.userId || !this.userName) {
      throw new Error("User not initialized")
    }

    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found in local cache")

    const operationId = uuidv4()
    const timestamp = new Date().toISOString()

    // Add to recent operations for conflict detection
    const conflictOp: ConflictOperation = {
      userId: this.userId,
      userName: this.userName,
      type: operation.type,
      position: operation.position || 0,
      text: operation.text || "",
      timestamp,
    }

    const sessionOperations = this.recentOperations.get(sessionId) || []
    this.recentOperations.set(
      sessionId,
      [...sessionOperations, conflictOp].slice(-20), // Keep last 20 operations
    )

    // Send operation via WebSocket
    this.sendWebSocketMessage({
      type: "operation",
      id: operationId,
      sessionId,
      operation,
      timestamp,
      userName: this.userName,
    })

    // Create full operation object for local handling
    const fullOperation: CollaborationOperation = {
      id: operationId,
      sessionId,
      userId: this.userId,
      userName: this.userName,
      timestamp,
      ...operation,
    }

    // Store operation in Mem0
    if (this.memory) {
      try {
        await this.memory.add(
          [
            { role: "system", content: "Collaboration operation" },
            {
              role: "user",
              content: `User ${this.userName} performed ${operation.type} operation in session ${sessionId}`,
            },
          ],
          this.userId,
        )
      } catch (error) {
        console.error("Failed to store operation in Mem0:", error)
      }
    }

    // Emit operation locally for immediate feedback
    this.emit("operation", fullOperation)
  }

  // Get active sessions for a file
  async getActiveSessionsForFile(fileId: string): Promise<CollaborationSession[]> {
    // Return sessions from local cache that match the file ID
    return Array.from(this.sessions.values()).filter((session) => session.fileId === fileId && session.isActive)
  }

  // Get a random color for user
  private getRandomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
  }

  // Clean up resources
  cleanup() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.sessions.clear()
    this.listeners.clear()
    this.recentOperations.clear()
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
