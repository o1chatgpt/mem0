"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import {
  addMemoryWithEmbedding,
  getMemories,
  searchMemoriesBySimilarity,
  type MemoryEntry,
} from "@/services/vector-store"

export function Memory({ aiFamily }: { aiFamily: string }) {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMemories()
  }, [aiFamily])

  async function fetchMemories() {
    setIsLoading(true)
    try {
      const data = await getMemories(aiFamily)
      setMemories(data)
    } catch (error) {
      console.error("Error fetching memories:", error)
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddMemory() {
    if (!newMemory.trim()) return

    setIsLoading(true)
    try {
      const success = await addMemoryWithEmbedding({
        ai_family_member_id: aiFamily,
        user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
        memory: newMemory,
      })

      if (success) {
        setNewMemory("")
        fetchMemories()
        toast({
          title: "Success",
          description: "Memory added successfully",
        })
      } else {
        throw new Error("Failed to add memory")
      }
    } catch (error) {
      console.error("Error adding memory:", error)
      toast({
        title: "Error",
        description: "Failed to add memory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      fetchMemories()
      return
    }

    setIsSearching(true)
    try {
      if (searchQuery.length > 3) {
        // Use vector similarity search for longer queries
        const data = await searchMemoriesBySimilarity(aiFamily, searchQuery)
        setMemories(data)
      } else {
        // Use simple text search for short queries
        const data = await getMemories(aiFamily)
        const filtered = data.filter((memory) => memory.memory.toLowerCase().includes(searchQuery.toLowerCase()))
        setMemories(filtered)
      }
    } catch (error) {
      console.error("Error searching memories:", error)
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Memories</CardTitle>
        <CardDescription>
          Add and manage memories for {aiFamily.charAt(0).toUpperCase() + aiFamily.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-[300px] pr-4">
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
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="rounded-lg border p-4">
                    <p>{memory.memory}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(memory.created_at || "").toLocaleString()}
                      </p>
                      {memory.relevance && (
                        <p className="text-xs text-muted-foreground">
                          Relevance: {Math.round(memory.relevance * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a new memory..."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            className="min-h-[80px]"
          />
          <Button onClick={handleAddMemory} disabled={isLoading || !newMemory.trim()}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
