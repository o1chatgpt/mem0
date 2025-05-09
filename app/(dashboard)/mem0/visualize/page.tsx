"use client"

import { useState, useEffect } from "react"
import { useMem0 } from "@/components/mem0-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import MemoryRelationshipGraph from "@/components/memory-relationship-graph"
import MemoryUsageStats from "@/components/memory-usage-stats"
import MemoryTimelineView from "@/components/memory-timeline-view"
import MemoryTagCloud from "@/components/memory-tag-cloud"

export default function MemoryVisualizationDashboard() {
  const { isConnected, memories, isLoading, error } = useMem0()
  const [isClientLoaded, setIsClientLoaded] = useState(false)

  useEffect(() => {
    setIsClientLoaded(true)
  }, [])

  if (!isClientLoaded) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load memory data: {error.message || "Unknown error"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Memory Visualization Dashboard</h1>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <Tabs defaultValue="graph" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="graph">Relationship Graph</TabsTrigger>
            <TabsTrigger value="stats">Usage Statistics</TabsTrigger>
            <TabsTrigger value="timeline">Memory Timeline</TabsTrigger>
            <TabsTrigger value="tags">Tag Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Relationship Graph</CardTitle>
                <CardDescription>Visualize how your memories are connected to each other</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[600px] w-full border rounded-md">
                  <MemoryRelationshipGraph memories={memories} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Statistics</CardTitle>
                <CardDescription>Analyze your memory usage patterns and storage metrics</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <MemoryUsageStats memories={memories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Timeline</CardTitle>
                <CardDescription>View your memories across time</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <MemoryTimelineView memories={memories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Tag Analysis</CardTitle>
                <CardDescription>Explore the distribution of tags across your memories</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <MemoryTagCloud memories={memories} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
