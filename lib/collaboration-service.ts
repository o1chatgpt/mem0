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
  private connectionEnabled = true

  constructor() {
    // This will be initialized when needed
  }

  initialize(userId: string, username: string): void {
    if (!isBrowser) return

    // Check if real-time editing is enabled in config
    if (!config.enableRealTimeEditing) {
      console.log("Real-time editing is disabled in config")
      this.connectionEnabled = false
      return
    }

    // Check if collaboration socket URL is defined
    if (!config.collaborationSocketUrl) {
      console.log("Collaboration socket URL is not defined")
      this.connectionEnabled = false
      return
    }

    this.currentUser = { id: userId, username }
    this.connectionEnabled = true
    this.connect()
  }

  private connect(): void {
    if (!isBrowser || !this.connectionEnabled) return

    try {
      // Check if URL is valid before creating WebSocket
      const url = config.collaborationSocketUrl || ""
      if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
        console.warn("Invalid WebSocket URL format:", url)
        this.connectionEnabled = false
        return
      }

      console.log("Attempting to connect to collaboration server:", url)
      this.socket = new WebSocket(url)

      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      this.socket.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("Error connecting to collaboration server:", error)
      this.connectionEnabled = false
    }
  }

  private handleOpen(): void {
    console.log("Connected to collaboration server")
    this.reconnectAttempts = 0

    // Identify the user
    if (this.currentUser && this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "identify",
            userId: this.currentUser.id,
            username: this.currentUser.username,
          }),
        )
      } catch (error) {
        console.error("Error sending identification message:", error)
      }
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
      this.onMessageCallbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (callbackError) {
          console.error("Error in message callback:", callbackError)
        }
      })
    } catch (error) {
      console.error("Error handling collaboration message:", error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log("Disconnected from collaboration server:", event.code, event.reason)

    // Don't attempt to reconnect if connection is disabled
    if (!this.connectionEnabled) return

    // Try to reconnect if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Maximum reconnection attempts reached. Disabling collaboration.")
      this.connectionEnabled = false
    }
  }

  private handleError(error: Event): void {
    console.error("Collaboration socket error:", error)

    // Disable further connection attempts after repeated errors
    if (this.reconnectAttempts >= 2) {
      console.log("Multiple connection errors. Disabling collaboration to prevent further errors.")
      this.connectionEnabled = false

      // Close the socket if it's still open
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.close()
        } catch (closeError) {
          console.error("Error closing socket:", closeError)
        }
      }
      this.socket = null
    }
  }

  joinSession(fileId: string): string {
    if (!isBrowser) return "dummy-session-id"
    if (!this.connectionEnabled) return `offline-session-${fileId}`

    // Generate a session ID
    const sessionId = `session-${fileId}`

    // Only try to join if connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentUser) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "join_session",
            sessionId,
            fileId,
            userId: this.currentUser.id,
            username: this.currentUser.username,
          }),
        )
      } catch (error) {
        console.error("Error joining session:", error)
      }
    }

    return sessionId
  }

  leaveSession(sessionId: string): void {
    if (!isBrowser || !this.connectionEnabled) return

    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentUser) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "leave_session",
            sessionId,
            userId: this.currentUser.id,
          }),
        )
      } catch (error) {
        console.error("Error leaving session:", error)
      }
    }

    // Remove from local cache
    this.sessions.delete(sessionId)
  }

  sendEdit(sessionId: string, fileId: string, change: any): void {
    if (!isBrowser || !this.connectionEnabled) return

    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentUser) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "edit",
            sessionId,
            fileId,
            userId: this.currentUser.id,
            change,
          }),
        )
      } catch (error) {
        console.error("Error sending edit:", error)
      }
    }
  }

  updateCursor(sessionId: string, position: { line: number; ch: number }): void {
    if (!isBrowser || !this.connectionEnabled) return

    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentUser) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "cursor_update",
            sessionId,
            userId: this.currentUser.id,
            position,
          }),
        )
      } catch (error) {
        console.error("Error updating cursor:", error)
      }
    }
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
      try {
        this.socket.close()
      } catch (error) {
        console.error("Error closing socket:", error)
      }
      this.socket = null
    }

    this.sessions.clear()
    this.currentUser = null
    this.onMessageCallbacks = []
  }

  isConnected(): boolean {
    if (!isBrowser || !this.connectionEnabled) return false
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  // Method to manually disable collaboration
  disableCollaboration(): void {
    this.connectionEnabled = false
    this.disconnect()
    console.log("Collaboration has been manually disabled")
  }
}

// Create a singleton instance with better error handling
export const collaborationService = new CollaborationService()

// Add a global error handler for unhandled WebSocket errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (event.message && (event.message.includes("WebSocket") || event.message.includes("Socket"))) {
      console.warn("Global WebSocket error caught:", event.message)
      collaborationService.disableCollaboration()
      // Prevent the error from bubbling up
      event.preventDefault()
    }
  })
}
