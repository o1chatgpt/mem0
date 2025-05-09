"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, AlertCircle } from "lucide-react"
import { memoryService } from "@/lib/memory-service"

interface FileMemoriesProps {
  fileId: number
  userId: number
}

export function FileMemories({ fileId, userId }: FileMemoriesProps) {
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [memoryAvailable, setMemoryAvailable] = useState(true)

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true)

      // First check if memory features are available
      const isAvailable = await memoryService.isMemoryAvailable()
      setMemoryAvailable(isAvailable)

      if (!isAvailable) {
        setLoading(false)
        return
      }

      try {
        const fileMemories = await memoryService.getFileMemories(fileId, userId)
        setMemories(fileMemories)
      } catch (error) {
        console.error("Error fetching file memories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMemories()
  }, [fileId, userId])

  if (!memoryAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            File Memories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Memory features require a valid OpenAI API key.</p>
              <p className="text-sm text-muted-foreground mt-1">
                <a href="/api-keys" className="text-blue-500 hover:underline">
                  Add an API key
                </a>{" "}
                to enable memory features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          File Memories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading memories...</div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No memories found for this file.</div>
        ) : (
          <div className="space-y-3">
            {memories.map((memory) => (
              <div key={memory.id} className="p-3 bg-muted rounded-md">
                <p className="text-sm">{memory.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(memory.created_at).toLocaleString()}
                  </span>
                  {memory.category && (
                    <Badge variant="outline" className="text-xs">
                      {memory.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
