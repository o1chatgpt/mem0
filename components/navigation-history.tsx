"use client"

import { Card, CardContent } from "@/components/ui/card"

interface NavigationHistoryProps {
  memories?: any[]
  showUser?: boolean
}

export function NavigationHistory({ memories = [], showUser = false }: NavigationHistoryProps) {
  if (!memories || memories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">No navigation history available.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        Navigation history visualization is in development.
      </CardContent>
    </Card>
  )
}
