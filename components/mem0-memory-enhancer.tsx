"use client"

import type React from "react"

import { useEffect } from "react"
import { useChat } from "ai/react"
import { addMemoryWithEmbedding } from "@/services/vector-store"

interface Mem0MemoryEnhancerProps {
  aiFamily: string
  children: React.ReactNode
}

export function Mem0MemoryEnhancer({ aiFamily, children }: Mem0MemoryEnhancerProps) {
  const { messages } = useChat()

  // Store new messages as memories
  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]

    // Only store assistant messages as memories
    if (lastMessage.role === "assistant") {
      const context = messages
        .slice(-3) // Get last 3 messages for context
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n")

      const memory = `Conversation context: ${context}`

      // Store the memory
      addMemoryWithEmbedding({
        ai_family_member_id: aiFamily,
        user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
        memory,
      }).catch((error) => {
        console.error("Error storing memory:", error)
      })
    }
  }, [messages, aiFamily])

  return <>{children}</>
}
