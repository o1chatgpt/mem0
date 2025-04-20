"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Tag, PlusCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Mem0CategoriesProps {
  integration: any
}

export function Mem0Categories({ integration }: Mem0CategoriesProps) {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Update the fetchTags function with better error handling
  const fetchTags = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getTags",
        }),
      })

      if (!response.ok) {
        console.warn("Failed to fetch tags, status:", response.status)
        setTags([])
        setIsLoading(false)
        return
      }

      const data = await response.json()

      // If no tags are returned, just set empty array and return
      if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
        setTags([])
        setIsLoading(false)
        return
      }

      // Get memory counts for each tag - with error handling
      try {
        const tagCounts = await Promise.all(
          data.tags.map(async (tag: string) => {
            try {
              const countResponse = await fetch(`/api/mem0?tag=${tag}&limit=1000`)
              if (!countResponse.ok) {
                return { tag, count: 0 }
              }
              const countData = await countResponse.json()
              return {
                tag,
                count: countData.results?.results?.length || 0,
              }
            } catch (countError) {
              console.warn(`Error counting memories for tag ${tag}:`, countError)
              return { tag, count: 0 }
            }
          }),
        )

        // Sort by count (descending)
        setTags(tagCounts.sort((a, b) => b.count - a.count))
      } catch (countError) {
        console.error("Error counting tags:", countError)
        // If counting fails, just show tags without counts
        setTags(data.tags.map((tag: string) => ({ tag, count: 0 })))
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
      setTags([])
      // Only show toast for network errors, not for empty results
      if (error instanceof Error && error.message !== "Failed to fetch") {
        toast({
          title: "Error",
          description: "Failed to fetch memory categories",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = async () => {
    if (!newTag.trim()) return

    setIsAdding(true)
    try {
      // Create a simple memory with this tag
      await fetch("/api/mem0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          messages: [{ role: "system", content: `Category created: ${newTag}` }],
          tags: [newTag.trim().toLowerCase()],
        }),
      })

      toast({
        title: "Category Added",
        description: `The "${newTag}" category has been created`,
      })

      setNewTag("")
      fetchTags()
    } catch (error) {
      console.error("Error adding tag:", error)
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (integration?.is_active) {
      fetchTags()
    }
  }, [integration])

  if (!integration?.is_active) {
    return (
      <Card className="bg-background border-gray-800">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300 mb-4">Connect your Mem0 account to manage memory categories.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Tag className="h-5 w-5 mr-2 text-primary" />
          Memory Categories
        </CardTitle>
        <CardDescription className="text-gray-400">Organize your memories with categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new category */}
          <div className="flex space-x-2">
            <Input
              placeholder="New category name..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="bg-secondary border-gray-700 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTag()
                }
              }}
            />
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-secondary"
              onClick={addTag}
              disabled={isAdding || !newTag.trim()}
            >
              {isAdding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            </Button>
          </div>

          {/* Categories list */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : tags.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No categories found</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {tags.map(({ tag, count }) => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary border border-gray-700"
                >
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-primary text-white border-0">
                      {count}
                    </Badge>
                    <span className="ml-2 text-white">#{tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-secondary"
          onClick={fetchTags}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Categories
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
