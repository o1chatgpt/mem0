"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Memory, MemoryCategory } from "@/lib/mem0"
import { BrainCircuit, Send, Info, Tag, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Mem0ChatProps {
  userId: number
  aiMemberId?: number
}

type Message = {
  role: "user" | "assistant"
  content: string
  memoryCount?: number
  category?: string | null
}

type MemoryStats = {
  count: number
  oldestDate: Date | null
  newestDate: Date | null
  categoryDistribution: Array<{ category: string | null; count: number }>
}

export function Mem0Chat({ userId, aiMemberId }: Mem0ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [showMemories, setShowMemories] = useState(false)
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    count: 0,
    oldestDate: null,
    newestDate: null,
    categoryDistribution: [],
  })
  const [usedPromptTemplate, setUsedPromptTemplate] = useState<boolean>(false)

  useEffect(() => {
    // Load memories, categories, and stats on component mount
    fetchMemories()
    fetchCategories()
    fetchMemoryStats()
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
          category: selectedCategory,
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getCategories",
          userId,
        }),
      })

      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchMemoryStats = async () => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stats",
          userId,
          aiMemberId,
        }),
      })

      const data = await response.json()
      if (data.stats) {
        setMemoryStats({
          count: data.stats.count,
          oldestDate: data.stats.oldestDate ? new Date(data.stats.oldestDate) : null,
          newestDate: data.stats.newestDate ? new Date(data.stats.newestDate) : null,
          categoryDistribution: data.stats.categoryDistribution || [],
        })
      }
    } catch (error) {
      console.error("Error fetching memory stats:", error)
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
          category: selectedCategory,
        }),
      })

      const data = await response.json()

      if (data.text) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            memoryCount: data.memoryCount || 0,
            category: data.suggestedCategory,
          },
        ])

        // Set whether a custom prompt template was used
        setUsedPromptTemplate(data.usedPromptTemplate || false)
      }

      if (data.memories) {
        setMemories(data.memories)
      }

      // Refresh memory stats after generating a response
      fetchMemoryStats()
    } catch (error) {
      console.error("Error generating response:", error)
      let errorMessage = "Sorry, I encountered an error while processing your request."

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes("does not have access to model")) {
          errorMessage = "Sorry, the AI model is currently unavailable. Please try again later."
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMemoryCategory = async (memoryId: number, category: string | null) => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateMemoryCategory",
          memoryId,
          category,
        }),
      })

      const data = await response.json()
      if (data.memory) {
        // Update the memory in the list
        setMemories((prev) =>
          prev.map((mem) => (mem.id === memoryId ? { ...mem, category: data.memory.category } : mem)),
        )
      }
    } catch (error) {
      console.error("Error updating memory category:", error)
    }
  }

  const getCategoryColor = (categoryName: string | null) => {
    if (!categoryName) return "#888888"
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#888888"
  }

  const getCategoryBadge = (categoryName: string | null) => {
    if (!categoryName) return null

    const style = {
      backgroundColor: getCategoryColor(categoryName),
      color: "white",
    }

    return (
      <Badge style={style} className="ml-2">
        <Tag className="h-3 w-3 mr-1" />
        {categoryName}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle>Chat with Memory</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-sm">
                    <p>Total memories: {memoryStats.count}</p>
                    {memoryStats.oldestDate && (
                      <p>
                        Memory span: {memoryStats.oldestDate.toLocaleDateString()} -{" "}
                        {memoryStats.newestDate?.toLocaleDateString()}
                      </p>
                    )}
                    {memoryStats.categoryDistribution.length > 0 && (
                      <div>
                        <p>Categories:</p>
                        <ul className="pl-2">
                          {memoryStats.categoryDistribution.map((item, index) => (
                            <li key={index}>
                              {item.category || "Uncategorized"}: {item.count}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedCategory || "All Categories"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCategory(null)
                    fetchMemories()
                  }}
                >
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.name)
                      fetchMemories()
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color || "#888888" }}
                      ></div>
                      {category.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setShowMemories(!showMemories)}>
              <BrainCircuit className="h-4 w-4 mr-2" />
              {showMemories ? "Hide Memories" : "Show Memories"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          {selectedCategory && (
            <div className="mb-4 p-2 bg-muted/50 rounded-md text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getCategoryColor(selectedCategory) }}
                ></div>
                <span>
                  Using <strong>{selectedCategory}</strong> category prompt
                  {usedPromptTemplate && " with custom template"}
                </span>
              </div>
            </div>
          )}
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
                      <div className="mt-2 text-xs flex items-center justify-end">
                        {message.role === "assistant" &&
                          message.memoryCount !== undefined &&
                          message.memoryCount > 0 && (
                            <Badge variant="outline" className="ml-auto">
                              <BrainCircuit className="h-3 w-3 mr-1" />
                              {message.memoryCount} memories used
                            </Badge>
                          )}
                        {message.role === "assistant" && message.category && getCategoryBadge(message.category)}
                      </div>
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
                <h3 className="font-medium mb-2">Relevant Memories</h3>
                {memories.length === 0 ? (
                  <div className="text-gray-500">No memories yet</div>
                ) : (
                  memories.map((memory) => (
                    <div key={memory.id} className="mb-2 p-2 border rounded-md text-sm">
                      <p>{memory.content}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{new Date(memory.created_at).toLocaleString()}</p>
                        <div className="flex items-center">
                          {memory.relevance_score !== undefined && (
                            <Badge variant="secondary" className="text-xs mr-2">
                              Relevance: {memory.relevance_score}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                {memory.category ? (
                                  <div className="flex items-center">
                                    <div
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: getCategoryColor(memory.category) }}
                                    ></div>
                                    <span className="text-xs">{memory.category}</span>
                                  </div>
                                ) : (
                                  <Tag className="h-3 w-3" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Set Category</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateMemoryCategory(memory.id, null)}>
                                None
                              </DropdownMenuItem>
                              {categories.map((category) => (
                                <DropdownMenuItem
                                  key={category.id}
                                  onClick={() => handleUpdateMemoryCategory(memory.id, category.name)}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: category.color || "#888888" }}
                                    ></div>
                                    {category.name}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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
