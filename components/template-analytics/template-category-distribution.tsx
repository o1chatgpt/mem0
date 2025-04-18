"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface TemplateCategoryDistributionProps {
  data: Array<{
    category: string
    count: number
  }>
}

export function TemplateCategoryDistribution({ data }: TemplateCategoryDistributionProps) {
  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Template usage distribution by category</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="category"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} uses`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
