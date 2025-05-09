"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Plus, Search, Brain, MessageSquare, Tag, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Memory = {
  id: number
  content: string
  created_at: string
  ai_member_id: number | null
  category?: string | null
  relevance_score?: number
}

type MemoryCategory = {
  id: number
  name: string
  description: string | null
  color: string | null
  icon: string | null
  user_id: number
  created_at: string
}

export default function Mem0Integration({ userId = 1 }: { userId?: number }) {
  const { toast } = useToast()
  const [isInitializing, setIsInitializing] = useState(true)
  const [memories, setMemories] = useState<Memory[]>([])
  const [categories, setCategories] = useState<MemoryCategory[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Initialize the memory system
  useEffect(() => {
    async function initialize() {
      try {
        // Call the API to initialize tables
        const response = await fetch("/api/mem0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "getCategories",
            userId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to initialize Mem0")
        }

        const data = await response.json()
        setCategories(data.categories || [])

        // Fetch initial memories
        fetchMemories()

        // Fetch stats
        fetchStats()
      } catch (error) {
        console.error("Error initializing Mem0:", error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize memory system. Some features may not work correctly.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [userId, toast])

  // Fetch memories from the API
  const fetchMemories = async (category?: string | null) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          userId,
          category: category || selectedCategory,
          limit: 20,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch memories")
      }

      const data = await response.json()
      setMemories(data.memories || [])
    } catch (error) {
      console.error("Error fetching memories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch memory stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stats",
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch memory stats")
      }

      const data = await response.json()
      setStats(data.stats || null)
    } catch (error) {
      console.error("Error fetching memory stats:", error)
    }
  }

  // Add a new memory
  const addMemory = async () => {
    if (!newMemory.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          userId,
          content: newMemory,
          category: selectedCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add memory")
      }

      setNewMemory("")
      toast({
        title: "Success",
        description: "Memory added successfully",
      })

      // Refresh memories
      fetchMemories()
      fetchStats()
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

  // Search memories
  const searchMemories = async () => {
    if (!searchQuery.trim()) {
      fetchMemories()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "search",
          userId,
          query: searchQuery,
          category: selectedCategory,
          limit: 20,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search memories")
      }

      const data = await response.json()
      setMemories(data.memories || [])
    } catch (error) {
      console.error("Error searching memories:", error)
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update memory category
  const updateMemoryCategory = async (memoryId: number, category: string | null) => {
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateMemoryCategory",
          memoryId,
          category,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update memory category")
      }

      // Refresh memories
      fetchMemories()
      fetchStats()

      toast({
        title: "Success",
        description: "Memory category updated",
      })
    } catch (error) {
      console.error("Error updating memory category:", error)
      toast({
        title: "Error",
        description: "Failed to update memory category",
        variant: "destructive",
      })
    }
  }

  // Filter by category
  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category)
    fetchMemories(category)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Initializing memory system...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          Mem0 Memory System
        </CardTitle>
        <CardDescription>Store and retrieve important information for your file management assistant</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="memories">
          <TabsList className="mb-4">
            <TabsTrigger value="memories" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memories">
            <div className="space-y-4">
              {/* Add new memory */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a new memory..."
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center space-x-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={addMemory} disabled={isLoading || !newMemory.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Memory
                  </Button>
                </div>
              </div>

              {/* Search memories */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchMemories()}
                />
                <Button variant="outline" onClick={searchMemories}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => filterByCategory(null)}
                >
                  All
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedCategory === category.name ? category.color || undefined : undefined,
                    }}
                    onClick={() => filterByCategory(category.name)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              {/* Memory list */}
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No memories found. Add some memories to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div key={memory.id} className="rounded-lg border p-4">
                        <div className="mb-2 text-sm text-muted-foreground">
                          {formatDate(memory.created_at)}
                          {memory.relevance_score !== undefined && (
                            <span className="ml-2 text-xs">(Relevance: {memory.relevance_score})</span>
                          )}
                        </div>
                        <p className="mb-2">{memory.content}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            {memory.category ? (
                              <Badge>{memory.category}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No category</span>
                            )}
                          </div>
                          <select
                            className="text-xs rounded-md border border-input bg-background px-2 py-1"
                            value={memory.category || ""}
                            onChange={(e) => updateMemoryCategory(memory.id, e.target.value || null)}
                          >
                            <option value="">No Category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories found. Categories will be created automatically.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg" style={{ color: category.color || undefined }}>
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{category.description || "No description"}</p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" size="sm" onClick={() => filterByCategory(category.name)}>
                          View Memories
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              {!stats ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Memories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.count}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{categories.length}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Uncategorized</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.uncategorizedCount || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stats.categoryDistribution.map((item: any) => (
                            <div key={item.name} className="flex items-center">
                              <div className="w-32 truncate">{item.name}</div>
                              <div className="flex-1 mx-2">
                                <div className="h-2 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${item.percentage}%`,
                                      backgroundColor: item.color || "#888888",
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-12 text-right text-sm">
                                {item.count} ({item.percentage}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
