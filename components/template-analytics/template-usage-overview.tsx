"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, FileText, Zap, Award } from "lucide-react"

interface TemplateUsageOverviewProps {
  data: {
    totalUsage: number
    avgEffectiveness: number
    totalTemplates: number
    topTemplate: string
    usageCounts: Array<{ name: string; count: number }>
  }
}

export function TemplateUsageOverview({ data }: TemplateUsageOverviewProps) {
  // Find the most used template
  const mostUsedTemplate = data.usageCounts.reduce((prev, current) => (prev.count > current.count ? prev : current), {
    name: "",
    count: 0,
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsage.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total template uses across all categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. Effectiveness</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.avgEffectiveness.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Average effectiveness score across templates</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalTemplates}</div>
          <p className="text-xs text-muted-foreground">Number of templates with usage data</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Most Used Template</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={mostUsedTemplate.name}>
            {mostUsedTemplate.name}
          </div>
          <p className="text-xs text-muted-foreground">{mostUsedTemplate.count.toLocaleString()} uses</p>
        </CardContent>
      </Card>
    </div>
  )
}
