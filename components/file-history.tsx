"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, FileText, FolderOpen, Download, Upload, Share2, Trash2, Edit } from "lucide-react"

interface FileHistoryProps {
  userId?: string
  fileId?: string
  limit?: number
}

interface FileEvent {
  id: string
  action: "upload" | "download" | "delete" | "rename" | "move" | "share" | "edit" | "create_folder"
  fileName: string
  filePath?: string
  timestamp: string
  details?: string
  user?: string
}

export function FileHistory({ userId = "default_user", fileId, limit = 10 }: FileHistoryProps) {
  const [events, setEvents] = useState<FileEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFileHistory() {
      setIsLoading(true)
      try {
        // In a real implementation, this would fetch from Mem0 API or database
        // For now, we'll use mock data
        const mockEvents: FileEvent[] = [
          {
            id: "1",
            action: "upload",
            fileName: "quarterly-report-q2.pdf",
            filePath: "/Documents/Reports/",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user: "current_user",
          },
          {
            id: "2",
            action: "create_folder",
            fileName: "Project X",
            filePath: "/Documents/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            user: "current_user",
          },
          {
            id: "3",
            action: "share",
            fileName: "budget-2023.xlsx",
            filePath: "/Documents/Finance/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            details: "Shared with finance@example.com",
            user: "current_user",
          },
          {
            id: "4",
            action: "edit",
            fileName: "meeting-notes.docx",
            filePath: "/Documents/Meetings/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            user: "current_user",
          },
          {
            id: "5",
            action: "download",
            fileName: "presentation.pptx",
            filePath: "/Documents/Presentations/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            user: "current_user",
          },
          {
            id: "6",
            action: "delete",
            fileName: "old-draft.txt",
            filePath: "/Documents/Drafts/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            user: "current_user",
          },
          {
            id: "7",
            action: "move",
            fileName: "contract.pdf",
            filePath: "/Documents/Legal/",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
            details: "Moved from /Documents/ to /Documents/Legal/",
            user: "current_user",
          },
        ]

        // Filter by fileId if provided
        const filteredEvents = fileId
          ? mockEvents.filter((event) => event.fileName === fileId || event.filePath?.includes(fileId))
          : mockEvents

        // Limit the number of events
        const limitedEvents = filteredEvents.slice(0, limit)

        setEvents(limitedEvents)
      } catch (error) {
        console.error("Error fetching file history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileHistory()
  }, [userId, fileId, limit])

  // Get icon for file action
  const getActionIcon = (action: string) => {
    switch (action) {
      case "upload":
        return <Upload className="h-4 w-4" />
      case "download":
        return <Download className="h-4 w-4" />
      case "delete":
        return <Trash2 className="h-4 w-4" />
      case "rename":
      case "edit":
        return <Edit className="h-4 w-4" />
      case "move":
        return <FileText className="h-4 w-4" />
      case "share":
        return <Share2 className="h-4 w-4" />
      case "create_folder":
        return <FolderOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get badge for file action
  const getActionBadge = (action: string) => {
    switch (action) {
      case "upload":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            Upload
          </Badge>
        )
      case "download":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            Download
          </Badge>
        )
      case "delete":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
            Delete
          </Badge>
        )
      case "rename":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Rename
          </Badge>
        )
      case "move":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
            Move
          </Badge>
        )
      case "share":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
            Share
          </Badge>
        )
      case "edit":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
            Edit
          </Badge>
        )
      case "create_folder":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">
            New Folder
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffMs = now.getTime() - eventTime.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minutes ago`
    if (diffHour < 24) return `${diffHour} hours ago`
    if (diffDay < 30) return `${diffDay} days ago`

    return eventTime.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>File History</CardTitle>
        <CardDescription>Recent file operations {fileId ? `for ${fileId}` : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">Loading file history...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">No file history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1">{getActionIcon(event.action)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.fileName}</p>
                      {getActionBadge(event.action)}
                    </div>
                    {event.filePath && <p className="text-sm text-muted-foreground">{event.filePath}</p>}
                    {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatRelativeTime(event.timestamp)}
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
