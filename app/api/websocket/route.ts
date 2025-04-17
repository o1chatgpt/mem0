import type { NextRequest } from "next/server"
import { Memory } from "@/lib/mem0-client"

// Store active connections
const connections = new Map<string, WebSocket>()
// Store active sessions
const sessions = new Map<string, Set<string>>()

// Declare Deno if it's not available globally
declare const Deno: any

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const userName = searchParams.get("userName")

  if (!userId || !userName) {
    return new Response("Missing userId or userName", { status: 400 })
  }

  // Store collaboration context in Mem0
  const memory = new Memory()
  await memory.add(
    [
      { role: "system", content: "User collaboration activity" },
      { role: "user", content: `User ${userName} (${userId}) connected to collaborative editing` },
    ],
    userId,
  )

  // This is needed for the Edge runtime
  const upgradeHeader = request.headers.get("Upgrade")
  if (upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 })
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(request)

    // Set up event handlers
    socket.onopen = () => {
      console.log(`WebSocket connection opened for user ${userId}`)
      connections.set(userId, socket)
    }

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data)

        // Handle different message types
        switch (message.type) {
          case "join_session":
            handleJoinSession(userId, message.sessionId)
            broadcastToSession(message.sessionId, {
              type: "user_joined",
              userId,
              userName,
              timestamp: new Date().toISOString(),
            })

            // Store in Mem0
            await memory.add(
              [
                { role: "system", content: "Collaboration session activity" },
                { role: "user", content: `User ${userName} joined session ${message.sessionId}` },
              ],
              userId,
            )
            break

          case "leave_session":
            handleLeaveSession(userId, message.sessionId)
            broadcastToSession(message.sessionId, {
              type: "user_left",
              userId,
              userName,
              timestamp: new Date().toISOString(),
            })

            // Store in Mem0
            await memory.add(
              [
                { role: "system", content: "Collaboration session activity" },
                { role: "user", content: `User ${userName} left session ${message.sessionId}` },
              ],
              userId,
            )
            break

          case "operation":
            broadcastToSession(message.sessionId, {
              ...message,
              userId,
              userName,
              timestamp: new Date().toISOString(),
            })

            // Store operation in Mem0 for learning patterns
            await memory.add(
              [
                { role: "system", content: "Collaboration edit operation" },
                {
                  role: "user",
                  content: `User ${userName} performed ${message.operation.type} operation in session ${message.sessionId}`,
                },
              ],
              userId,
            )
            break

          default:
            console.log(`Unknown message type: ${message.type}`)
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error)
      }
    }

    socket.onclose = () => {
      console.log(`WebSocket connection closed for user ${userId}`)
      connections.delete(userId)

      // Remove user from all sessions
      for (const [sessionId, users] of sessions.entries()) {
        if (users.has(userId)) {
          users.delete(userId)
          broadcastToSession(sessionId, {
            type: "user_left",
            userId,
            userName,
            timestamp: new Date().toISOString(),
          })
        }
      }
    }

    socket.onerror = (error) => {
      console.error(`WebSocket error for user ${userId}:`, error)
    }

    return response
  } catch (error) {
    console.error("Error upgrading to WebSocket:", error)
    return new Response("Error upgrading to WebSocket", { status: 500 })
  }
}

// Helper functions
function handleJoinSession(userId: string, sessionId: string) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Set())
  }
  sessions.get(sessionId)?.add(userId)
}

function handleLeaveSession(userId: string, sessionId: string) {
  const sessionUsers = sessions.get(sessionId)
  if (sessionUsers) {
    sessionUsers.delete(userId)
    if (sessionUsers.size === 0) {
      sessions.delete(sessionId)
    }
  }
}

function broadcastToSession(sessionId: string, message: any) {
  const sessionUsers = sessions.get(sessionId)
  if (!sessionUsers) return

  const messageStr = JSON.stringify(message)
  for (const userId of sessionUsers) {
    const connection = connections.get(userId)
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(messageStr)
    }
  }
}
