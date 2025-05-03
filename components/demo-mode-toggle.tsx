"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDemoMode } from "@/lib/demo-mode-context"
import { Badge } from "@/components/ui/badge"

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode()
  const enableDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true"

  if (!enableDemoMode) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="demo-mode" checked={isDemoMode} onCheckedChange={toggleDemoMode} />
      <Label htmlFor="demo-mode">Demo Mode</Label>
      {isDemoMode && (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Active
        </Badge>
      )}
    </div>
  )
}
