"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMemoryStore } from "@/lib/memory-store"
import { formatDistanceToNow, format } from "date-fns"
import { Search, FileText, Folder, Tag, Clock, Filter, Calendar, User, Trash2, Download, RefreshCw } from "lucide-react"

interface MemoryInsightsProps {
  showAdminControls?: boolean
}

export function MemoryInsights({ showAdminControls = false }: MemoryInsightsProps) {
  const [memories, setMemories] = useState<any[]>([])
  const [filteredMemories, setFilteredMemories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [users, setUsers] = useState<string[]>([])

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const memoryStore = await getMemoryStore()
        const allMemories = await memoryStore.getAllMemories()

        // Extract unique users if admin mode
        if (showAdminControls) {
          const uniqueUsers = [...new Set(allMemories.map((m) => m.userId || "anonymous"))]
          setUsers(uniqueUsers)
        }

        setMemories(allMemories)
        setFilteredMemories(allMemories)

        // Initialize selected types with all available types
        const types = [...new Set(allMemories.map((m) => m.type || "unknown"))]
        setSelectedTypes(types)
      } catch (error) {
        console.error("Error loading memories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMemories()
  }, [showAdminControls])

  useEffect(() => {
    // Apply filters whenever search query or selected types change
    let filtered = [...memories]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((memory) => {
        // Search in path
        const path = memory.metadata?.path?.toLowerCase() || ""
        // Search in query
        const searchQuery = memory.metadata?.query?.toLowerCase() || ""
        // Search in tags
        const tags = memory.metadata?.tags?.join(" ").toLowerCase() || ""
        // Search in type
        const type = memory.type?.toLowerCase() || ""

        return path.includes(query) || searchQuery.includes(query) || tags.includes(query) || type.includes(query)
      })
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((memory) => selectedTypes.includes(memory.type || "unknown"))
    }

    // Filter by user if in admin mode
    if (showAdminControls && selectedUser !== "all") {
      filtered = filtered.filter((memory) => memory.userId === selectedUser)
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredMemories(filtered)
  }, [memories, searchQuery, selectedTypes, sortOrder, selectedUser, showAdminControls])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    const types = [...new Set(memories.map((m) => m.type || "unknown"))]
    setSelectedTypes(types)
    setSortOrder("newest")
    if (showAdminControls) {
      setSelectedUser("all")
    }
  }

  const handleDeleteMemory = async (memoryId: string) => {
    if (!showAdminControls || !confirm("Are you sure you want to delete this memory?")) {
      return
    }

    try {
      const memoryStore = await getMemoryStore()
      // This would be a method you'd need to add to your memory store
      // For now, we'll simulate it by filtering the local state
      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
      setFilteredMemories((prev) => prev.filter((m) => m.id !== memoryId))
    } catch (error) {
      console.error("Error deleting memory:", error)
    }
  }

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case "file_access":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "folder_navigation":
        return <Folder className="h-4 w-4 text-yellow-500" />
      case "search":
        return <Search className="h-4 w-4 text-green-500" />
      case "tag":
        return <Tag className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search memories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        {showAdminControls && (
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user} value={user}>
                  {user || "Anonymous"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" onClick={handleClearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[...new Set(memories.map((m) => m.type || "unknown"))].map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleTypeToggle(type)}
            />
            <Label htmlFor={`type-${type}`} className="flex items-center">
              {getMemoryIcon(type)}
              <span className="ml-1 capitalize">{type.replace("_", " ") || "Unknown"}</span>
            </Label>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memory Records</CardTitle>
          <CardDescription>
            Showing {filteredMemories.length} of {memories.length} memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {filteredMemories.length > 0 ? (
              <div className="space-y-4">
                {filteredMemories.map((memory, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {getMemoryIcon(memory.type)}
                        <div className="ml-2">
                          <div className="font-medium">
                            {memory.type === "file_access" && `File: ${memory.metadata?.path || "Unknown file"}`}
                            {memory.type === "folder_navigation" &&
                              `Folder: ${memory.metadata?.path || "Unknown folder"}`}
                            {memory.type === "search" && `Search: "${memory.metadata?.query || "Unknown query"}"`}
                            {memory.type === "tag" && `Tag: ${memory.metadata?.tag || "Unknown tag"}`}
                            {(!memory.type ||
                              !["file_access", "folder_navigation", "search", "tag"].includes(memory.type)) &&
                              `${memory.type || "Unknown activity"}`}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(new Date(memory.timestamp), "PPpp")} (
                            {formatDistanceToNow(new Date(memory.timestamp), { addSuffix: true })})
                          </div>
                          {showAdminControls && (
                            <div className="text-sm text-muted-foreground mt-1">
                              User: {memory.userId || "Anonymous"}
                            </div>
                          )}
                          {memory.metadata?.tags && memory.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.metadata.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {showAdminControls && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMemory(memory.id)}
                            title="Delete memory"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No memories found matching your filters</p>
                <Button variant="link" onClick={handleClearFilters} className="mt-2">
                  Clear filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {showAdminControls && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  )
}
