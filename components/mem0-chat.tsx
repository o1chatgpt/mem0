"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, RefreshCw, Send, User, Bot } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Mem0ChatProps {
  integration: any
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
}

export function Mem0Chat({ integration }: Mem0ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "I'm your AI assistant with memory. I can remember our conversations and help you with your tasks.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // First, add the message to Mem0
      await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          messages: [userMessage],
        }),
      })

      // Search for relevant memories
      const searchResponse = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "search",
          query: input,
          limit: 3,
        }),
      })

      if (!searchResponse.ok) {
        throw new Error("Failed to search memories")
      }

      const searchData = await searchResponse.json()
      const relevantMemories = searchData.results?.results || []

      // Format memories for the AI prompt
      let memoriesContext = ""
      if (relevantMemories.length > 0) {
        memoriesContext = "Relevant memories:\n" + relevantMemories.map((m: any) => `- ${m.memory}`).join("\n")
      }

      // Call OpenAI API with context from memories
      // In a real implementation, you would call your AI service here
      // For this example, we'll simulate a response

      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create AI response
      let aiResponse = "I'm processing your request based on our conversation history."

      if (input.toLowerCase().includes("remember")) {
        aiResponse = "I've stored that in my memory and will remember it for future conversations."
      } else if (relevantMemories.length > 0) {
        aiResponse = `Based on our previous conversations, I recall that we discussed similar topics. ${relevantMemories[0].memory}`
      } else if (input.toLowerCase().includes("hello") || input.toLowerCase().includes("hi")) {
        aiResponse = "Hello! How can I assist you today? I'll remember our conversation for future reference."
      } else {
        aiResponse =
          "I've processed your request and will remember this conversation for context in our future interactions."
      }

      // Add AI response to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Store the AI response in Mem0 as well
      await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          messages: [assistantMessage],
        }),
      })
    } catch (error) {
      console.error("Error in chat:", error)
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!integration?.is_active) {
    return (
      <Card className="bg-background border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300 mb-4">
            Connect your Mem0 account to chat with AI that remembers your conversations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-gray-800 flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          AI Chat with Memory
        </CardTitle>
        <CardDescription className="text-gray-400">Chat with an AI that remembers your conversations</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-4">
          {messages.slice(1).map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-white"
                }`}
              >
                <div className="flex items-start">
                  {message.role === "user" ? (
                    <User className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                  ) : (
                    <Bot className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm">{message.content}</p>
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-800 pt-4">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
            className="bg-secondary border-gray-700 text-white"
          />
          <Button
            variant="outline"
            className="border-gray-700 text-white hover:bg-secondary"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
