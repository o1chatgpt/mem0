"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { UsageTimeline } from "@/components/usage-timeline"
import { UsageHeatmap } from "@/components/usage-heatmap"
import { UsageTrends } from "@/components/usage-trends"
import { TagUsage } from "@/components/tag-usage"
import { Calendar, Clock, TrendingUp, Tag } from "lucide-react"

export function UsageVisualizations() {
  const [activeTab, setActiveTab] = useState("timeline")

  return (
    <Card className="h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b px-4 pt-2">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="timeline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex-1 p-0 overflow-auto">
          <TabsContent value="timeline" className="h-full m-0 p-0">
            <UsageTimeline />
          </TabsContent>
          <TabsContent value="heatmap" className="h-full m-0 p-0">
            <UsageHeatmap />
          </TabsContent>
          <TabsContent value="trends" className="h-full m-0 p-0">
            <UsageTrends />
          </TabsContent>
          <TabsContent value="tags" className="h-full m-0 p-0">
            <TagUsage />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
