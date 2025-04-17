"use client"

import { useState, useEffect } from "react"
import { Memory } from "@/lib/mem0-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-context"

interface MemoryEntry {
  memory: string
  timestamp: string
}

export function CollaborationHistory() {
  const { user } = useSupabase()
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchMemories = async () => {
      try {
        setIsLoading(true)
        const memory = new Memory()

        // Search for collaboration-related memories
        const result = await memory.search({
          query: "collaboration session",
          user_id: user.id,
          limit: 10,
        })

        if (result && result.results) {
          const formattedMemories = result.results.map((item) => ({
            memory: item.memory,
            timestamp: new Date(item.timestamp).toLocaleString(),
          }))

          setMemories(formattedMemories)
        }
      } catch (error) {
        console.error("Error fetching collaboration memories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemories()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading collaboration history...</p>
        ) : memories.length > 0 ? (
          <ul className="space-y-2">
            {memories.map((entry, index) => (
              <li key={index} className="border-b pb-2">
                <p className="text-sm">{entry.memory}</p>
                <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No collaboration history found</p>
        )}
      </CardContent>
    </Card>
  )
}
