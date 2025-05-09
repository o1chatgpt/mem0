"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, FileText, Search, MessageSquare, AlertCircle, Database } from "lucide-react"
import { memoryService } from "@/lib/memory-service"
import Link from "next/link"

interface MemoryUsageProps {
  userId: number
}

export function MemoryUsage({ userId }: MemoryUsageProps) {
  const [stats, setStats] = useState({
    totalMemories: 0,
    fileOperationMemories: 0,
    searchMemories: 0,
    chatMemories: 0,
    otherMemories: 0,
  })
  const [loading, setLoading] = useState(true)
  const [memoryAvailable, setMemoryAvailable] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        // First check if memory features are available
        const isAvailable = await memoryService.isMemoryAvailable()
        setMemoryAvailable(isAvailable)

        if (!isAvailable) {
          setLoading(false)
          return
        }

        const usageStats = await memoryService.getMemoryUsageStats(userId)
        setStats(usageStats)
      } catch (error) {
        console.error("Error fetching memory usage stats:", error)
        setError("Failed to load memory stats. Please check your database connection.")
        setMemoryAvailable(false)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Link href="/api-keys" className="text-blue-500 hover:underline">
                  Check your database configuration
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <Database className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Supabase configuration is missing.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please set the SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!memoryAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Memory features require a valid OpenAI API key.</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Link href="/api-keys" className="text-blue-500 hover:underline">
                  Add an API key
                </Link>{" "}
                to enable memory features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const calculatePercentage = (value: number) => {
    if (stats.totalMemories === 0) return 0
    return Math.round((value / stats.totalMemories) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          Memory Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading memory stats...</div>
          </div>
        ) : stats.totalMemories === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No memories have been recorded yet.</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Memories</span>
                <span>{stats.totalMemories}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-blue-500" />
                  File Operations
                </span>
                <span>
                  {stats.fileOperationMemories} ({calculatePercentage(stats.fileOperationMemories)}%)
                </span>
              </div>
              <Progress value={calculatePercentage(stats.fileOperationMemories)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1 text-green-500" />
                  Chat Interactions
                </span>
                <span>
                  {stats.chatMemories} ({calculatePercentage(stats.chatMemories)}%)
                </span>
              </div>
              <Progress value={calculatePercentage(stats.chatMemories)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-1 text-purple-500" />
                  Search Operations
                </span>
                <span>
                  {stats.searchMemories} ({calculatePercentage(stats.searchMemories)}%)
                </span>
              </div>
              <Progress value={calculatePercentage(stats.searchMemories)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Other</span>
                <span>
                  {stats.otherMemories} ({calculatePercentage(stats.otherMemories)}%)
                </span>
              </div>
              <Progress value={calculatePercentage(stats.otherMemories)} className="h-2" />
            </div>

            <div className="mt-4 text-center">
              <Link href="/memory-analytics" className="text-blue-500 hover:underline text-sm">
                View detailed memory analytics
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
