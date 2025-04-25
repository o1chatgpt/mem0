import { config } from "./config"

export interface CollaborationUser {
  id: string
  username: string
  color: string
  cursor?: {
    line: number
    ch: number
  }
}

export interface CollaborationSession {
  id: string
  fileId: string
  users: CollaborationUser[]
  lastActivity: Date
}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class CollaborationService {
  private socket: WebSocket | null = null
  private sessions: Map<string, CollaborationSession> = new Map()
  private currentUser: { id: string; username: string } | null = null
  private onMessageCallbacks: ((data: any) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor() {
    // This will be initialized when needed
  }

  initialize(userId: string, username: string): void {
    if (!isBrowser) return

    if (!config.enableRealTimeEditing) {
      console.log("Real-time editing is disabled")
      return
    }

    this.currentUser = { id: userId, username }
    this.connect()
  }

  private connect(): void {
    if (!isBrowser) return

    if (!config.enableRealTimeEditing || !config.collaborationSocketUrl) {
      return
    }

    try {
      this.socket = new WebSocket(config.collaborationSocketUrl)

      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      this.socket.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("Error connecting to collaboration server:", error)
    }
  }

  private handleOpen(): void {
    console.log("Connected to collaboration server")
    this.reconnectAttempts = 0

    // Identify the user
    if (this.currentUser && this.socket) {
      this.socket.send(
        JSON.stringify({
          type: "identify",
          userId: this.currentUser.id,
          username: this.currentUser.username,
        }),
      )
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)

      // Update session data if it's a session update
      if (data.type === "session_update" && data.session) {
        this.sessions.set(data.session.id, data.session)
      }

      // Notify all callbacks
      this.onMessageCallbacks.forEach((callback) => callback(data))
    } catch (error) {
      console.error("Error handling collaboration message:", error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log("Disconnected from collaboration server:", event.code, event.reason)

    // Try to reconnect if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    }
  }

  private handleError(error: Event): void {
    console.error("Collaboration socket error:", error)
  }

  joinSession(fileId: string): string {
    if (!isBrowser) return "dummy-session-id"

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to collaboration server")
    }

    if (!this.currentUser) {
      throw new Error("User not identified")
    }

    // Generate a session ID
    const sessionId = `session-${fileId}`

    // Join the session
    this.socket.send(
      JSON.stringify({
        type: "join_session",
        sessionId,
        fileId,
        userId: this.currentUser.id,
        username: this.currentUser.username,
      }),
    )

    return sessionId
  }

  leaveSession(sessionId: string): void {
    if (!isBrowser) return

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    if (!this.currentUser) {
      return
    }

    // Leave the session
    this.socket.send(
      JSON.stringify({
        type: "leave_session",
        sessionId,
        userId: this.currentUser.id,
      }),
    )

    // Remove from local cache
    this.sessions.delete(sessionId)
  }

  sendEdit(sessionId: string, fileId: string, change: any): void {
    if (!isBrowser) return

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to collaboration server")
    }

    if (!this.currentUser) {
      throw new Error("User not identified")
    }

    // Send the edit
    this.socket.send(
      JSON.stringify({
        type: "edit",
        sessionId,
        fileId,
        userId: this.currentUser.id,
        change,
      }),
    )
  }

  updateCursor(sessionId: string, position: { line: number; ch: number }): void {
    if (!isBrowser) return

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    if (!this.currentUser) {
      return
    }

    // Send cursor update
    this.socket.send(
      JSON.stringify({
        type: "cursor_update",
        sessionId,
        userId: this.currentUser.id,
        position,
      }),
    )
  }

  onMessage(callback: (data: any) => void): () => void {
    this.onMessageCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((cb) => cb !== callback)
    }
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values())
  }

  disconnect(): void {
    if (!isBrowser) return

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.sessions.clear()
    this.currentUser = null
    this.onMessageCallbacks = []
  }

  isConnected(): boolean {
    if (!isBrowser) return false
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }
}

export const collaborationService = new CollaborationService()
