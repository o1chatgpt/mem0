"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, RefreshCw, Search, Plus, MessageSquare, Tag, Filter, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Mem0MemoriesProps {
  integration: any
}

interface Memory {
  id: string
  memory: string
  created_at: string
  score?: number
  tags?: string[]
}

export function Mem0Memories({ integration }: Mem0MemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [memoryTags, setMemoryTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)

  const fetchMemories = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mem0", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.warn("Failed to fetch memories, status:", response.status)
        setMemories([])
        setIsLoading(false)
        return
      }

      const data = await response.json()

      // Handle case where results might be missing or empty
      if (!data.results || !data.results.results) {
        setMemories([])
        return
      }

      const memoriesWithTags = data.results.results || []

      // Extract all unique tags
      const tags = new Set<string>()
      memoriesWithTags.forEach((memory: Memory) => {
        if (memory.tags) {
          memory.tags.forEach((tag) => tags.add(tag))
        } else if (memory.metadata && memory.metadata.tags) {
          // Handle different response formats
          memory.metadata.tags.forEach((tag: string) => tags.add(tag))
        }
      })

      setAllTags(Array.from(tags))
      setMemories(memoriesWithTags)
    } catch (err) {
      console.error("Error fetching memories:", err)
      setMemories([])
      // Only show toast for serious errors
      if (err instanceof Error && err.message !== "Failed to fetch") {
        toast({
          title: "Error",
          description: "Failed to fetch Mem0 memories",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const searchMemories = async () => {
    if (!searchQuery.trim() && !activeTagFilter) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "search",
          query: searchQuery,
          tag: activeTagFilter,
          limit: 10,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search memories")
      }

      const data = await response.json()
      setMemories(data.results?.results || [])
    } catch (err) {
      setError("Error searching memories. Please try again.")
      toast({
        title: "Error",
        description: "Failed to search Mem0 memories",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const addMemory = async () => {
    if (!newMemory.trim()) return

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          messages: [{ role: "user", content: newMemory }],
          tags: memoryTags,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add memory")
      }

      toast({
        title: "Memory Added",
        description: "Your memory has been successfully added",
      })

      setNewMemory("")
      setMemoryTags([])
      fetchMemories() // Refresh the memories list
    } catch (err) {
      setError("Error adding memory. Please try again.")
      toast({
        title: "Error",
        description: "Failed to add Mem0 memory",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const clearTagFilter = () => {
    setActiveTagFilter(null)
    fetchMemories()
  }

  useEffect(() => {
    if (integration?.is_active) {
      fetchMemories()
    }
  }, [integration])

  // When tag filter changes, search with it
  useEffect(() => {
    if (activeTagFilter) {
      searchMemories()
    }
  }, [activeTagFilter])

  if (!integration?.is_active) {
    return (
      <Card className="bg-background border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300 mb-4">Connect your Mem0 account to view and manage your memories.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-gray-800 flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Mem0 Memories
        </CardTitle>
        <CardDescription className="text-gray-400">Your personal AI memory layer</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {/* Search bar with tag filter */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary border-gray-700 text-white pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-gray-400"
                onClick={searchMemories}
                disabled={isSearching}
              >
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`border-gray-700 ${activeTagFilter ? "bg-primary text-white" : "text-white hover:bg-secondary"}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {activeTagFilter ? `#${activeTagFilter}` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-secondary border-gray-700 text-white">
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                {activeTagFilter && (
                  <DropdownMenuItem onClick={clearTagFilter} className="text-primary">
                    Clear filter
                  </DropdownMenuItem>
                )}
                <DropdownMenuGroup>
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => setActiveTagFilter(tag)}
                        className={activeTagFilter === tag ? "bg-gray-700" : ""}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        <span>{tag}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No tags available</DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active tag filter indicator */}
          {activeTagFilter && (
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Filtered by:</span>
              <Badge variant="secondary" className="bg-primary text-white" onClick={clearTagFilter}>
                #{activeTagFilter}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            </div>
          )}

          {/* Add memory form */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <Textarea
              placeholder="Add a new memory..."
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="bg-secondary border-gray-700 text-white min-h-[60px] max-h-[100px]"
            />

            {/* Tag input */}
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-400">
                <Tag className="h-3 w-3 mr-1" />
                <span>Tags</span>
              </div>
              <TagInput
                tags={memoryTags}
                setTags={setMemoryTags}
                placeholder="Add tags..."
                suggestions={allTags}
                className="bg-secondary border-gray-700"
              />
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-secondary"
              onClick={addMemory}
              disabled={isAdding || !newMemory.trim()}
            >
              {isAdding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Memory
                </>
              )}
            </Button>
          </div>

          {/* Memories list */}
          <div className="overflow-y-auto max-h-[180px]">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-400 mb-2">{error}</p>
                <Button variant="outline" onClick={fetchMemories} className="border-gray-700 text-white">
                  Try Again
                </Button>
              </div>
            ) : memories.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No memories found</p>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div key={memory.id} className="p-3 rounded-md bg-secondary border border-gray-700">
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                      <div className="w-full">
                        <p className="text-sm text-white">{memory.memory}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400">
                            {new Date(memory.created_at).toLocaleString()}
                            {memory.score !== undefined && ` • Relevance: ${(memory.score * 100).toFixed(0)}%`}
                          </p>
                          {memory.tags && memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {memory.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 h-5 bg-gray-800 border-gray-700 hover:bg-primary hover:text-white cursor-pointer"
                                  onClick={() => setActiveTagFilter(tag)}
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t border-gray-800 pt-3">
        <Button
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-secondary"
          onClick={fetchMemories}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Memories
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
