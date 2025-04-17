"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Plus, Trash2, Search, RefreshCw, MessageSquare, Share2, Shield, Users } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseService, type AIFamilyMember, type AIMemory } from "@/lib/supabase-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AIFamily() {
  const { loading } = useAppContext()
  const [initialized, setInitialized] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<AIFamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<AIFamilyMember | null>(null)
  const [memories, setMemories] = useState<AIMemory[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newMember, setNewMember] = useState<Omit<AIFamilyMember, "id" | "created_by" | "created_at" | "updated_at">>({
    name: "",
    description: "",
    personality: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AIMemory[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [newMemory, setNewMemory] = useState("")
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [activeTab, setActiveTab] = useState("memories")
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [selectedPermissionType, setSelectedPermissionType] = useState<"user" | "ai">("user")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedAIId, setSelectedAIId] = useState("")
  const [permissionLevel, setPermissionLevel] = useState<"read" | "write" | "admin">("read")
  const [users, setUsers] = useState<{ id: string; username: string }[]>([])
  const [otherAIMembers, setOtherAIMembers] = useState<AIFamilyMember[]>([])

  // Initialize and load family members
  useEffect(() => {
    const init = async () => {
      try {
        await supabaseService.initialize()
        loadFamilyMembers()

        // Load users for permissions
        // In a real app, this would be filtered by role/permissions
        const mockUsers = [
          { id: "user1", username: "john_doe" },
          { id: "user2", username: "jane_smith" },
          { id: "user3", username: "admin_user" },
        ]
        setUsers(mockUsers)
      } catch (error) {
        console.error("Error initializing AI Family:", error)
      } finally {
        setInitialized(true)
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const loadFamilyMembers = async () => {
    setIsLoading(true)
    try {
      const members = await supabaseService.getAIFamilyMembers()
      setFamilyMembers(members)
    } catch (error) {
      console.error("Error loading family members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load memories when a member is selected
  useEffect(() => {
    if (selectedMember) {
      loadMemories(selectedMember.id)

      // Load other AI members for permissions (excluding selected)
      const others = familyMembers.filter((m) => m.id !== selectedMember.id)
      setOtherAIMembers(others)
    } else {
      setMemories([])
    }
  }, [selectedMember, familyMembers])

  const loadMemories = async (memberId: string) => {
    try {
      const memberMemories = await supabaseService.getAIMemories(memberId)
      setMemories(memberMemories)
    } catch (error) {
      console.error("Error loading memories:", error)
    }
  }

  // Create a new family member
  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.personality) return

    setIsCreating(true)
    try {
      const createdMember = await supabaseService.createAIFamilyMember(newMember)

      if (createdMember) {
        setFamilyMembers([...familyMembers, createdMember])
        setSelectedMember(createdMember)
        setIsCreating(false)

        // Reset form
        setNewMember({
          name: "",
          description: "",
          personality: "",
        })
      }
    } catch (error) {
      console.error("Error creating family member:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Add a memory to a family member
  const handleAddMemory = async () => {
    if (!selectedMember || !newMemory) return

    setIsAddingMemory(true)
    try {
      const memory: Omit<AIMemory, "id" | "created_at"> = {
        ai_family_member_id: selectedMember.id,
        content: newMemory,
        metadata: {
          source: "user_input",
          timestamp: new Date().toISOString(),
        },
      }

      const createdMemory = await supabaseService.createAIMemory(memory)

      if (createdMemory) {
        setMemories([createdMemory, ...memories])
        setNewMemory("")
      }
    } catch (error) {
      console.error("Error adding memory:", error)
    } finally {
      setIsAddingMemory(false)
    }
  }

  // Search for memories
  const handleSearch = async () => {
    if (!searchQuery) return

    setIsSearching(true)
    try {
      const results = await supabaseService.searchAIMemories(searchQuery, selectedMember?.id, 5)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Delete a family member
  const handleDeleteMember = async (member: AIFamilyMember) => {
    if (!confirm(`Are you sure you want to delete ${member.name}?`)) return

    try {
      const success = await supabaseService.deleteAIFamilyMember(member.id)

      if (success) {
        setFamilyMembers(familyMembers.filter((m) => m.id !== member.id))
        if (selectedMember?.id === member.id) {
          setSelectedMember(null)
        }
      }
    } catch (error) {
      console.error("Error deleting family member:", error)
    }
  }

  // Add permission
  const handleAddPermission = async () => {
    if (!selectedMember) return

    try {
      // In a real app, this would call the supabaseService to add a permission
      console.log("Adding permission:", {
        type: selectedPermissionType,
        entityId: selectedPermissionType === "user" ? selectedUserId : selectedAIId,
        level: permissionLevel,
      })

      // Close dialog and reset form
      setIsPermissionDialogOpen(false)
      setSelectedPermissionType("user")
      setSelectedUserId("")
      setSelectedAIId("")
      setPermissionLevel("read")
    } catch (error) {
      console.error("Error adding permission:", error)
    }
  }

  if (!initialized || loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-16 overflow-auto">
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Brain className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          AI Family members are stored in your Supabase database and can interact with your files based on assigned
          permissions.
        </AlertDescription>
      </Alert>

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
                        <AvatarImage src={member.avatar_url || `/placeholder.svg?height=40&width=40`} />
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
                    value={newMember.avatar_url || ""}
                    onChange={(e) => setNewMember({ ...newMember, avatar_url: e.target.value })}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedMember.avatar_url || `/placeholder.svg?height=48&width=48`} />
                      <AvatarFallback>{selectedMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedMember.name}</CardTitle>
                      <CardDescription>{selectedMember.description}</CardDescription>
                    </div>
                  </div>
                  <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Permissions</DialogTitle>
                        <DialogDescription>
                          Control who can access and interact with {selectedMember.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Permission Type</Label>
                          <Select
                            value={selectedPermissionType}
                            onValueChange={(value) => setSelectedPermissionType(value as "user" | "ai")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="ai">
                                <div className="flex items-center">
                                  <Brain className="h-4 w-4 mr-2" />
                                  AI Family Member
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPermissionType === "user" ? (
                          <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Select AI Family Member</Label>
                            <Select value={selectedAIId} onValueChange={setSelectedAIId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI member" />
                              </SelectTrigger>
                              <SelectContent>
                                {otherAIMembers.map((ai) => (
                                  <SelectItem key={ai.id} value={ai.id}>
                                    {ai.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Permission Level</Label>
                          <Select
                            value={permissionLevel}
                            onValueChange={(value) => setPermissionLevel(value as "read" | "write" | "admin")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                  Read Only
                                </div>
                              </SelectItem>
                              <SelectItem value="write">
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                                  Read & Write
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-purple-500" />
                                  Full Access
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddPermission}
                          disabled={
                            (selectedPermissionType === "user" && !selectedUserId) ||
                            (selectedPermissionType === "ai" && !selectedAIId)
                          }
                        >
                          Add Permission
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Personality</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedMember.personality}</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="memories">Memories</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>

                  <TabsContent value="memories" className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Memories</h3>
                        <Badge variant="outline">{memories.length}</Badge>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {memories.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No memories yet. Add some memories below.
                          </p>
                        ) : (
                          memories.map((memory) => (
                            <div key={memory.id} className="bg-muted/50 p-3 rounded-md text-sm">
                              <MessageSquare className="h-4 w-4 inline-block mr-2 text-muted-foreground" />
                              {memory.content}
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
                          {isAddingMemory ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="search">
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for memories..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch()
                          }}
                        />
                        <Button onClick={handleSearch} disabled={isSearching || !searchQuery}>
                          {isSearching ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          <h3 className="text-sm font-medium mb-2">Search Results</h3>
                          {searchResults.map((result) => (
                            <div key={result.id} className="bg-muted/50 p-3 rounded-md text-sm">
                              <p>{result.content}</p>
                              {result.metadata && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {Object.entries(result.metadata).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}:{" "}
                                      {typeof value === "string"
                                        ? value.substring(0, 20)
                                        : String(value).substring(0, 20)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : searchQuery && !isSearching ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No results found for "{searchQuery}"
                        </div>
                      ) : null}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">AI Family Members</h3>
                <p className="text-center text-muted-foreground mb-6">
                  Create AI family members with unique personalities and memories. They can interact with your files and
                  provide personalized assistance based on role-based permissions.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Family Member
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
