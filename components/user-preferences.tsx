"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { usePreferences } from "./preferences-provider"
import { useToast } from "@/components/ui/use-toast"

export function UserPreferences() {
  const { preferences, updatePreference, resetPreferences, isLoading } = usePreferences()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Handle preference changes
  const handleToggleChange = (key: string) => (checked: boolean) => {
    updatePreference(key, checked)
  }

  const handleSelectChange = (key: string) => (value: string) => {
    updatePreference(key, value)
  }

  const handleSliderChange = (key: string) => (value: number[]) => {
    updatePreference(key, value[0])
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      resetPreferences()
      toast({
        title: "Preferences Reset",
        description: "Your preferences have been reset to default values.",
      })
    } catch (error) {
      console.error("Error resetting preferences:", error)
      toast({
        title: "Error",
        description: "Failed to reset preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
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
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Customize your experience with these settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Appearance</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
              <span className="text-xs text-muted-foreground">Use dark theme for the application</span>
            </Label>
            <Switch id="darkMode" checked={preferences.darkMode} onCheckedChange={handleToggleChange("darkMode")} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compactView" className="flex flex-col space-y-1">
              <span>Compact View</span>
              <span className="text-xs text-muted-foreground">Show more content with less spacing</span>
            </Label>
            <Switch
              id="compactView"
              checked={preferences.compactView}
              onCheckedChange={handleToggleChange("compactView")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize" className="flex flex-col space-y-1">
              <span>Font Size: {preferences.fontSize}px</span>
              <span className="text-xs text-muted-foreground">Adjust the text size throughout the application</span>
            </Label>
            <Slider
              id="fontSize"
              min={12}
              max={24}
              step={1}
              value={[preferences.fontSize]}
              onValueChange={handleSliderChange("fontSize")}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Files & Folders</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="showHiddenFiles" className="flex flex-col space-y-1">
              <span>Show Hidden Files</span>
              <span className="text-xs text-muted-foreground">Display files that start with a dot (.)</span>
            </Label>
            <Switch
              id="showHiddenFiles"
              checked={preferences.showHiddenFiles}
              onCheckedChange={handleToggleChange("showHiddenFiles")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultView" className="flex flex-col space-y-1">
              <span>Default View</span>
              <span className="text-xs text-muted-foreground">Choose how files are displayed by default</span>
            </Label>
            <Select value={preferences.defaultView} onValueChange={handleSelectChange("defaultView")}>
              <SelectTrigger id="defaultView">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="details">Details</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Language & Region</h3>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex flex-col space-y-1">
              <span>Language</span>
              <span className="text-xs text-muted-foreground">Set your preferred language</span>
            </Label>
            <Select value={preferences.language} onValueChange={handleSelectChange("language")}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to Defaults
        </Button>
        <div className="text-sm text-muted-foreground">Preferences are saved automatically</div>
      </CardFooter>
    </Card>
  )
}
