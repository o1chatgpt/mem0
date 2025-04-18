"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TemplateEffectivenessChartProps {
  data: Array<{
    name: string
    score: number
    responseTime: number
    userSatisfaction: number
    memoryUtilization: number
  }>
}

export function TemplateEffectivenessChart({ data }: TemplateEffectivenessChartProps) {
  // Sort data by effectiveness score (descending)
  const sortedData = [...data].sort((a, b) => b.score - a.score)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Template Effectiveness</CardTitle>
        <CardDescription>Effectiveness scores for each template (higher is better)</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            score: {
              label: "Effectiveness Score",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="var(--color-score)" barSize={20} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
