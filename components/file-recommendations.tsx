"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileIcon, FolderIcon, Clock, Star, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface FileRecommendationsProps {
  userId?: string
  limit?: number
}

interface RecommendedFile {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  reason: "recent" | "frequent" | "related" | "collaborative"
  extension?: string
  lastAccessed?: string
}

export function FileRecommendations({ userId = "default_user", limit = 5 }: FileRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true)
      try {
        // In a real implementation, this would fetch from Mem0 API
        // For now, we'll use mock data
        const mockRecommendations: RecommendedFile[] = [
          {
            id: "1",
            name: "quarterly-report-q2.pdf",
            path: "/Documents/Reports/",
            type: "file",
            reason: "recent",
            extension: "pdf",
            lastAccessed: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          },
          {
            id: "2",
            name: "Project X",
            path: "/Documents/",
            type: "folder",
            reason: "frequent",
            lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          },
          {
            id: "3",
            name: "budget-2023.xlsx",
            path: "/Documents/Finance/",
            type: "file",
            reason: "related",
            extension: "xlsx",
            lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          },
          {
            id: "4",
            name: "meeting-notes.docx",
            path: "/Documents/Meetings/",
            type: "file",
            reason: "collaborative",
            extension: "docx",
            lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          },
          {
            id: "5",
            name: "presentation.pptx",
            path: "/Documents/Presentations/",
            type: "file",
            reason: "recent",
            extension: "pptx",
            lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          },
        ]

        // Limit the number of recommendations
        const limitedRecommendations = mockRecommendations.slice(0, limit)

        setRecommendations(limitedRecommendations)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, limit])

  // Get icon for file type
  const getFileIcon = (file: RecommendedFile) => {
    if (file.type === "folder") {
      return <FolderIcon className="h-4 w-4" />
    }

    // Return appropriate icon based on file extension
    return <FileIcon className="h-4 w-4" />
  }

  // Get reason badge text
  const getReasonText = (reason: string) => {
    switch (reason) {
      case "recent":
        return "Recently accessed"
      case "frequent":
        return "Frequently used"
      case "related":
        return "Related to your work"
      case "collaborative":
        return "Collaborative project"
      default:
        return "Recommended"
    }
  }

  // Format relative time
  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return "Unknown"

    const now = new Date()
    const accessTime = new Date(timestamp)
    const diffMs = now.getTime() - accessTime.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minutes ago`
    if (diffHour < 24) return `${diffHour} hours ago`
    if (diffDay < 30) return `${diffDay} days ago`

    return accessTime.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Recommended Files
        </CardTitle>
        <CardDescription>Files and folders you might need based on your activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">Loading recommendations...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">No recommendations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((file) => (
                <div key={file.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1">{getFileIcon(file)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{file.name}</p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/files${file.path}${file.name}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{file.path}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{getReasonText(file.reason)}</span>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatRelativeTime(file.lastAccessed)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
