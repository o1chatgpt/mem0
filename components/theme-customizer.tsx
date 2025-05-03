"use client"

import { useState, useEffect } from "react"
import { Paintbrush, Plus, Trash2, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Predefined accent colors
const accentColors = [
  { name: "Blue", value: "#2563eb", hsl: "221.2 83.2% 53.3%" },
  { name: "Purple", value: "#9333ea", hsl: "269.1 79.6% 55.7%" },
  { name: "Green", value: "#16a34a", hsl: "142.1 76.2% 36.3%" },
  { name: "Orange", value: "#ea580c", hsl: "24.6 95% 53.1%" },
  { name: "Pink", value: "#db2777", hsl: "331.3 74.5% 47.8%" },
  { name: "Teal", value: "#0d9488", hsl: "174.7 83.9% 31.6%" },
  { name: "Red", value: "#dc2626", hsl: "0 84.2% 60.2%" },
  { name: "Amber", value: "#d97706", hsl: "37.7 92.1% 50.2%" },
]

// Theme preset interface
interface ThemePreset {
  id: string
  name: string
  accentColor: string
  themeMode: string
}

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accentColor, setAccentColor] = useState<string>("blue")
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [newPresetName, setNewPresetName] = useState("")
  const [activeTab, setActiveTab] = useState("accent")

  // After mounting, we can safely access localStorage
  useEffect(() => {
    setMounted(true)
    const savedAccentColor = localStorage.getItem("accentColor") || "blue"
    setAccentColor(savedAccentColor)
    applyAccentColor(savedAccentColor)

    // Load saved presets
    try {
      const savedPresets = localStorage.getItem("themePresets")
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets))
      }
    } catch (error) {
      console.error("Error loading theme presets:", error)
    }
  }, [])

  // Apply the selected accent color to CSS variables
  const applyAccentColor = (colorName: string) => {
    const color = accentColors.find((c) => c.name.toLowerCase() === colorName.toLowerCase())
    if (!color) return

    document.documentElement.style.setProperty("--primary", color.hsl)
    document.documentElement.style.setProperty("--ring", color.hsl)
  }

  // Save and apply the selected accent color
  const handleAccentChange = (colorName: string) => {
    setAccentColor(colorName)
    localStorage.setItem("accentColor", colorName)
    applyAccentColor(colorName)
  }

  // Save current theme as a preset
  const savePreset = () => {
    if (!newPresetName.trim()) return

    const newPreset: ThemePreset = {
      id: Date.now().toString(),
      name: newPresetName,
      accentColor,
      themeMode: theme || "system",
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)

    try {
      localStorage.setItem("themePresets", JSON.stringify(updatedPresets))
    } catch (error) {
      console.error("Error saving theme presets:", error)
    }

    setNewPresetName("")
    setActiveTab("presets")
  }

  // Apply a saved preset
  const applyPreset = (preset: ThemePreset) => {
    setAccentColor(preset.accentColor)
    localStorage.setItem("accentColor", preset.accentColor)
    applyAccentColor(preset.accentColor)

    setTheme(preset.themeMode)
  }

  // Delete a preset
  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter((preset) => preset.id !== id)
    setPresets(updatedPresets)

    try {
      localStorage.setItem("themePresets", JSON.stringify(updatedPresets))
    } catch (error) {
      console.error("Error saving updated theme presets:", error)
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Paintbrush className="h-4 w-4" />
                <span className="sr-only">Customize theme</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Customize theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>Personalize your interface with custom colors and theme preferences.</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accent">Accent Color</TabsTrigger>
            <TabsTrigger value="theme">Theme Mode</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>
          <TabsContent value="accent" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select an accent color</Label>
              <div className="grid grid-cols-4 gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleAccentChange(color.name.toLowerCase())}
                    className={`h-10 rounded-md transition-all ${
                      accentColor === color.name.toLowerCase()
                        ? "ring-2 ring-offset-2 ring-offset-background ring-ring"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Set accent color to ${color.name}`}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="theme" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Choose theme mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="justify-start"
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="justify-start"
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="justify-start"
                >
                  System
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="presets" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Save current theme as preset</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={savePreset} disabled={!newPresetName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {presets.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Saved presets</Label>
                <div className="space-y-2">
                  {presets.map((preset) => {
                    const colorObj = accentColors.find((c) => c.name.toLowerCase() === preset.accentColor.toLowerCase())

                    return (
                      <div key={preset.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: colorObj?.value || "#2563eb" }}
                          />
                          <div>
                            <p className="font-medium">{preset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {colorObj?.name || "Blue"} ·{" "}
                              {preset.themeMode.charAt(0).toUpperCase() + preset.themeMode.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => applyPreset(preset)} className="h-8">
                            <Check className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePreset(preset.id)}
                            className="h-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
