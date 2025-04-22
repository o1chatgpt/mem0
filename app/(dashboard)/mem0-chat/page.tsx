"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "ai/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SimpleMarkdownRenderer } from "@/components/simple-markdown-renderer"
import { MemoryVisualization } from "@/components/memory-visualization"
import { useMem0 } from "@/components/mem0-provider"
import { Database, Search, Plus, Brain, MessageSquare, Network } from "lucide-react"

export default function Mem0ChatPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [contextTab, setContextTab] = useState("list")
  const [memories, setMemories] = useState<any[]>([])
  const [relevantMemories, setRelevantMemories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addMemory, getMemories, searchMemories, isLoading } = useMem0()

  // Initialize chat with Mem0 context
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/chat-with-memory",
    body: {
      aiFamily: "mem0",
      relevantMemories,
    },
    onFinish: async (message) => {
      // Store the conversation as a memory
      if (messages.length > 0) {
        const userMessage = messages[messages.length - 1].content
        await addMemory("mem0", `User asked: "${userMessage}" and Mem0 responded: "${message.content}"`)
        // Refresh memories after adding a new one
        fetchMemories()
      }
    },
  })

  // Fetch memories on component mount
  useEffect(() => {
    fetchMemories()
  }, [])

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Find relevant memories when user types
  useEffect(() => {
    if (input.trim().length > 3) {
      findRelevantMemories(input)
    }
  }, [input])

  // Fetch all memories
  async function fetchMemories() {
    try {
      const data = await getMemories("mem0")
      setMemories(data)
    } catch (error) {
      console.error("Error fetching memories:", error)
    }
  }

  // Find memories relevant to the current input
  async function findRelevantMemories(query: string) {
    try {
      const data = await searchMemories("mem0", query)
      setRelevantMemories(data)
    } catch (error) {
      console.error("Error searching memories:", error)
    }
  }

  // Handle memory search
  async function handleSearch() {
    if (!searchQuery.trim()) {
      fetchMemories()
      return
    }

    try {
      const data = await searchMemories("mem0", searchQuery)
      setMemories(data)
    } catch (error) {
      console.error("Error searching memories:", error)
    }
  }

  // Add a new memory manually
  async function handleAddMemory() {
    if (!newMemory.trim()) return

    try {
      const success = await addMemory("mem0", newMemory)
      if (success) {
        setNewMemory("")
        fetchMemories()
      }
    } catch (error) {
      console.error("Error adding memory:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Mem0 Chat</h1>
      <p className="mb-8 text-lg text-muted-foreground">Experience AI with long-term memory capabilities</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/abstract-ai-network.png" alt="Mem0" />
                  <AvatarFallback>M0</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Mem0</CardTitle>
                  <CardDescription>AI with long-term memory</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-full px-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="max-w-md text-center">
                      <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-xl font-medium">Start a conversation with Mem0</h3>
                      <p className="text-muted-foreground">
                        Mem0 remembers your conversations and learns from them. Try asking something and see how it
                        responds with context from past interactions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <SimpleMarkdownRenderer content={message.content} />
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message to Mem0..."
                    value={input}
                    onChange={handleInputChange}
                    className="min-h-[60px]"
                  />
                  <Button type="submit" disabled={isChatLoading || !input.trim()}>
                    {isChatLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="context">
                <MessageSquare className="mr-2 h-4 w-4" />
                Context
              </TabsTrigger>
              <TabsTrigger value="memories">
                <Database className="mr-2 h-4 w-4" />
                Memories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="mt-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Relevant Context</CardTitle>
                      <CardDescription>Memories that are relevant to your current conversation</CardDescription>
                    </div>
                    <Tabs value={contextTab} onValueChange={setContextTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list">List</TabsTrigger>
                        <TabsTrigger value="visual">
                          <Network className="mr-2 h-4 w-4" />
                          Visual
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-0">
                  <Tabs value={contextTab}>
                    <TabsContent value="list">
                      <ScrollArea className="h-full px-4">
                        {relevantMemories.length === 0 ? (
                          <div className="flex h-full items-center justify-center p-4">
                            <p className="text-center text-muted-foreground">
                              {input.trim().length > 3
                                ? "No relevant memories found"
                                : "Type something to see relevant memories"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 py-4">
                            {relevantMemories.map((memory) => (
                              <div key={memory.id} className="rounded-lg border p-3">
                                <p className="text-sm">{memory.memory}</p>
                                {memory.relevance && (
                                  <Badge variant="secondary" className="mt-2">
                                    Relevance: {Math.round(memory.relevance * 100)}%
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="visual">
                      <div className="p-4 h-full">
                        <MemoryVisualization
                          memories={relevantMemories}
                          currentQuery={input.trim().length > 3 ? input : undefined}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memories" className="mt-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>All Memories</CardTitle>
                  <CardDescription>Search, view, and add memories for Mem0</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-4">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Search memories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button size="icon" onClick={handleSearch} disabled={isLoading}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[320px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">Loading memories...</p>
                      </div>
                    ) : memories.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          {searchQuery ? "No matching memories found" : "No memories yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {memories.map((memory) => (
                          <div key={memory.id} className="rounded-lg border p-3">
                            <p className="text-sm">{memory.memory}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(memory.created_at || "").toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="mt-4 flex gap-2">
                    <Textarea
                      placeholder="Add a new memory..."
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button size="icon" onClick={handleAddMemory} disabled={isLoading || !newMemory.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
