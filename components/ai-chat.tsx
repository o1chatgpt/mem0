"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIMemory } from "@/hooks/use-ai-memory"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIContextProps {
  userId?: string
  initialMessages?: Message[]
  placeholder?: string
  assistantName?: string
  assistantImageUrl?: string
}

export function AIChat({
  userId = "default_user",
  initialMessages = [],
  placeholder = "Type your message...",
  assistantName = "AI Assistant",
  assistantImageUrl = "/placeholder.svg?height=40&width=40",
}: AIContextProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { memories, fetchMemories, addMemory, useFallback } = useAIMemory(userId)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Search for relevant memories (synchronous in our implementation)
      fetchMemories(input)

      // Generate a response using the mock response generator
      const responseText = generateMockResponse(input, assistantName, userId)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Store the conversation in memory
      addMemory(`User: ${input}\n${assistantName}: ${responseText}`, {
        type: "conversation",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assistantImageUrl} alt={assistantName} />
            <AvatarFallback>{assistantName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{assistantName}</span>
          {useFallback && <span className="text-xs text-muted-foreground ml-2">(Demo Mode)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

// Helper function to generate mock responses
function generateMockResponse(input: string, assistantName: string, userId: string): string {
  const lowerInput = input.toLowerCase()

  // Personalized responses based on AI family member
  if (userId === "lyra") {
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `Hi there! I'm Lyra, your creative file organization assistant. How can I help you today?`
    }

    if (lowerInput.includes("file") || lowerInput.includes("document")) {
      return `I'd be happy to help with your files! I'm particularly good at organizing creative projects and helping you find inspiration in your documents.`
    }

    if (lowerInput.includes("organize") || lowerInput.includes("sort")) {
      return `I love organizing files! Would you like me to suggest a creative organization system for your current projects?`
    }

    return `As your creative assistant, I'm here to help you organize and find inspiration in your files. What kind of project are you working on today?`
  }

  if (userId === "cecilia") {
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `Hello! I'm Cecilia, your document management specialist. I'm here to help you maintain an efficient file system.`
    }

    if (lowerInput.includes("file") || lowerInput.includes("document")) {
      return `Documents are my specialty! I can help you categorize, tag, and retrieve your important files with maximum efficiency.`
    }

    if (lowerInput.includes("organize") || lowerInput.includes("sort")) {
      return `I recommend organizing your documents using a hierarchical system with clear naming conventions. Would you like me to suggest a structure?`
    }

    return `I specialize in document management and categorization. How can I help optimize your file system today?`
  }

  // Default responses
  if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    return `Hello! I'm ${assistantName}, your AI assistant. How can I help you today?`
  }

  if (lowerInput.includes("file") || lowerInput.includes("document")) {
    return `I can help you manage your files and documents. Would you like to upload, organize, or search for specific files?`
  }

  if (lowerInput.includes("help") || lowerInput.includes("support")) {
    return `I'm here to assist with file management, organization, and retrieval. You can ask me to help find files, organize your documents, or provide information about your storage.`
  }

  if (lowerInput.includes("memory") || lowerInput.includes("remember")) {
    return `I use memory technology to remember our conversations and your preferences. This helps me provide more personalized assistance over time.`
  }

  // Default response
  return `I'm here to help with your file management needs. Feel free to ask me about organizing, finding, or working with your files and documents.`
}
