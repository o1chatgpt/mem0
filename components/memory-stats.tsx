"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Star, Search, Tag } from "lucide-react"
import { useAppContext } from "@/lib/app-context"

export function MemoryStats() {
  const { memoryStore } = useAppContext()
  const [stats, setStats] = useState({
    totalMemories: 0,
    recentMemories: 0,
    favoriteFiles: 0,
    searchQueries: 0,
    tags: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // Get memory statistics
        const memories = await memoryStore.searchMemories("", 1000)
        const favorites = (await memoryStore.retrieveMemory<string[]>("favorites")) || []
        const searchHistory = (await memoryStore.retrieveMemory<string[]>("searchHistory")) || []

        // Get all tags from all files
        const tagMemories = await memoryStore.searchMemories("tag:", 100)
        const uniqueTags = new Set<string>()
        tagMemories.forEach((memory) => {
          const match = memory.memory.match(/tag:(.*?)( |$)/g)
          if (match) {
            match.forEach((tag) => {
              uniqueTags.add(tag.replace("tag:", "").trim())
            })
          }
        })

        setStats({
          totalMemories: memories.length,
          recentMemories: memories.filter((m) => new Date(m.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
            .length,
          favoriteFiles: favorites.length,
          searchQueries: searchHistory.length,
          tags: uniqueTags.size,
        })
      } catch (error) {
        console.error("Error loading memory stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [memoryStore])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Memory Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  Total Memories
                </div>
                <span>{stats.totalMemories}</span>
              </div>
              <Progress value={Math.min(stats.totalMemories / 10, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Recent Memories (7 days)
                </div>
                <span>{stats.recentMemories}</span>
              </div>
              <Progress value={Math.min(stats.recentMemories / 5, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Favorite Files
                </div>
                <span>{stats.favoriteFiles}</span>
              </div>
              <Progress value={Math.min(stats.favoriteFiles / 5, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-green-500" />
                  Search Queries
                </div>
                <span>{stats.searchQueries}</span>
              </div>
              <Progress value={Math.min(stats.searchQueries / 10, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-purple-500" />
                  Unique Tags
                </div>
                <span>{stats.tags}</span>
              </div>
              <Progress value={Math.min(stats.tags / 10, 100)} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
