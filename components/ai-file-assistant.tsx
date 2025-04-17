"use client"

import { useState, useRef, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, RefreshCw, FileText, Clipboard, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { smartMemoryService } from "@/lib/smart-memory-service"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  fileContext?: {
    fileName: string
    fileId: string
  }
}

export function AIFileAssistant() {
  const { selectedFile, files } = useAppContext()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI file assistant. How can I help you with your files today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ fileId: string; score: number }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [memoryInitialized, setMemoryInitialized] = useState(false)

  // Initialize memory
  useEffect(() => {
    const initMemory = async () => {
      try {
        await smartMemoryService.initialize()
        setMemoryInitialized(true)

        // Load previous conversation from memory
        const previousMessages = await smartMemoryService
          .getFileMemory("ai_assistant")
          .then((memory) => memory.notes)
          .then((notes) => {
            try {
              // Try to parse the first note as the message history
              if (notes && notes.length > 0) {
                return JSON.parse(notes[0]) as Message[]
              }
              return null
            } catch (e) {
              console.error("Error parsing message history:", e)
              return null
            }
          })

        if (previousMessages && Array.isArray(previousMessages)) {
          setMessages(previousMessages)
        }
      } catch (error) {
        console.error("Error initializing memory:", error)
        // Continue with default welcome message
      }
    }

    initMemory()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    // Save messages to memory
    if (memoryInitialized && messages.length > 0) {
      // Store messages as a note on the AI assistant "file"
      smartMemoryService
        .getFileMemory("ai_assistant")
        .then((memory) => {
          return smartMemoryService.updateFileMemory("ai_assistant", {
            notes: [JSON.stringify(messages), ...(memory.notes || []).slice(1)],
          })
        })
        .catch(console.error)
    }
  }, [messages, memoryInitialized])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      fileContext: selectedFile
        ? {
            fileName: selectedFile.name,
            fileId: selectedFile.id,
          }
        : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // In a real implementation, this would call an AI service like OpenAI
      // For now, we'll simulate a response based on the input
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let responseContent =
        "I'm currently in development mode and can't process your request with a real AI model yet. "

      if (selectedFile) {
        responseContent += `I see you're working with the file "${selectedFile.name}". `

        // Get file memory for context
        const fileMemory = await smartMemoryService.getFileMemory(selectedFile.id, selectedFile)

        if (input.toLowerCase().includes("content") || input.toLowerCase().includes("what's in")) {
          responseContent += `This is a ${selectedFile.type} file with a size of ${selectedFile.size}.`

          if (fileMemory.analysisResults?.summary) {
            responseContent += ` According to my analysis: ${fileMemory.analysisResults.summary}`
          }
        } else if (input.toLowerCase().includes("analyze") || input.toLowerCase().includes("summary")) {
          if (fileMemory.analysisResults?.summary) {
            responseContent += `Based on my analysis: ${fileMemory.analysisResults.summary}`

            if (fileMemory.analysisResults.insights) {
              responseContent += `\n\nHere are some insights: ${fileMemory.analysisResults.insights.split("\n\n")[0]}`
            }
          } else {
            responseContent += `I would analyze this file for you in a production environment. For now, I can tell you it's located at ${selectedFile.path}.`
          }
        } else if (input.toLowerCase().includes("tag") || input.toLowerCase().includes("label")) {
          if (fileMemory.tags && fileMemory.tags.length > 0) {
            responseContent += `This file has the following tags: ${fileMemory.tags.join(", ")}.`
          } else {
            responseContent += `This file doesn't have any tags yet. You can add tags in the File Analyzer.`
          }
        } else if (input.toLowerCase().includes("related") || input.toLowerCase().includes("similar")) {
          const relatedFiles = await smartMemoryService.findRelatedFiles(selectedFile.id, 3)
          if (relatedFiles.length > 0) {
            responseContent += `I found ${relatedFiles.length} related files based on tags and content similarity.`
          } else {
            responseContent += `I couldn't find any related files. Try adding more tags to help establish connections.`
          }
        } else {
          responseContent += `I can help you manage, analyze, and understand your files better once I'm connected to an AI model.`
        }

        // Record this interaction
        await smartMemoryService.recordInteraction(
          selectedFile.id,
          "open",
          `Discussed in AI assistant: ${input.substring(0, 50)}`,
        )
      } else {
        // If no file is selected, try to search for relevant files
        if (input.toLowerCase().includes("find") || input.toLowerCase().includes("search")) {
          const searchTerm = input.replace(/find|search|for|about|files|file/gi, "").trim()
          if (searchTerm) {
            const results = await smartMemoryService.searchFiles(searchTerm, 3)
            if (results.length > 0) {
              responseContent = `I found ${results.length} files that might be relevant to "${searchTerm}". You can select them from the file explorer.`
            } else {
              responseContent = `I couldn't find any files related to "${searchTerm}". Try a different search term or browse the file explorer.`
            }
          } else {
            responseContent = `You don't have a file selected currently. You can select a file from the file explorer to get more specific assistance.`
          }
        } else {
          responseContent = `You don't have a file selected currently. You can select a file from the file explorer to get more specific assistance.`
        }
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "system",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await smartMemoryService.searchFiles(searchQuery, 5)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching files:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearConversation = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI file assistant. How can I help you with your files today?",
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])

    // Clear conversation in memory
    if (memoryInitialized) {
      smartMemoryService
        .getFileMemory("ai_assistant")
        .then((memory) => {
          return smartMemoryService.updateFileMemory("ai_assistant", {
            notes: [JSON.stringify([welcomeMessage]), ...(memory.notes || []).slice(1)],
          })
        })
        .catch(console.error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            AI File Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <Alert className="mx-4 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <AlertDescription>
              This assistant is powered by Mem0 and can help you analyze, understand, and work with your files.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2 px-4 mb-4">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
            <Button size="icon" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-sm font-medium mb-2">Search Results:</h3>
              <div className="space-y-1">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-2 bg-muted rounded-md text-sm flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{result.fileId}</span>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(result.score * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                          ? "bg-muted"
                          : "bg-muted"
                    } rounded-lg p-3`}
                  >
                    {message.role !== "user" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>{message.role === "assistant" ? "AI" : "SYS"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="mb-1">
                        {message.fileContext && (
                          <Badge variant="outline" className="mb-1">
                            <FileText className="h-3 w-3 mr-1" />
                            {message.fileContext.fileName}
                          </Badge>
                        )}
                        <p className={message.role === "user" ? "text-primary-foreground" : ""}>{message.content}</p>
                      </div>
                      <div className="text-xs opacity-70 text-right">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <Separator />

          <div className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your files..."
                disabled={isProcessing}
              />
              <Button type="submit" size="icon" disabled={isProcessing || !input.trim()}>
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={clearConversation}
                title="Clear conversation"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
