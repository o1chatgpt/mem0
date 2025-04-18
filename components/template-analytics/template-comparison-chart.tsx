"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"

interface TemplateComparisonChartProps {
  data: {
    templates: Array<{
      name: string
      score: number
      responseTime: number
      userSatisfaction: number
      memoryUtilization: number
    }>
    metrics: string[]
  }
}

export function TemplateComparisonChart({ data }: TemplateComparisonChartProps) {
  // Prepare data for radar chart
  const prepareRadarData = () => {
    // Normalize response time (lower is better)
    const maxResponseTime = Math.max(...data.templates.map((t) => t.responseTime))

    return data.templates.map((template) => ({
      name: template.name,
      Effectiveness: template.score,
      "Response Time": 100 - (template.responseTime / maxResponseTime) * 100, // Invert so higher is better
      "User Satisfaction": template.userSatisfaction,
      "Memory Utilization": template.memoryUtilization,
    }))
  }

  const radarData = prepareRadarData()

  // Colors for the radar chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#a4de6c", "#d0ed57"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Comparison</CardTitle>
        <CardDescription>Compare templates across multiple effectiveness metrics</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="name"
                tickFormatter={(value) => (value.length > 10 ? `${value.substring(0, 10)}...` : value)}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />

              {data.metrics.map((metric, index) => (
                <Radar
                  key={metric}
                  name={metric}
                  dataKey={metric}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}

              <Legend />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
