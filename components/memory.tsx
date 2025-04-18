"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useMem0 } from "@/components/mem0-provider"

type Memory = {
  id: string
  memory: string
  created_at: string
  ai_family_member_id?: string // Updated to match the new schema
}

export function Memory({ aiFamily }: { aiFamily: string }) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { addMemory, getMemories, searchMemories, isLoading } = useMem0()

  useEffect(() => {
    fetchMemories()
  }, [aiFamily])

  async function fetchMemories() {
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
    }
  }

  async function handleAddMemory() {
    if (!newMemory.trim()) return

    const success = await addMemory(aiFamily, newMemory)

    if (success) {
      setNewMemory("")
      fetchMemories()
      toast({
        title: "Success",
        description: "Memory added successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add memory",
        variant: "destructive",
      })
    }
  }

  async function handleSearch() {
    if (searchQuery.trim()) {
      const data = await searchMemories(aiFamily, searchQuery)
      setMemories(data)
    } else {
      fetchMemories()
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
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
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
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(memory.created_at).toLocaleString()}</p>
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
