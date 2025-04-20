"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState, useEffect, useRef } from "react"
import { Upload, Search, Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMem0 } from "@/components/mem0/mem0-provider"
import { FileExplorer } from "./file-explorer"
import { QuickAccessPanel } from "./quick-access-panel"
import { TechnicalDocPanel } from "./technical-doc-panel"
import { useTheme } from "@/components/theme-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { FamilyMemberSelector } from "@/components/family-members/family-member-selector"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function FileManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [memories, setMemories] = useState<any[]>([])
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiInput, setAIInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to AI Family Toolkit. How can I help you with your files today?",
      timestamp: new Date(),
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { addMemory, searchMemories, generateWithMemory, isInitialized, isLoading, error, currentFamilyMember } =
    useMem0()

  // Display an error message if there's an issue with the API connection
  useEffect(() => {
    if (error) {
      console.error("Mem0 error:", error)
    }
  }, [error])

  // Update welcome message when family member changes
  useEffect(() => {
    if (currentFamilyMember) {
      setMessages([
        {
          role: "system",
          content: `Welcome to AI Family Toolkit. I'm ${currentFamilyMember.name}, your ${currentFamilyMember.role}. How can I help you today?`,
          timestamp: new Date(),
        },
      ])
    }
  }, [currentFamilyMember])

  // Search memories when query changes
  useEffect(() => {
    if (searchQuery && isInitialized && currentFamilyMember) {
      const fetchMemories = async () => {
        const results = await searchMemories(searchQuery, "default_user", 5, currentFamilyMember.id)
        setMemories(results.results || [])
      }
      fetchMemories()
    } else {
      setMemories([])
    }
  }, [searchQuery, isInitialized, searchMemories, currentFamilyMember])

  // Record user interaction as a memory
  const recordInteraction = async (action: string, item: string) => {
    if (isInitialized && currentFamilyMember) {
      await addMemory(`User ${action} ${item} in the file manager`, "default_user", currentFamilyMember.id)
    }
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!aiInput.trim() || isLoading || !currentFamilyMember) return

    const userMessage: Message = {
      role: "user",
      content: aiInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setAIInput("")

    try {
      const response = await generateWithMemory(aiInput, "default_user", currentFamilyMember.id)

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
      {/* Quick Access Panel */}
      <div className="col-span-12 md:col-span-3 bg-card border rounded-lg overflow-hidden">
        <QuickAccessPanel onItemSelect={(item) => recordInteraction("accessed", item)} />
      </div>

      {/* Main File Explorer */}
      <div className="col-span-12 md:col-span-6 bg-card border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Files</h2>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button size="sm" variant="outline" className="w-full md:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={showAIPanel ? "default" : "outline"}
                      className="w-full md:w-auto"
                      onClick={() => setShowAIPanel(!showAIPanel)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Assistant
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get help from your AI assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <FamilyMemberSelector />
            </div>
          </div>
        </div>

        <Tabs defaultValue="explorer" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2 justify-start">
            <TabsTrigger value="explorer">Explorer</TabsTrigger>
            {showAIPanel && <TabsTrigger value="assistant">AI Assistant</TabsTrigger>}
          </TabsList>

          <TabsContent value="explorer" className="flex-1 overflow-auto p-4 m-0">
            <FileExplorer
              onFileOpen={(file) => recordInteraction("opened", file.name)}
              onFolderOpen={(folder) => recordInteraction("opened folder", folder.name)}
            />

            {/* Memory Results */}
            {memories.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Related Activities</h3>
                  <ul className="space-y-1">
                    {memories.map((memory, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          {new Date(memory.timestamp).toLocaleDateString()}
                        </Badge>
                        <span>{memory.memory}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {showAIPanel && (
            <TabsContent value="assistant" className="flex-1 flex flex-col p-4 m-0">
              {error ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="p-4 bg-destructive/10 text-destructive rounded-md max-w-md">
                    <h3 className="font-semibold mb-2">Connection Error</h3>
                    <p>{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/profile")}>
                      Configure API Key
                    </Button>
                  </div>
                </div>
              ) : !currentFamilyMember ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="p-4 bg-primary/10 rounded-md max-w-md">
                    <h3 className="font-semibold mb-2">Select an AI Family Member</h3>
                    <p>Please select an AI family member to chat with using the selector above.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-8 w-8 mr-2">
                      {currentFamilyMember.avatar ? (
                        <AvatarImage
                          src={currentFamilyMember.avatar || "/placeholder.svg"}
                          alt={currentFamilyMember.name}
                        />
                      ) : null}
                      <AvatarFallback>
                        {currentFamilyMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{currentFamilyMember.name}</h3>
                      <p className="text-xs text-muted-foreground">{currentFamilyMember.role}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto mb-4 border rounded-md p-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.role === "user"
                            ? "text-right"
                            : message.role === "system"
                              ? "text-center italic text-muted-foreground"
                              : "text-left"
                        }`}
                      >
                        {message.role !== "system" && (
                          <Badge variant={message.role === "user" ? "default" : "secondary"} className="mb-1">
                            {message.role === "user" ? "You" : currentFamilyMember.name}
                          </Badge>
                        )}
                        <div
                          className={`${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.role === "system"
                                ? ""
                                : "bg-muted"
                          } ${message.role !== "system" ? "p-3 rounded-lg inline-block" : ""}`}
                        >
                          {message.content}
                        </div>
                        {message.role !== "system" && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Ask ${currentFamilyMember.name} for help...`}
                      value={aiInput}
                      onChange={(e) => setAIInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="resize-none"
                    />
                    <Button onClick={handleSendMessage} disabled={!aiInput.trim() || isLoading} className="shrink-0">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Technical Documentation Panel */}
      <div className="col-span-12 md:col-span-3 bg-card border rounded-lg overflow-hidden">
        <TechnicalDocPanel />
      </div>
    </div>
  )
}
