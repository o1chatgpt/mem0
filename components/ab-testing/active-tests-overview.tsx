"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { FlaskConical, Calendar } from "lucide-react"

interface ActiveTestsOverviewProps {
  tests: any[]
  isLoading: boolean
}

export function ActiveTestsOverview({ tests, isLoading }: ActiveTestsOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <FlaskConical className="mr-2 h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <FlaskConical className="mr-2 h-4 w-4" />
            Active Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">No active tests</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <FlaskConical className="mr-2 h-4 w-4" />
          Active Tests Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test) => {
          // Calculate test progress
          const startDate = new Date(test.startDate)
          const endDate = new Date(test.endDate)
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
          const elapsedDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
          const progressPercent = Math.min(Math.round((elapsedDays / totalDays) * 100), 100)

          // Format dates
          const startFormatted = startDate.toLocaleDateString()
          const endFormatted = endDate.toLocaleDateString()

          return (
            <div key={test.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium truncate max-w-[200px]">{test.name}</h4>
                <span className="text-xs text-muted-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {startFormatted}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {endFormatted}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
