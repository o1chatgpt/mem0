"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { addMemory, getMemories, searchMemories, type Memory } from "@/lib/mem0"
import { SetupMem0Button } from "@/components/setup-mem0-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "lucide-react"

export default function Mem0DemoPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [tablesExist, setTablesExist] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Check if the ai_family_member_memories table exists
  useEffect(() => {
    async function checkTable() {
      try {
        const { error } = await supabase.from("ai_family_member_memories").select("*", { head: true }).limit(1)

        if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
          setTablesExist(false)
        } else {
          setTablesExist(true)
          fetchMemories()
        }
      } catch (error) {
        console.error("Error checking table:", error)
        setTablesExist(false)
      }
    }

    checkTable()
  }, [supabase])

  async function fetchMemories() {
    setIsLoading(true)
    try {
      const data = await getMemories("mem0")
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
      const success = await addMemory("mem0", newMemory)

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
      const data = await searchMemories("mem0", searchQuery)
      setMemories(data)
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

  // If tables don't exist, show setup screen
  if (!tablesExist) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Mem0 Integration Demo</h1>
          <p className="text-lg text-muted-foreground">Experience AI with long-term memory capabilities</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The Mem0 database tables need to be set up before you can use this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Mem0 requires database tables to store memories and other information. Click the button below to set up
              the required database tables.
            </p>
            <SetupMem0Button />
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            After setup is complete, the page will refresh automatically to start using Mem0.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is Mem0?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Mem0 is a memory layer for AI applications that enables long-term memory capabilities. It allows AI
              assistants to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Remember past conversations and user preferences</li>
              <li>Provide personalized responses based on interaction history</li>
              <li>Maintain context across multiple sessions</li>
              <li>Learn from interactions over time</li>
            </ul>
            <p>
              Once you set up the database, you'll be able to create, search, and manage memories for your AI
              assistants.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Mem0 Integration Demo</h1>
        <p className="text-lg text-muted-foreground">Experience AI with long-term memory capabilities</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mem0</CardTitle>
              <CardDescription>Memory AI Assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Mem0 is a specialized AI assistant with enhanced memory capabilities. It can remember conversations,
                preferences, and facts across sessions.
              </p>
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">Features</h3>
                <ul className="list-inside list-disc">
                  <li>Remembers past conversations</li>
                  <li>Stores user preferences</li>
                  <li>Maintains context across sessions</li>
                  <li>Learns from interactions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Memories</CardTitle>
              <CardDescription>Add and manage memories for Mem0</CardDescription>
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
        </div>
      </div>
    </div>
  )
}
