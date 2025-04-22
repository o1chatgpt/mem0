"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { addMemoryWithEmbedding } from "@/services/vector-store"
import { Smartphone, Laptop, Monitor, Check } from "lucide-react"

// Responsive design preferences by device type
const RESPONSIVE_PREFERENCES = {
  mobile: [
    "I prefer when mobile interfaces use bottom navigation for easy thumb access.",
    "I prefer when interfaces use a single-column layout on mobile devices.",
    "I prefer when touch targets are at least 44px in size on mobile.",
    "I prefer when forms stack vertically on mobile screens.",
    "I prefer when sidebar navigation converts to a hamburger menu on mobile.",
    "I prefer when font sizes are slightly larger on mobile to maintain readability.",
    "I prefer when mobile interfaces prioritize the most important content first.",
    "I prefer when interfaces detect orientation changes on mobile and adjust layouts accordingly.",
    "I prefer when mobile interfaces minimize text input requirements.",
    "I prefer when mobile interfaces use native input types (like date pickers).",
  ],
  tablet: [
    "I prefer when tablet interfaces use a hybrid navigation approach between mobile and desktop.",
    "I prefer when tablet interfaces take advantage of the larger screen with multi-column layouts.",
    "I prefer when tablet interfaces support both portrait and landscape orientations well.",
    "I prefer when tablet interfaces use popovers instead of full-screen modals.",
    "I prefer when tablet interfaces support touch gestures but also keyboard shortcuts.",
    "I prefer when tablet interfaces have slightly larger touch targets than desktop.",
    "I prefer when tablet interfaces adapt content density based on orientation.",
    "I prefer when tablet interfaces support split-screen multitasking.",
    "I prefer when tablet interfaces use responsive images optimized for tablet resolutions.",
    "I prefer when tablet interfaces support stylus input when available.",
  ],
  desktop: [
    "I prefer when desktop interfaces take full advantage of the larger screen space.",
    "I prefer when desktop interfaces support keyboard shortcuts for power users.",
    "I prefer when desktop interfaces use hover states for additional information.",
    "I prefer when desktop interfaces support multi-column layouts for better content organization.",
    "I prefer when desktop interfaces have more compact UI elements to fit more content.",
    "I prefer when desktop interfaces support drag-and-drop interactions.",
    "I prefer when desktop interfaces use fixed navigation for quick access.",
    "I prefer when desktop interfaces support multiple windows or panels.",
    "I prefer when desktop interfaces optimize for precision pointing devices.",
    "I prefer when desktop interfaces support advanced features hidden behind progressive disclosure.",
  ],
  general: [
    "I prefer interfaces that adapt well to both desktop and mobile.",
    "I prefer when tables collapse into cards on mobile screens.",
    "I prefer when images are optimized for different screen sizes.",
    "I prefer when font sizes adjust proportionally to screen size.",
    "I prefer when content maintains readability across all device sizes.",
    "I prefer when websites use a mobile-first approach to ensure good performance on all devices.",
    "I prefer when interfaces adjust spacing and padding proportionally to screen size.",
    "I prefer when interfaces detect device capabilities and offer device-specific features.",
    "I prefer when content prioritization changes between devices based on context.",
    "I prefer when interfaces support both touch and mouse input appropriately.",
  ],
}

export function ResponsivePreferencesAdder({ aiFamily = "mem0" }: { aiFamily?: string }) {
  const [activeTab, setActiveTab] = useState<"mobile" | "tablet" | "desktop" | "general">("general")
  const [isLoading, setIsLoading] = useState(false)
  const [addedPreferences, setAddedPreferences] = useState<string[]>([])
  const { toast } = useToast()

  async function addPreference(preference: string) {
    if (addedPreferences.includes(preference)) {
      toast({
        title: "Already Added",
        description: "This preference has already been added",
        variant: "default",
      })
      return
    }

    setIsLoading(true)
    try {
      // Format the memory with a category prefix
      const formattedMemory = `[ui] ${preference}`

      const success = await addMemoryWithEmbedding({
        ai_family_member_id: aiFamily,
        user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
        memory: formattedMemory,
      })

      if (success) {
        setAddedPreferences([...addedPreferences, preference])
        toast({
          title: "Success",
          description: "Responsive design preference added successfully",
        })
      } else {
        throw new Error("Failed to add preference")
      }
    } catch (error) {
      console.error("Error adding preference:", error)
      toast({
        title: "Error",
        description: "Failed to add preference",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Responsive Design Preferences
        </CardTitle>
        <CardDescription>Add responsive design preferences for different devices to Mem0's memory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === "general" ? "default" : "outline"}
            onClick={() => setActiveTab("general")}
            className="flex-1"
          >
            <Monitor className="h-4 w-4 mr-2" />
            General
          </Button>
          <Button
            variant={activeTab === "mobile" ? "default" : "outline"}
            onClick={() => setActiveTab("mobile")}
            className="flex-1"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
          <Button
            variant={activeTab === "tablet" ? "default" : "outline"}
            onClick={() => setActiveTab("tablet")}
            className="flex-1"
          >
            <Laptop className="h-4 w-4 mr-2" />
            Tablet
          </Button>
          <Button
            variant={activeTab === "desktop" ? "default" : "outline"}
            onClick={() => setActiveTab("desktop")}
            className="flex-1"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {RESPONSIVE_PREFERENCES[activeTab].map((preference, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  addedPreferences.includes(preference) ? "bg-muted border-primary" : "hover:bg-accent"
                }`}
              >
                <p className="flex-1">{preference}</p>
                {addedPreferences.includes(preference) ? (
                  <Badge variant="outline" className="ml-2 bg-primary/10">
                    <Check className="h-3 w-3 mr-1" /> Added
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => addPreference(preference)} disabled={isLoading}>
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">{addedPreferences.length} preferences added</p>
        <Button variant="outline" onClick={() => setAddedPreferences([])} disabled={addedPreferences.length === 0}>
          Reset Added Status
        </Button>
      </CardFooter>
    </Card>
  )
}
