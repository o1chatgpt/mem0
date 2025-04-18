"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ArrowUpDown, BarChart } from "lucide-react"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TemplateUsageTableProps {
  data: {
    dailyUsage: Array<{
      date: Date
      templates: Array<{
        name: string
        count: number
      }>
    }>
    templateUsage: Array<{
      name: string
      count: number
      category: string
    }>
  }
}

export function TemplateUsageTable({ data }: TemplateUsageTableProps) {
  const [sortField, setSortField] = useState<"name" | "count" | "category">("count")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Sort the template usage data
  const sortedTemplateUsage = [...data.templateUsage].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (sortField === "category") {
      return sortDirection === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
    } else {
      return sortDirection === "asc" ? a.count - b.count : b.count - a.count
    }
  })

  // Toggle sort direction and field
  const toggleSort = (field: "name" | "count" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Prepare data for the selected template chart
  const prepareChartData = () => {
    if (!selectedTemplate) return []

    return data.dailyUsage.map((day) => ({
      date: day.date.toLocaleDateString(),
      usage: day.templates.find((t) => t.name === selectedTemplate)?.count || 0,
    }))
  }

  const chartData = prepareChartData()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Template Usage Details</CardTitle>
          <CardDescription>Detailed usage statistics for each template</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  <Button variant="ghost" onClick={() => toggleSort("name")} className="p-0 h-auto font-medium">
                    Template Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("category")} className="p-0 h-auto font-medium">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => toggleSort("count")} className="p-0 h-auto font-medium">
                    Usage Count
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTemplateUsage.map((template) => (
                <TableRow key={template.name} className={selectedTemplate === template.name ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{template.count.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open menu</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedTemplate(template.name)}>
                          <BarChart className="mr-2 h-4 w-4" />
                          View Usage Trend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Trend: {selectedTemplate}</CardTitle>
            <CardDescription>Daily usage count over the selected time period</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                usage: {
                  label: "Usage Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.split("/").slice(0, 2).join("/")} />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="usage" stroke="var(--color-usage)" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
