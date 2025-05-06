"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsageTimeline } from "./usage-timeline"
import { UsageHeatmap } from "./usage-heatmap"
import { UsageTrends } from "./usage-trends"
import { TagUsage } from "./tag-usage"

export function MemoryInsights() {
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If not mounted yet (server-side), render a minimal version
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Memory Insights</CardTitle>
            <CardDescription>Analyze how your memory is being used and identify patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Memory Insights</CardTitle>
          <CardDescription>Analyze how your memory is being used and identify patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList className="mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="heatmap">Usage Heatmap</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="tags">Tag Usage</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <UsageTimeline />
            </TabsContent>
            <TabsContent value="heatmap">
              <UsageHeatmap />
            </TabsContent>
            <TabsContent value="trends">
              <UsageTrends />
            </TabsContent>
            <TabsContent value="tags">
              <TagUsage />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
