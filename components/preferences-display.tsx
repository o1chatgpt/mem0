"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePreferences } from "./preferences-provider"

export function PreferencesDisplay() {
  const { preferences, isLoading } = usePreferences()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remembered Preferences</CardTitle>
          <CardDescription>Loading preferences from memory...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remembered Preferences</CardTitle>
        <CardDescription>Preferences stored in Mem0 long-term memory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1 rounded-md border p-3">
                <div className="text-sm font-medium">{formatKey(key)}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Current value:</span>
                  <Badge variant={typeof value === "boolean" ? (value ? "success" : "secondary") : "outline"}>
                    {formatValue(value)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            These preferences are stored in both localStorage and Mem0 for long-term persistence across sessions and
            devices.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to format preference keys for display
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
}

// Helper function to format preference values for display
function formatValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Enabled" : "Disabled"
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}
