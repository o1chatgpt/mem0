"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Memory } from "@/lib/mem0"

interface MemoryTimelineViewProps {
  memories: Memory[]
}

interface TimelineData {
  date: string
  count: number
  cumulative: number
}

export default function MemoryTimelineView({ memories }: MemoryTimelineViewProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    if (!memories || memories.length === 0) return

    const days = Number.parseInt(timeRange, 10)
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Generate all days in the interval
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate })

    // Initialize data with zero counts
    const initialData = daysInRange.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      count: 0,
      cumulative: 0,
    }))

    // Count memories per day
    let cumulativeCount = 0
    const data = initialData.map((dayData) => {
      const dayDate = parseISO(dayData.date)
      const count = memories.filter((memory) => {
        const memoryDate = new Date(memory.createdAt || Date.now())
        return isSameDay(memoryDate, dayDate)
      }).length

      cumulativeCount += count

      return {
        ...dayData,
        count,
        cumulative: cumulativeCount,
      }
    })

    setTimelineData(data)
  }, [memories, timeRange])

  if (!memories || memories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium">No memory data available</p>
          <p className="text-muted-foreground">Add some memories to see timeline data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 180 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Daily Memory Creation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), "MMM dd")}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(parseISO(date), "MMMM dd, yyyy")}
                  formatter={(value) => [`${value} memories`, "Count"]}
                />
                <Area type="monotone" dataKey="count" stroke="#54a0ff" fill="#54a0ff" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Cumulative Memory Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), "MMM dd")}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(parseISO(date), "MMMM dd, yyyy")}
                  formatter={(value) => [`${value} memories`, "Total"]}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#1dd1a1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
