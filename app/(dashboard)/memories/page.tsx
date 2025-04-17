"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Trash2 } from "lucide-react"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

// Sample memories data
const SAMPLE_MEMORIES = [
  {
    id: "1",
    aiFamilyMemberId: "kara",
    memory: "User prefers to be addressed by their first name",
    relevance: 1.0,
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    aiFamilyMemberId: "lyra",
    memory: "User is writing a science fiction novel",
    relevance: 1.0,
    createdAt: "2023-05-16T14:20:00Z",
  },
  {
    id: "3",
    aiFamilyMemberId: "stan",
    memory: "User is proficient in Python and JavaScript",
    relevance: 1.0,
    createdAt: "2023-05-17T09:15:00Z",
  },
  {
    id: "4",
    aiFamilyMemberId: "sophia",
    memory: "User is interested in Stoic philosophy",
    relevance: 1.0,
    createdAt: "2023-05-18T16:45:00Z",
  },
  {
    id: "5",
    aiFamilyMemberId: "dude",
    memory: "User enjoys craft beer and knows a lot about brewing",
    relevance: 1.0,
    createdAt: "2023-05-19T11:10:00Z",
  },
  {
    id: "6",
    aiFamilyMemberId: "karl",
    memory: "User has a background in data science",
    relevance: 1.0,
    createdAt: "2023-05-20T13:25:00Z",
  },
]

export default function MemoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAI, setSelectedAI] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [memories, setMemories] = useState(SAMPLE_MEMORIES)
  const [filteredMemories, setFilteredMemories] = useState(SAMPLE_MEMORIES)

  const handleSearch = () => {
    setIsSearching(true)
    setTimeout(() => {
      const filtered = memories.filter((memory) => {
        const matchesQuery = searchQuery ? memory.memory.toLowerCase().includes(searchQuery.toLowerCase()) : true
        const matchesAI = selectedAI ? memory.aiFamilyMemberId === selectedAI : true
        return matchesQuery && matchesAI
      })
      setFilteredMemories(filtered)
      setIsSearching(false)
    }, 500)
  }

  const handleDeleteMemory = (id: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      setMemories((prev) => prev.filter((memory) => memory.id !== id))
      setFilteredMemories((prev) => prev.filter((memory) => memory.id !== id))
    }
  }

  const handleClearAllMemories = () => {
    if (confirm("Are you sure you want to clear all memories? This action cannot be undone.")) {
      setMemories([])
      setFilteredMemories([])
    }
  }

  const getAIFamilyMemberName = (id: string) => {
    const member = AI_FAMILY_MEMBERS.find((m) => m.id === id)
    return member ? member.name : id
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Memory Management</h1>
      <p className="mb-8 text-lg text-muted-foreground">View and manage memories across all AI family members</p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="all">All Memories</TabsTrigger>
          <TabsTrigger value="search">Search Memories</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Memories</CardTitle>
                  <CardDescription>View all stored memories</CardDescription>
                </div>
                <Button variant="destructive" onClick={handleClearAllMemories}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memories.length === 0 ? (
                  <p className="text-center text-muted-foreground">No memories found.</p>
                ) : (
                  memories.map((memory) => (
                    <div key={memory.id} className="flex items-start justify-between rounded-md border p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>{getAIFamilyMemberName(memory.aiFamilyMemberId)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{memory.memory}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Memories</CardTitle>
              <CardDescription>Search for specific memories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex-1">
                  <Input
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedAI || ""} onValueChange={(value) => setSelectedAI(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All AI Family Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All AI Family Members</SelectItem>
                      {AI_FAMILY_MEMBERS.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              <div className="space-y-4">
                {filteredMemories.length === 0 ? (
                  <p className="text-center text-muted-foreground">No memories found.</p>
                ) : (
                  filteredMemories.map((memory) => (
                    <div key={memory.id} className="flex items-start justify-between rounded-md border p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>{getAIFamilyMemberName(memory.aiFamilyMemberId)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{memory.memory}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
