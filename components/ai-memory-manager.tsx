"use client"

import { useState } from "react"
import { useAIMemory } from "@/hooks/use-ai-memory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Search, Trash2 } from "lucide-react"

interface AIMemoryManagerProps {
  userId: string
  aiFamilyMemberId: string
  aiFamilyMemberName: string
}

export function AIMemoryManager({ userId, aiFamilyMemberId, aiFamilyMemberName }: AIMemoryManagerProps) {
  const [newMemory, setNewMemory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ memory: string; relevance: number; created_at: string }>>(
    [],
  )
  const [isSearching, setIsSearching] = useState(false)

  const { addMemory, searchMemories, clearMemories, isLoading, error } = useAIMemory({
    userId,
    aiFamilyMemberId,
  })

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return

    const success = await addMemory(newMemory)
    if (success) {
      setNewMemory("")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const results = await searchMemories(searchQuery)
    setSearchResults(results.results)
    setIsSearching(false)
  }

  const handleClearMemories = async () => {
    if (confirm("Are you sure you want to clear all memories for this AI family member?")) {
      await clearMemories()
      setSearchResults([])
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{aiFamilyMemberName}'s Memory Manager</CardTitle>
        <CardDescription>Add and search memories for personalized AI interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Add New Memory</h3>
          <Textarea
            placeholder="Enter a new memory or fact about the user..."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleAddMemory} disabled={isLoading || !newMemory.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Memory
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Search Memories</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Search for memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} variant="outline">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Results</h4>
              <ul className="space-y-2">
                {searchResults.map((result, index) => (
                  <li key={index} className="rounded-md border p-3 text-sm">
                    <p>{result.memory}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Relevance: {result.relevance.toFixed(2)}</span>
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="destructive" onClick={handleClearMemories} disabled={isLoading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Memories
        </Button>
      </CardFooter>
    </Card>
  )
}
