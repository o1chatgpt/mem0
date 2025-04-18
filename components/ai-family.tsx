"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Plus, Trash2, Search, RefreshCw, MessageSquare } from "lucide-react"
import { vectorStore } from "@/lib/vector-store"
import { useAppContext } from "@/lib/app-context"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FamilyMember {
  id: string
  name: string
  description: string
  avatar?: string
  personality: string
  memories: string[]
}

export function AIFamily() {
  const { loading } = useAppContext()
  const [initialized, setInitialized] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newMember, setNewMember] = useState<Omit<FamilyMember, "id" | "memories">>({
    name: "",
    description: "",
    personality: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [newMemory, setNewMemory] = useState("")
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [usingLocalFallback, setUsingLocalFallback] = useState(true)

  // Initialize vector store and load family members
  useEffect(() => {
    const init = async () => {
      try {
        await vectorStore.initialize()
        setUsingLocalFallback(vectorStore.isUsingLocalFallback())

        // Load family members from vector store
        const results = await vectorStore.searchSimilar("family_member_profile", 10, 0.5)

        const members: FamilyMember[] = []
        for (const result of results) {
          if (result.metadata.type === "family_member") {
            // Load memories for this family member
            const memberMemories = await vectorStore.searchSimilar(`memory_for_${result.metadata.id}`, 100, 0.7)

            members.push({
              id: result.metadata.id,
              name: result.metadata.name,
              description: result.metadata.description,
              avatar: result.metadata.avatar,
              personality: result.metadata.personality,
              memories: memberMemories.map((m) => m.text),
            })
          }
        }

        setFamilyMembers(members)
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing AI Family:", error)
        setInitialized(true)
      }
    }

    init()
  }, [])

  // Create a new family member
  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.personality) return

    setIsCreating(true)
    try {
      const memberId = `family-${Date.now()}`

      // Store the family member profile
      await vectorStore.storeEmbedding(
        `family_member_profile ${newMember.name} ${newMember.description} ${newMember.personality}`,
        {
          type: "family_member",
          id: memberId,
          name: newMember.name,
          description: newMember.description,
          personality: newMember.personality,
          avatar: newMember.avatar,
        },
      )

      const newFamilyMember: FamilyMember = {
        id: memberId,
        name: newMember.name,
        description: newMember.description,
        personality: newMember.personality,
        avatar: newMember.avatar,
        memories: [],
      }

      setFamilyMembers([...familyMembers, newFamilyMember])
      setSelectedMember(newFamilyMember)
      setIsCreating(false)
      setIsAddingMemory(false)

      // Reset form
      setNewMember({
        name: "",
        description: "",
        personality: "",
      })
    } catch (error) {
      console.error("Error creating family member:", error)
      setIsCreating(false)
    }
  }

  // Add a memory to a family member
  const handleAddMemory = async () => {
    if (!selectedMember || !newMemory) return

    setIsAddingMemory(true)
    try {
      // Store the memory with reference to the family member
      await vectorStore.storeEmbedding(`memory_for_${selectedMember.id} ${newMemory}`, {
        type: "memory",
        familyMemberId: selectedMember.id,
        text: newMemory,
      })

      // Update the selected member's memories
      const updatedMember = {
        ...selectedMember,
        memories: [...selectedMember.memories, newMemory],
      }

      // Update the family members list
      setFamilyMembers(familyMembers.map((member) => (member.id === selectedMember.id ? updatedMember : member)))

      setSelectedMember(updatedMember)
      setNewMemory("")
      setIsAddingMemory(false)
    } catch (error) {
      console.error("Error adding memory:", error)
      setIsAddingMemory(false)
    }
  }

  // Search for memories or family members
  const handleSearch = async () => {
    if (!searchQuery) return

    setIsSearching(true)
    try {
      const results = await vectorStore.searchSimilar(searchQuery, 5, 0.6)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Delete a family member
  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm(`Are you sure you want to delete ${member.name}?`)) return

    try {
      // Search for all embeddings related to this family member
      const memberEmbeddings = await vectorStore.searchSimilar(`family_member_profile ${member.name}`, 1, 0.9)
      const memberMemories = await vectorStore.searchSimilar(`memory_for_${member.id}`, 100, 0.7)

      // Delete all embeddings
      for (const embedding of [...memberEmbeddings, ...memberMemories]) {
        await vectorStore.deleteEmbedding(embedding.id)
      }

      // Update state
      setFamilyMembers(familyMembers.filter((m) => m.id !== member.id))
      if (selectedMember?.id === member.id) {
        setSelectedMember(null)
      }
    } catch (error) {
      console.error("Error deleting family member:", error)
    }
  }

  if (!initialized || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {usingLocalFallback && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <Brain className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Using local vector storage. Your AI family data will only be stored in this browser session.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Members List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">AI Family Members</h2>
            <Button
              size="sm"
              onClick={() => {
                setIsCreating(true)
                setSelectedMember(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Member
            </Button>
          </div>

          {familyMembers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p>No family members yet. Create your first AI family member!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedMember?.id === member.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedMember(member)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar || `/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{member.description}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMember(member)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Member Details or Create Form */}
        <div className="md:col-span-2">
          {isCreating ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Family Member</CardTitle>
                <CardDescription>Add a new AI family member with their own personality and memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="e.g. Grandma Emma"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newMember.description}
                    onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
                    placeholder="e.g. Wise grandmother who loves to tell stories"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Textarea
                    id="personality"
                    value={newMember.personality}
                    onChange={(e) => setNewMember({ ...newMember, personality: e.target.value })}
                    placeholder="Describe the personality, speaking style, and traits of this family member"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (optional)</Label>
                  <Input
                    id="avatar"
                    value={newMember.avatar || ""}
                    onChange={(e) => setNewMember({ ...newMember, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewMember({
                      name: "",
                      description: "",
                      personality: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateMember} disabled={isCreating || !newMember.name || !newMember.personality}>
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : selectedMember ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMember.avatar || `/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback>{selectedMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedMember.name}</CardTitle>
                    <CardDescription>{selectedMember.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Personality</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedMember.personality}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Memories</h3>
                    <Badge variant="outline">{selectedMember.memories.length}</Badge>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedMember.memories.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No memories yet. Add some memories below.
                      </p>
                    ) : (
                      selectedMember.memories.map((memory, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded-md text-sm">
                          <MessageSquare className="h-4 w-4 inline-block mr-2 text-muted-foreground" />
                          {memory}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Add New Memory</h3>
                  <div className="flex space-x-2">
                    <Textarea
                      value={newMemory}
                      onChange={(e) => setNewMemory(e.target.value)}
                      placeholder="Add a memory for this family member..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button onClick={handleAddMemory} disabled={isAddingMemory || !newMemory}>
                      {isAddingMemory ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">AI Family Members</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Create AI family members with unique personalities and memories. They can interact with your files and
                  provide personalized assistance.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Family Member
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search Section */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Search</CardTitle>
                <CardDescription>Search for memories and family members using natural language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for memories or family members..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchQuery}>
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <h3 className="text-sm font-medium mb-2">Search Results</h3>
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-md text-sm">
                        <p>{result.text}</p>
                        {result.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value).substring(0, 20)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
