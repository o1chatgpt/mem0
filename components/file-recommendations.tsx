"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, File, Clock, Repeat, Tag, Link } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileRecommendation } from "@/lib/recommendation-engine"

export function FileRecommendations() {
  const { recommendationEngine, files, selectedFileId, setSelectedFileId, setCurrentPath } = useAppContext()

  const [recommendations, setRecommendations] = useState<FileRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        const recs = await recommendationEngine.getRecommendations(selectedFileId, files)
        setRecommendations(recs)
      } catch (error) {
        console.error("Error loading recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [recommendationEngine, selectedFileId, files])

  const handleSelectFile = async (fileId: string) => {
    // Record that these files were accessed together
    if (selectedFileId) {
      await recommendationEngine.recordFileRelationship(selectedFileId, fileId)
    }

    // Record this file access
    const file = files.find((f) => f.id === fileId)
    if (file) {
      await recommendationEngine.recordFileAccess(fileId, file.name)

      // If it's a directory, navigate to it
      if (file.type === "directory") {
        setCurrentPath(file.path)
      } else {
        // Otherwise select it
        setSelectedFileId(fileId)
      }
    }
  }

  // Get icon based on recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "recent":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "frequent":
        return <Repeat className="h-4 w-4 text-green-500" />
      case "related":
        return <Link className="h-4 w-4 text-purple-500" />
      case "similar":
        return <Tag className="h-4 w-4 text-orange-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Recommended Files
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto h-[calc(100%-60px)]">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recommendations yet</p>
            <p className="text-xs mt-1">Recommendations will appear as you use the file manager</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <Button
                key={rec.fileId}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-3"
                onClick={() => handleSelectFile(rec.fileId)}
              >
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">{getRecommendationIcon(rec.type)}</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{rec.fileName}</div>
                    <div className="text-xs text-muted-foreground truncate">{rec.reason}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
