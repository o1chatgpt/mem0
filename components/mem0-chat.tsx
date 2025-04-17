"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Memory } from "@/lib/mem0"
import { BrainCircuit, Send } from "lucide-react"

interface Mem0ChatProps {
  userId: number
  aiMemberId?: number
}

type Message = {
  role: "user" | "assistant"
  content: string
}

export function Mem0Chat({ userId, aiMemberId }: Mem0ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [showMemories, setShowMemories] = useState(false)

  useEffect(() => {
    // Load memories on component mount
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get",
          userId,
          aiMemberId,
          limit: 10,
        }),
      })

      const data = await response.json()
      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (error) {
      console.error("Error fetching memories:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          userId,
          aiMemberId,
          content: input,
        }),
      })

      const data = await response.json()

      if (data.text) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.text }])
      }

      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat with Memory</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowMemories(!showMemories)}>
            <BrainCircuit className="h-4 w-4 mr-2" />
            {showMemories ? "Hide Memories" : "Show Memories"}
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div
              className={`${showMemories ? "md:col-span-2" : "md:col-span-3"} h-[400px] overflow-y-auto border rounded-md p-4`}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">Start a conversation...</div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-muted">
                    <div className="flex items-center">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showMemories && (
              <div className="h-[400px] overflow-y-auto border rounded-md p-4">
                <h3 className="font-medium mb-2">Memories</h3>
                {memories.length === 0 ? (
                  <div className="text-gray-500">No memories yet</div>
                ) : (
                  memories.map((memory) => (
                    <div key={memory.id} className="mb-2 p-2 border rounded-md text-sm">
                      <p>{memory.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(memory.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
