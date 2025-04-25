"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Search, Clock } from "lucide-react"

interface Memory {
  id: string
  text: string
  timestamp: string
}

export function MemoryInsights() {
  const { memoryStore } = useAppContext()
  const [memories, setMemories] = useState<Memory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Memory[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Load memories when component mounts
  useEffect(() => {
    const loadMemories = () => {
      try {
        const allMemories = memoryStore.getMemories()
        setMemories(allMemories)
      } catch (error) {
        console.error("Error loading memories:", error)
      }
    }

    loadMemories()
  }, [memoryStore])

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const query = searchQuery.toLowerCase()
    const results = memories.filter((memory) => memory.text.toLowerCase().includes(query))

    setSearchResults(results)
  }

  // Group memories by date
  const groupedMemories = memories.reduce(
    (groups, memory) => {
      const date = new Date(memory.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(memory)
      return groups
    },
    {} as Record<string, Memory[]>,
  )

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedMemories).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Memory Insights
        </CardTitle>
        <div className="flex space-x-2 mt-2">
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="text-sm"
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto h-[calc(100%-80px)]">
        {isSearching ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Search Results</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSearchResults([])
                  setIsSearching(false)
                }}
              >
                Clear
              </Button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No memories match your search</p>
            ) : (
              searchResults.map((memory) => (
                <div key={memory.id} className="border-b pb-2 mb-2 last:border-0">
                  <p className="text-sm">{memory.text}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">{new Date(memory.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {memories.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No memories yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your actions will be remembered here</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-sm font-medium mb-2 sticky top-0 bg-card py-1">{date}</h3>
                  <div className="space-y-2">
                    {groupedMemories[date].map((memory) => (
                      <div key={memory.id} className="border-b pb-2 last:border-0">
                        <p className="text-sm">{memory.text}</p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
