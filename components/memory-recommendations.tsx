"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, FileText } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import type { FileInfo } from "@/lib/file-service"

export function MemoryRecommendations() {
  const { memoryStore, setSelectedFileId, files } = useAppContext()
  const [recommendations, setRecommendations] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true)
      try {
        // Get recent memories to analyze user behavior
        const recentMemories = await memoryStore.searchMemories("", 50)

        // Extract file IDs from memories
        const fileIds = new Set<string>()
        recentMemories.forEach((memory) => {
          const match = memory.memory.match(/file_id:([a-zA-Z0-9-_]+)/)
          if (match && match[1]) {
            fileIds.add(match[1])
          }
        })

        // Get file information for the extracted IDs
        const recommendedFiles: FileInfo[] = []
        for (const id of fileIds) {
          const file = files.find((f) => f.id === id)
          if (file) {
            recommendedFiles.push(file)
          }
        }

        // Sort by recency (assuming the most recent files are more relevant)
        recommendedFiles.sort((a, b) => {
          const aDate = new Date(a.lastModified)
          const bDate = new Date(b.lastModified)
          return bDate.getTime() - aDate.getTime()
        })

        setRecommendations(recommendedFiles.slice(0, 5))
      } catch (error) {
        console.error("Error loading recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [memoryStore, files])

  if (recommendations.length === 0 && !loading) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Recommended Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((file) => (
              <Button
                key={file.id}
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-1.5"
                onClick={() => setSelectedFileId(file.id)}
              >
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(file.lastModified).toLocaleDateString()}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
