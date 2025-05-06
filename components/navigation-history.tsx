"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, FileText, Folder, Search, Trash2 } from "lucide-react"

// Mock data for navigation history
const mockHistory = [
  {
    id: "1",
    type: "file",
    name: "project-proposal.docx",
    path: "/Documents/Projects/",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    id: "2",
    type: "folder",
    name: "Images",
    path: "/Documents/",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: "3",
    type: "search",
    query: "budget 2023",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: "4",
    type: "file",
    name: "meeting-notes.md",
    path: "/Documents/Meetings/",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: "5",
    type: "folder",
    name: "Projects",
    path: "/Documents/",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
]

export function NavigationHistory() {
  const [history, setHistory] = useState(mockHistory)
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const clearHistory = () => {
    setHistory([])
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />
      case "folder":
        return <Folder className="h-4 w-4" />
      case "search":
        return <Search className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Navigation History</CardTitle>
            <CardDescription>Your recent file and folder activity</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Navigation History</CardTitle>
          <CardDescription>Your recent file and folder activity</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory} disabled={history.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No navigation history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-muted rounded-md p-2">{getIcon(item.type)}</div>
                    <div className="flex-1 space-y-1">
                      {item.type === "search" ? (
                        <div className="font-medium">
                          Searched for: <span className="font-normal">"{item.query}"</span>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.path}</div>
                        </>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                  </div>
                  {index < history.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
