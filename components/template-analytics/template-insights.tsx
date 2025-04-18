"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, AlertTriangle, Info } from "lucide-react"

interface TemplateInsightsProps {
  data: Array<{
    title: string
    description: string
    type: "positive" | "warning" | "info"
  }>
}

export function TemplateInsights({ data }: TemplateInsightsProps) {
  // Get icon based on insight type
  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <Lightbulb className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Get variant based on insight type
  const getVariant = (type: string): "default" | "destructive" => {
    switch (type) {
      case "warning":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Template Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((insight, index) => (
            <Alert key={index} variant={getVariant(insight.type)}>
              {getIcon(insight.type)}
              <AlertTitle>{insight.title}</AlertTitle>
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
