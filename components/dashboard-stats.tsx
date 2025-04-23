"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/db"
import { Folder, File, Users, Brain } from "lucide-react"

export function DashboardStats({ userId }: { userId: number }) {
  const [stats, setStats] = useState({
    totalFolders: 0,
    totalFiles: 0,
    totalSize: 0,
    aiMembers: 0,
    memories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const supabase = createClientComponentClient()

      // Get folder count
      const { count: folderCount } = await supabase
        .from("fm_folders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      // Get file count and total size
      const { data: files } = await supabase.from("fm_files").select("size").eq("user_id", userId)

      // Get AI members count
      const { count: aiMembersCount } = await supabase
        .from("fm_ai_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      // Get memories count
      const { count: memoriesCount } = await supabase
        .from("fm_memories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      const totalSize = files?.reduce((acc, file) => acc + file.size, 0) || 0

      setStats({
        totalFolders: folderCount || 0,
        totalFiles: files?.length || 0,
        totalSize,
        aiMembers: aiMembersCount || 0,
        memories: memoriesCount || 0,
      })

      setLoading(false)
    }

    if (userId) {
      fetchStats()
    }
  }, [userId])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
          <Folder className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFolders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          <File className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles}</div>
          <p className="text-xs text-muted-foreground">{formatBytes(stats.totalSize)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">AI Family Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.aiMembers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Memories</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.memories}</div>
        </CardContent>
      </Card>
    </div>
  )
}
