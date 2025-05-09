"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, AlertCircle, Database } from "lucide-react"
import Link from "next/link"

interface RecentMemoriesProps {
  userId: number
}

export function RecentMemories({ userId }: RecentMemoriesProps) {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if Supabase environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are missing. Cannot fetch recent memories.")
          setLoading(false)
          return
        }

        // In a real implementation, this would call an API endpoint
        // For now, we'll simulate some data
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock data for demonstration
        const mockMemories = [
          {
            id: 1,
            content: "Created file: 'Project Proposal.docx'",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "File Operations",
          },
          {
            id: 2,
            content: "Searched for 'quarterly report' and found 5 results",
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            category: "Search",
          },
          {
            id: 3,
            content: "Viewed file: 'Financial Summary.xlsx'",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            category: "File Operations",
          },
          {
            id: 4,
            content: "Created folder: 'Project Documentation'",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            category: "File Operations",
          },
          {
            id: 5,
            content: "Chat with AI Assistant about project timeline",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            category: "Chat",
          },
        ]

        setMemories(mockMemories)
      } catch (err) {
        console.error("Error fetching recent memories:", err)
        setError("Failed to load recent memories")
      } finally {
        setLoading(false)
      }
    }

    fetchMemories()
  }, [userId])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)

    if (diffSecs < 60) return `${diffSecs} seconds ago`
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "yesterday"
    return `${diffDays} days ago`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "File Operations":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Search":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "Chat":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Recent Memories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <Database className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Supabase configuration is missing.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please set the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Recent Memories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          Recent Memories
        </CardTitle>
        <Link href="/memories">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading memories...</div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No memories have been recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <div key={memory.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm">{memory.content}</p>
                  <Badge className={getCategoryColor(memory.category)}>{memory.category}</Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatTimeAgo(memory.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
