"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FlaskConical, CheckCircle2 } from "lucide-react"

interface TestsListProps {
  tests: any[]
  selectedTestId: string | null
  onSelectTest: (testId: string) => void
  isLoading: boolean
}

export function TestsList({ tests, selectedTestId, onSelectTest, isLoading }: TestsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <FlaskConical className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No tests found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-2">
      {tests.map((test) => (
        <Card
          key={test.id}
          className={cn("cursor-pointer transition-colors hover:bg-muted/50", selectedTestId === test.id && "bg-muted")}
          onClick={() => onSelectTest(test.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm truncate max-w-[180px]">{test.name}</h4>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{test.templateName}</p>
              </div>
              <Badge variant={test.status === "active" ? "default" : "outline"}>
                {test.status === "active" ? (
                  <FlaskConical className="mr-1 h-3 w-3" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                )}
                {test.status === "active" ? "Active" : "Completed"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
