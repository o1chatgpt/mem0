"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Search, Tag, RefreshCw } from "lucide-react"
import { useAppContext } from "@/lib/app-context"

interface MemoryInsight {
  id: string
  memory: string
  timestamp: number
}

export function MemoryInsights() {
  const { selectedFile, memoryStore } = useAppContext()
  const [insights, setInsights] = useState<MemoryInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [relatedFiles, setRelatedFiles] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (!selectedFile) {
      setInsights([])
      setRelatedFiles([])
      setTags([])
      return
    }

    const loadInsights = async () => {
      setLoading(true)
      try {
        // Search for memories related to this file
        const query = `file:${selectedFile.name} ${selectedFile.type} ${selectedFile.path}`
        const results = await memoryStore.searchMemories(query, 5)
        setInsights(results)

        // Get tags for this file
        const fileTags = await memoryStore.getFileTags(selectedFile.id)
        setTags(fileTags)

        // Find related files based on content similarity
        if (selectedFile.content) {
          const relatedQuery = selectedFile.content.substring(0, 200)
          const relatedResults = await memoryStore.searchMemories(relatedQuery, 3)

          // Extract file names from memories
          const fileNames = relatedResults
            .map((result) => {
              const match = result.memory.match(/file:(.*?)( |$)/)
              return match ? match[1] : null
            })
            .filter(Boolean) as string[]

          setRelatedFiles(fileNames)
        }
      } catch (error) {
        console.error("Error loading memory insights:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [selectedFile, memoryStore])

  if (!selectedFile) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Memory Insights
        </CardTitle>
        <CardDescription>AI-powered insights about this file based on your interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {insights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Interactions
                </h3>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className="text-sm bg-muted/50 p-2 rounded-md">
                      {insight.memory}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(insight.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Related Files
                </h3>
                <div className="space-y-1">
                  {relatedFiles.map((fileName, index) => (
                    <Button key={index} variant="ghost" size="sm" className="w-full justify-start">
                      {fileName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {insights.length === 0 && relatedFiles.length === 0 && tags.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No insights available yet. Interact with this file more to generate insights.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
