"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, FolderIcon, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface FileSuggestion {
  id: string
  name: string
  path: string
  type: string
  reason: string
  confidence: number
  tags?: string[]
}

export function IntelligentFileSuggestions() {
  const { memoryStore, fileService, navigateToFolder, selectFile } = useAppContext()
  const [suggestions, setSuggestions] = useState<FileSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSuggestions() {
      try {
        setLoading(true)

        // Get user activity from mem0
        const recentActivity = await memoryStore.getRecentActivity(10)

        // Get file access patterns
        const accessPatterns = await memoryStore.getFileAccessPatterns()

        // Get current context (time of day, day of week, etc.)
        const currentContext = {
          hour: new Date().getHours(),
          day: new Date().getDay(),
          date: new Date().toISOString().split("T")[0],
        }

        // Use mem0 to generate intelligent suggestions
        const suggestedFiles = await memoryStore.getSuggestedFiles({
          recentActivity,
          accessPatterns,
          currentContext,
        })

        // Transform to our format
        const formattedSuggestions = suggestedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          path: file.path,
          type: file.type,
          reason: file.reason || "Based on your activity",
          confidence: file.confidence || 0.7,
          tags: file.tags || [],
        }))

        setSuggestions(formattedSuggestions)
      } catch (err) {
        console.error("Error loading intelligent suggestions:", err)
        setError("Failed to load suggestions")
      } finally {
        setLoading(false)
      }
    }

    loadSuggestions()

    // Refresh suggestions every 5 minutes
    const interval = setInterval(loadSuggestions, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [memoryStore])

  const handleSelectFile = async (suggestion: FileSuggestion) => {
    try {
      // Record this selection in mem0 to improve future suggestions
      await memoryStore.recordFileAccess(suggestion.id, "suggestion_click")

      // Extract folder path
      const folderPath = suggestion.path.split("/").slice(0, -1).join("/")

      // Navigate to the folder containing the file
      await navigateToFolder(folderPath)

      // Select the file
      await selectFile(suggestion.id)
    } catch (err) {
      console.error("Error selecting suggested file:", err)
    }
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            Intelligent Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setError(null)
              setLoading(true)
              memoryStore
                .getSuggestedFiles({})
                .then((files) => {
                  setSuggestions(
                    files.map((file) => ({
                      id: file.id,
                      name: file.name,
                      path: file.path,
                      type: file.type,
                      reason: file.reason || "Based on your activity",
                      confidence: file.confidence || 0.7,
                      tags: file.tags || [],
                    })),
                  )
                  setLoading(false)
                })
                .catch((err) => {
                  console.error("Error retrying suggestions:", err)
                  setError("Failed to load suggestions")
                  setLoading(false)
                })
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            Intelligent Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded mr-2" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            Intelligent Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No suggestions available yet. As you work with files, we'll learn your patterns and provide relevant
            suggestions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Brain className="h-4 w-4 mr-2 text-primary" />
          Intelligent Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.slice(0, 5).map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-start p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
              onClick={() => handleSelectFile(suggestion)}
            >
              <div className="mr-3 mt-0.5">
                {suggestion.type === "folder" ? (
                  <FolderIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{suggestion.name}</p>
                <p className="text-xs text-muted-foreground truncate">{suggestion.path}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs mr-2">
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                  <span className="text-xs text-muted-foreground">{suggestion.reason}</span>
                </div>
                {suggestion.tags && suggestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {suggestion.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{suggestion.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
