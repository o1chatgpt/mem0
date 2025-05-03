"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useDemoMode } from "@/lib/demo-mode-context"
import { PermissionGuard } from "@/components/permission-guard"
import { Permission } from "@/lib/permissions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"

export default function DemoSettingsPage() {
  const { isDemoMode, toggleDemoMode, currentDemoRole } = useDemoMode()
  const enableDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true"

  return (
    <PermissionGuard
      permission={Permission.MANAGE_SYSTEM}
      fallback={<div className="p-4">You do not have permission to view this page.</div>}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Demo Mode Settings</h1>

        {!enableDemoMode && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Demo Mode Disabled</AlertTitle>
            <AlertDescription>
              Demo mode is currently disabled in the environment configuration. Set NEXT_PUBLIC_ENABLE_DEMO_MODE to
              "true" to enable it.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Demo Mode Configuration</CardTitle>
            <CardDescription>Configure demo mode settings for the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Enable Demo Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Allow users to access the application with predefined demo roles
                </p>
              </div>
              <Switch
                id="demo-mode-switch"
                checked={isDemoMode}
                onCheckedChange={toggleDemoMode}
                disabled={!enableDemoMode}
              />
            </div>

            {isDemoMode && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription>
                  Demo mode is currently active. {currentDemoRole && `Current role: ${currentDemoRole}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">About Demo Mode</h3>
              <p className="text-sm text-muted-foreground">
                Demo mode provides predefined user roles for demonstration purposes. When enabled, users can log in with
                different roles to explore the application's features with various permission levels.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  )
}
