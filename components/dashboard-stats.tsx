"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/db"
import { FileText, FolderOpen, Users } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    fileCount: 0,
    folderCount: 0,
    aiMemberCount: 0,
    memoryCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if Supabase environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are missing. Cannot fetch dashboard stats.")
          setLoading(false)
          return
        }

        const supabase = createClientComponentClient()

        // Fetch file count
        const { count: fileCount, error: fileError } = await supabase
          .from("fm_files")
          .select("*", { count: "exact", head: true })

        // Fetch folder count
        const { count: folderCount, error: folderError } = await supabase
          .from("fm_folders")
          .select("*", { count: "exact", head: true })

        // Fetch AI member count
        const { count: aiMemberCount, error: aiMemberError } = await supabase
          .from("fm_ai_members")
          .select("*", { count: "exact", head: true })

        // Fetch memory count
        const { count: memoryCount, error: memoryError } = await supabase
          .from("fm_memories")
          .select("*", { count: "exact", head: true })

        if (fileError || folderError || aiMemberError || memoryError) {
          console.error("Error fetching stats:", { fileError, folderError, aiMemberError, memoryError })
          setError("Failed to load dashboard statistics")
        } else {
          setStats({
            fileCount: fileCount || 0,
            folderCount: folderCount || 0,
            aiMemberCount: aiMemberCount || 0,
            memoryCount: memoryCount || 0,
          })
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      title: "Files",
      value: stats.fileCount,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Folders",
      value: stats.folderCount,
      icon: <FolderOpen className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "AI Family Members",
      value: stats.aiMemberCount,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Memories",
      value: stats.memoryCount,
      icon: <Brain className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  if (error) {
    return (
      <>
        {statItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-500">Error loading data</div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <div className="text-2xl font-bold">{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  )

  function Brain(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
        <path d="M12 15v-2" />
        <path d="M12 9v0" />
      </svg>
    )
  }
}
