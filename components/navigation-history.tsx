"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, Clock, ArrowRight, RefreshCw } from "lucide-react"

interface NavigationEntry {
  path: string
  timestamp: string
  id: string
}

export function NavigationHistory() {
  const { memoryStore, setCurrentPath } = useAppContext()
  const [history, setHistory] = useState<NavigationEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNavigationHistory = async () => {
      setIsLoading(true)
      try {
        // Get all memories
        const memories = memoryStore.getMemories()

        // Filter navigation memories
        const navigationMemories = memories
          .filter((memory) => memory.text.includes("Navigated to folder:"))
          .map((memory) => {
            // Extract path from memory text
            const pathMatch = memory.text.match(/Navigated to folder: (.+)/)
            const path = pathMatch ? pathMatch[1] : "/"

            return {
              path,
              timestamp: memory.timestamp,
              id: memory.id,
            }
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setHistory(navigationMemories)
      } catch (error) {
        console.error("Error loading navigation history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNavigationHistory()
  }, [memoryStore])

  const handleNavigate = (path: string) => {
    if (setCurrentPath) {
      setCurrentPath(path)
    }
  }

  const refreshHistory = () => {
    setIsLoading(true)
    setTimeout(() => {
      const memories = memoryStore.getMemories()

      // Filter navigation memories
      const navigationMemories = memories
        .filter((memory) => memory.text.includes("Navigated to folder:"))
        .map((memory) => {
          // Extract path from memory text
          const pathMatch = memory.text.match(/Navigated to folder: (.+)/)
          const path = pathMatch ? pathMatch[1] : "/"

          return {
            path,
            timestamp: memory.timestamp,
            id: memory.id,
          }
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setHistory(navigationMemories)
      setIsLoading(false)
    }, 500)
  }

  // Group history by date
  const groupedHistory = history.reduce(
    (groups, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    },
    {} as Record<string, NavigationEntry[]>,
  )

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-base">
            <Folder className="h-4 w-4 mr-2 text-primary" />
            Navigation History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshHistory} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[calc(100%-60px)] overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Folder className="h-12 w-12 mb-2 opacity-50" />
            <p>No navigation history available</p>
            <p className="text-xs mt-1">Start navigating folders to see your history</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium sticky top-0 bg-card py-1">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-2">
                  {groupedHistory[date].map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleNavigate(entry.path)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium truncate">{entry.path}</span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
