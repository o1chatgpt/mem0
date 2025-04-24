"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { getMemories, searchMemories, storeMemory } from "@/lib/mem0-integration"
import { deleteMemory } from "@/services/mem0-service.tsx"

interface FileMemoryPanelProps {
  fileId: string
  fileName?: string
}

export function FileMemoryPanel({ fileId, fileName = "this file" }: FileMemoryPanelProps) {
  const [memories, setMemories] = useState<any[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  // Default user ID - in a real app, you would get this from authentication
  const userId = "00000000-0000-0000-0000-000000000000"

  useEffect(() => {
    fetchMemories()
  }, [fileId])

  async function fetchMemories() {
    setIsLoading(true)
    try {
      const data = await getMemories(userId, fileId)
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
      const success = await storeMemory(userId, fileId, newMemory, { type: "manual_note" })

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
      const data = await searchMemories(userId, searchQuery)
      // Filter to only include memories for this file
      const filteredData = data.filter((memory) => memory.file_id === fileId)
      setMemories(filteredData)
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

  async function handleDeleteMemory(memoryId: string) {
    setIsLoading(true)
    try {
      const success = await deleteMemory(memoryId)
      if (success) {
        fetchMemories()
        toast({
          title: "Success",
          description: "Memory deleted successfully",
        })
      } else {
        throw new Error("Failed to delete memory")
      }
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>File Memories</CardTitle>
        <CardDescription>Notes and memories for {fileName}</CardDescription>
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
                    <p>{memory.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(memory.created_at || "").toLocaleString()}
                      </p>
                      {memory.metadata && memory.metadata.type && (
                        <p className="text-xs text-muted-foreground">Type: {memory.metadata.type}</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a new memory or note about this file..."
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
