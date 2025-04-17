"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/db"
import { Brain } from "lucide-react"
import type { Memory } from "@/lib/mem0"

export function RecentMemories({ userId }: { userId: number }) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemories = async () => {
      if (!userId) return

      setLoading(true)
      const supabase = createClientComponentClient()

      const { data, error } = await supabase
        .from("fm_memories")
        .select(`
          id,
          content,
          created_at,
          ai_member_id,
          fm_ai_members(name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching memories:", error)
      } else {
        setMemories((data as any) || [])
      }

      setLoading(false)
    }

    fetchMemories()
  }, [userId])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Memories</CardTitle>
        <Brain className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-muted rounded-md" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No memories found</div>
        ) : (
          <div className="space-y-3">
            {memories.map((memory: any) => (
              <div key={memory.id} className="p-3 bg-muted rounded-md">
                <p className="text-sm">{memory.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {memory.fm_ai_members?.name ? `Remembered by ${memory.fm_ai_members.name}` : "General memory"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
