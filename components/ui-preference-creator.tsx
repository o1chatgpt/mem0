"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { addMemoryWithEmbedding } from "@/services/vector-store"
import { Palette, Layout, Type, Layers, Check, ArrowRight } from "lucide-react"

export function UiPreferenceCreator({ aiFamily = "mem0" }: { aiFamily?: string }) {
  const [activeTab, setActiveTab] = useState("colors")
  const [colorScheme, setColorScheme] = useState("dark")
  const [accentColor, setAccentColor] = useState("blue")
  const [fontPreference, setFontPreference] = useState("sans")
  const [fontSizePreference, setFontSizePreference] = useState(16)
  const [densityPreference, setDensityPreference] = useState("comfortable")
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [borderPreference, setBorderPreference] = useState("subtle")
  const [cornerPreference, setCornerPreference] = useState("rounded")
  const [isLoading, setIsLoading] = useState(false)
  const [savedPreferences, setSavedPreferences] = useState<string[]>([])
  const { toast } = useToast()

  // Track completion status for each tab
  const [completedTabs, setCompletedTabs] = useState({
    colors: false,
    typography: false,
    layout: false,
    elements: false,
  })

  // Mark current tab as completed when moving to next tab
  const handleTabChange = (value: string) => {
    setCompletedTabs({
      ...completedTabs,
      [activeTab]: true,
    })
    setActiveTab(value)
  }

  // Move to next tab
  const handleNextTab = () => {
    const tabs = ["colors", "typography", "layout", "elements"]
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setCompletedTabs({
        ...completedTabs,
        [activeTab]: true,
      })
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  async function savePreferences() {
    setIsLoading(true)
    try {
      // Create memories for each preference
      const memories = [
        `[preference] I prefer ${colorScheme} mode interfaces.`,
        `[preference] I prefer ${accentColor} as an accent color in interfaces.`,
        `[preference] I prefer ${fontPreference}-serif fonts.`,
        `[preference] I prefer font size around ${fontSizePreference}px.`,
        `[preference] I prefer ${densityPreference} layouts with ${densityPreference === "compact" ? "less" : "more"} white space.`,
        `[preference] I ${animationsEnabled ? "like" : "dislike"} interface animations.`,
        `[preference] I prefer ${borderPreference} borders in interfaces.`,
        `[preference] I prefer ${cornerPreference} corners for UI elements.`,
      ]

      // Save each memory
      for (const memory of memories) {
        await addMemoryWithEmbedding({
          ai_family_member_id: aiFamily,
          user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
          memory,
        })
      }

      // Update saved preferences
      setSavedPreferences(memories)

      toast({
        title: "Success",
        description: "UI preferences saved successfully",
      })
    } catch (error) {
      console.error("Error saving UI preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save UI preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          UI Preference Creator
        </CardTitle>
        <CardDescription>Create a set of UI preferences for Mem0 to remember</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="colors" className="flex items-center gap-1">
              {completedTabs.colors && <Check className="h-3 w-3" />}
              <Palette className="h-3 w-3" />
              <span>Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-1">
              {completedTabs.typography && <Check className="h-3 w-3" />}
              <Type className="h-3 w-3" />
              <span>Typography</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              {completedTabs.layout && <Check className="h-3 w-3" />}
              <Layout className="h-3 w-3" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex items-center gap-1">
              {completedTabs.elements && <Check className="h-3 w-3" />}
              <Layers className="h-3 w-3" />
              <span>Elements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Color Scheme Preference</h3>
              <RadioGroup value={colorScheme} onValueChange={setColorScheme} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System Preference</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Accent Color Preference</h3>
              <div className="grid grid-cols-4 gap-2">
                {["blue", "green", "purple", "red", "orange", "teal", "pink", "gray"].map((color) => (
                  <Button
                    key={color}
                    variant={accentColor === color ? "default" : "outline"}
                    className={`h-10 capitalize ${accentColor === color ? "ring-2 ring-offset-2" : ""}`}
                    style={{
                      backgroundColor: accentColor === color ? `var(--${color}-600, ${color})` : "",
                      color: accentColor === color ? "white" : "",
                    }}
                    onClick={() => setAccentColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleNextTab} className="w-full mt-4">
              Next: Typography <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Font Family Preference</h3>
              <RadioGroup value={fontPreference} onValueChange={setFontPreference} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans" id="sans" />
                  <Label htmlFor="sans" className="font-sans">
                    Sans-serif
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="serif" />
                  <Label htmlFor="serif" className="font-serif">
                    Serif
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mono" id="mono" />
                  <Label htmlFor="mono" className="font-mono">
                    Monospace
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Font Size Preference: {fontSizePreference}px</h3>
              <Slider
                value={[fontSizePreference]}
                min={12}
                max={24}
                step={1}
                onValueChange={(value) => setFontSizePreference(value[0])}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Small (12px)</span>
                <span>Medium (16px)</span>
                <span>Large (24px)</span>
              </div>
            </div>

            <Button onClick={handleNextTab} className="w-full mt-4">
              Next: Layout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Layout Density</h3>
              <RadioGroup value={densityPreference} onValueChange={setDensityPreference} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact">Compact</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="spacious" />
                  <Label htmlFor="spacious">Spacious</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className={`border rounded-md p-2 ${densityPreference === "compact" ? "ring-2 ring-primary" : ""}`}>
                <div className="h-4 w-full bg-muted rounded mb-1"></div>
                <div className="h-4 w-full bg-muted rounded mb-1"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
              </div>
              <div
                className={`border rounded-md p-4 ${densityPreference === "comfortable" ? "ring-2 ring-primary" : ""}`}
              >
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
              </div>
              <div className={`border rounded-md p-6 ${densityPreference === "spacious" ? "ring-2 ring-primary" : ""}`}>
                <div className="h-4 w-full bg-muted rounded mb-4"></div>
                <div className="h-4 w-full bg-muted rounded mb-4"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
              </div>
            </div>

            <Button onClick={handleNextTab} className="w-full mt-4">
              Next: Elements <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Interface Animations</Label>
                <p className="text-sm text-muted-foreground">Enable subtle animations for interface elements</p>
              </div>
              <Switch id="animations" checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Border Style Preference</h3>
              <RadioGroup value={borderPreference} onValueChange={setBorderPreference} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">No Borders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtle" id="subtle" />
                  <Label htmlFor="subtle">Subtle Borders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prominent" id="prominent" />
                  <Label htmlFor="prominent">Prominent Borders</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Corner Style Preference</h3>
              <RadioGroup value={cornerPreference} onValueChange={setCornerPreference} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="square" id="square" />
                  <Label htmlFor="square">Square Corners</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rounded" id="rounded" />
                  <Label htmlFor="rounded">Rounded Corners</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pill" id="pill" />
                  <Label htmlFor="pill">Pill Shapes</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div
                className={`border ${borderPreference === "none" ? "border-transparent" : borderPreference === "subtle" ? "border-gray-200" : "border-gray-400"} ${cornerPreference === "square" ? "rounded-none" : cornerPreference === "rounded" ? "rounded-md" : "rounded-full"} p-4 flex items-center justify-center ${cornerPreference === "pill" ? "px-6" : ""}`}
              >
                Button
              </div>
              <div
                className={`border ${borderPreference === "none" ? "border-transparent" : borderPreference === "subtle" ? "border-gray-200" : "border-gray-400"} ${cornerPreference === "square" ? "rounded-none" : cornerPreference === "rounded" ? "rounded-md" : "rounded-full"} p-4 flex items-center justify-center ${cornerPreference === "pill" ? "px-6" : ""}`}
              >
                Button
              </div>
              <div
                className={`border ${borderPreference === "none" ? "border-transparent" : borderPreference === "subtle" ? "border-gray-200" : "border-gray-400"} ${cornerPreference === "square" ? "rounded-none" : cornerPreference === "rounded" ? "rounded-md" : "rounded-full"} p-4 flex items-center justify-center ${cornerPreference === "pill" ? "px-6" : ""}`}
              >
                Button
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {savedPreferences.length > 0 && (
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Saved Preferences</h3>
            <ul className="space-y-1 text-sm">
              {savedPreferences.map((pref, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>{pref.replace("[preference] ", "")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} disabled={isLoading} className="w-full">
          {isLoading ? "Saving Preferences..." : "Save All UI Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}
