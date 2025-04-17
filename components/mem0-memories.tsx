"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, RefreshCw, Search, Plus, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Mem0MemoriesProps {
  integration: any
}

interface Memory {
  id: string
  memory: string
  created_at: string
  score?: number
}

export function Mem0Memories({ integration }: Mem0MemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

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
        throw new Error("Failed to fetch memories")
      }

      const data = await response.json()
      setMemories(data.results?.results || [])
    } catch (err) {
      setError("Error fetching memories. Please check your connection and try again.")
      toast({
        title: "Error",
        description: "Failed to fetch Mem0 memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchMemories = async () => {
    if (!searchQuery.trim()) return

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

  useEffect(() => {
    if (integration?.is_active) {
      fetchMemories()
    }
  }, [integration])

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
    <Card className="bg-background border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Mem0 Memories
        </CardTitle>
        <CardDescription className="text-gray-400">Your personal AI memory layer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex space-x-2">
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary border-gray-700 text-white"
            />
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-secondary"
              onClick={searchMemories}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Add memory form */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <Textarea
              placeholder="Add a new memory..."
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="bg-secondary border-gray-700 text-white min-h-[80px]"
            />
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchMemories} className="border-gray-700 text-white">
                Try Again
              </Button>
            </div>
          ) : memories.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No memories found</p>
          ) : (
            <div className="space-y-3 mt-4">
              {memories.map((memory) => (
                <div key={memory.id} className="p-3 rounded-md bg-secondary border border-gray-700">
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white">{memory.memory}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(memory.created_at).toLocaleString()}
                        {memory.score !== undefined && ` • Relevance: ${(memory.score * 100).toFixed(0)}%`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
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
