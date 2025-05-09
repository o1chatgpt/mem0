"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Memory } from "@/lib/mem0"

interface MemoryUsageStatsProps {
  memories: Memory[]
}

interface TypeDistribution {
  name: string
  value: number
  color: string
}

interface SizeDistribution {
  name: string
  count: number
}

interface TimeDistribution {
  name: string
  count: number
}

export default function MemoryUsageStats({ memories }: MemoryUsageStatsProps) {
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [sizeDistribution, setSizeDistribution] = useState<SizeDistribution[]>([])
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [avgSize, setAvgSize] = useState(0)

  useEffect(() => {
    if (!memories || memories.length === 0) return

    // Process memory type distribution
    const typeCount: Record<string, number> = {}
    memories.forEach((memory) => {
      const type = memory.type || "unknown"
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    const typeColors: Record<string, string> = {
      episodic: "#ff6b6b",
      semantic: "#48dbfb",
      procedural: "#1dd1a1",
      unknown: "#c8d6e5",
    }

    const typeData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
      color: typeColors[name] || "#c8d6e5",
    }))

    setTypeDistribution(typeData)

    // Process memory size distribution
    const sizes = memories.map((memory) => memory.content.length)
    const total = sizes.reduce((sum, size) => sum + size, 0)
    const average = total / sizes.length

    setTotalSize(total)
    setAvgSize(Math.round(average))

    // Group by size ranges
    const sizeRanges = [
      { min: 0, max: 100, name: "0-100 chars" },
      { min: 101, max: 500, name: "101-500 chars" },
      { min: 501, max: 1000, name: "501-1000 chars" },
      { min: 1001, max: 5000, name: "1001-5000 chars" },
      { min: 5001, max: Number.POSITIVE_INFINITY, name: "5000+ chars" },
    ]

    const sizeGroups: Record<string, number> = {}
    sizeRanges.forEach((range) => {
      sizeGroups[range.name] = 0
    })

    memories.forEach((memory) => {
      const size = memory.content.length
      const range = sizeRanges.find((r) => size >= r.min && size <= r.max)
      if (range) {
        sizeGroups[range.name] = (sizeGroups[range.name] || 0) + 1
      }
    })

    const sizeData = Object.entries(sizeGroups).map(([name, count]) => ({
      name,
      count,
    }))

    setSizeDistribution(sizeData)

    // Process memory creation time distribution
    const now = new Date()
    const timeRanges = [
      { days: 1, name: "Today" },
      { days: 7, name: "Last 7 days" },
      { days: 30, name: "Last 30 days" },
      { days: 90, name: "Last 90 days" },
      { days: 365, name: "Last year" },
      { days: Number.POSITIVE_INFINITY, name: "Older" },
    ]

    const timeGroups: Record<string, number> = {}
    timeRanges.forEach((range) => {
      timeGroups[range.name] = 0
    })

    memories.forEach((memory) => {
      const createdAt = new Date(memory.createdAt || Date.now())
      const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      const range = timeRanges.find((r) => daysDiff < r.days)
      if (range) {
        timeGroups[range.name] = (timeGroups[range.name] || 0) + 1
      }
    })

    const timeData = Object.entries(timeGroups).map(([name, count]) => ({
      name,
      count,
    }))

    setTimeDistribution(timeData)
  }, [memories])

  if (!memories || memories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">No memory data available</p>
          <p className="text-muted-foreground">Add some memories to see usage statistics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Memories</p>
              <p className="text-3xl font-bold">{memories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Size</p>
              <p className="text-3xl font-bold">{(totalSize / 1024).toFixed(2)} KB</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Average Memory Size</p>
              <p className="text-3xl font-bold">{avgSize} chars</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed charts */}
      <Tabs defaultValue="type" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="type">Memory Types</TabsTrigger>
          <TabsTrigger value="size">Size Distribution</TabsTrigger>
          <TabsTrigger value="time">Time Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="type">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="size">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sizeDistribution}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                <Legend />
                <Bar dataKey="count" name="Number of Memories" fill="#54a0ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeDistribution}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} memories`, "Count"]} />
                <Legend />
                <Bar dataKey="count" name="Number of Memories" fill="#1dd1a1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
