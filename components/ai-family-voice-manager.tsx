"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Save, Plus, Trash2, Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIFamilyMember {
  id: string
  name: string
  specialty: string
  avatar?: string
}

interface VoiceService {
  id: string
  name: string
  isActive: boolean
  voices: string[]
}

interface VoiceAssignment {
  id?: string
  aiFamilyMemberId: string
  voiceServiceId: string
  voiceId: string
  settings: {
    speed: number
    pitch?: number
    stability?: number
    clarity?: number
    emotion?: string
  }
  isDefault: boolean
}

interface AIFamilyVoiceManagerProps {
  aiFamilyMember: AIFamilyMember
  voiceServices: VoiceService[]
  initialAssignments?: VoiceAssignment[]
  defaultAssignmentId?: string
}

export function AIFamilyVoiceManager({
  aiFamilyMember,
  voiceServices,
  initialAssignments = [],
  defaultAssignmentId,
}: AIFamilyVoiceManagerProps) {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<VoiceAssignment[]>(initialAssignments)
  const [activeTab, setActiveTab] = useState<string>(defaultAssignmentId || assignments[0]?.id || "new")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Find the active assignment
  const activeAssignment = activeTab === "new" ? null : assignments.find((a) => a.id === activeTab)

  // Get available voice services
  const activeVoiceServices = voiceServices.filter((s) => s.isActive)

  // Handle creating a new assignment
  const handleCreateAssignment = () => {
    // Create a default new assignment
    const defaultService = activeVoiceServices[0]
    if (!defaultService) {
      toast({
        title: "No active voice services",
        description: "Please configure at least one voice service first.",
        variant: "destructive",
      })
      return
    }

    const newAssignment: VoiceAssignment = {
      aiFamilyMemberId: aiFamilyMember.id,
      voiceServiceId: defaultService.id,
      voiceId: defaultService.voices[0],
      settings: {
        speed: 1.0,
      },
      isDefault: assignments.length === 0,
    }

    setAssignments([...assignments, newAssignment])
    setActiveTab("new")
  }

  // Handle saving an assignment
  const handleSaveAssignment = async () => {
    if (activeTab === "new") {
      // TODO: Implement API call to save the new assignment
      setIsSaving(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newAssignment = assignments[assignments.length - 1]
        const newId = `assignment-${Date.now()}`

        // Update the assignments with the new ID
        const updatedAssignments = assignments.map((a, index) =>
          index === assignments.length - 1 ? { ...a, id: newId } : a,
        )

        setAssignments(updatedAssignments)
        setActiveTab(newId)

        toast({
          title: "Voice assignment created",
          description: `Voice assignment for ${aiFamilyMember.name} has been created.`,
        })
      } catch (error) {
        toast({
          title: "Failed to create voice assignment",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      // TODO: Implement API call to update the existing assignment
      setIsSaving(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Voice assignment updated",
          description: `Voice assignment for ${aiFamilyMember.name} has been updated.`,
        })
      } catch (error) {
        toast({
          title: "Failed to update voice assignment",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Handle deleting an assignment
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!assignmentId) return

    // TODO: Implement API call to delete the assignment
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove the assignment from the list
      const updatedAssignments = assignments.filter((a) => a.id !== assignmentId)
      setAssignments(updatedAssignments)

      // If we deleted the active tab, switch to another one
      if (activeTab === assignmentId) {
        setActiveTab(updatedAssignments[0]?.id || "new")
      }

      toast({
        title: "Voice assignment deleted",
        description: `Voice assignment for ${aiFamilyMember.name} has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Failed to delete voice assignment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle updating an assignment field
  const handleUpdateAssignment = (field: string, value: any) => {
    if (activeTab === "new") {
      // Update the last assignment in the list (the new one)
      const updatedAssignments = [...assignments]
      const index = updatedAssignments.length - 1

      if (field.startsWith("settings.")) {
        const settingField = field.split(".")[1]
        updatedAssignments[index] = {
          ...updatedAssignments[index],
          settings: {
            ...updatedAssignments[index].settings,
            [settingField]: value,
          },
        }
      } else {
        updatedAssignments[index] = {
          ...updatedAssignments[index],
          [field]: value,
        }
      }

      setAssignments(updatedAssignments)
    } else {
      // Update the existing assignment
      const updatedAssignments = assignments.map((a) => {
        if (a.id !== activeTab) return a

        if (field.startsWith("settings.")) {
          const settingField = field.split(".")[1]
          return {
            ...a,
            settings: {
              ...a.settings,
              [settingField]: value,
            },
          }
        }

        return {
          ...a,
          [field]: value,
        }
      })

      setAssignments(updatedAssignments)
    }
  }

  // Handle setting an assignment as default
  const handleSetDefault = (assignmentId: string) => {
    const updatedAssignments = assignments.map((a) => ({
      ...a,
      isDefault: a.id === assignmentId || (activeTab === "new" && !a.id),
    }))

    setAssignments(updatedAssignments)
  }

  // Handle playing a test voice
  const handlePlayTest = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)

    // Simulate playing audio
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  // Get the current service for the active assignment
  const getCurrentService = () => {
    if (activeTab === "new") {
      const newAssignment = assignments[assignments.length - 1]
      return voiceServices.find((s) => s.id === newAssignment?.voiceServiceId)
    }

    const assignment = assignments.find((a) => a.id === activeTab)
    return voiceServices.find((s) => s.id === assignment?.voiceServiceId)
  }

  const currentService = getCurrentService()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Configuration for {aiFamilyMember.name}</span>
          <Button variant="outline" size="sm" onClick={handleCreateAssignment}>
            <Plus className="h-4 w-4 mr-1" />
            Add Voice
          </Button>
        </CardTitle>
        <CardDescription>Configure and manage voice settings for this AI family member</CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No voice assignments yet</p>
            <Button className="mt-4" onClick={handleCreateAssignment}>
              <Plus className="h-4 w-4 mr-1" />
              Add Voice Assignment
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {assignments.map((assignment) => (
                <TabsTrigger key={assignment.id || "new"} value={assignment.id || "new"} className="relative">
                  {voiceServices.find((s) => s.id === assignment.voiceServiceId)?.name || "New Voice"}
                  {assignment.isDefault && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {assignments.map((assignment) => (
              <TabsContent key={assignment.id || "new"} value={assignment.id || "new"}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voiceService">Voice Service</Label>
                      <Select
                        value={assignment.voiceServiceId}
                        onValueChange={(value) => handleUpdateAssignment("voiceServiceId", value)}
                      >
                        <SelectTrigger id="voiceService">
                          <SelectValue placeholder="Select voice service" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeVoiceServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="voiceId">Voice</Label>
                      <Select
                        value={assignment.voiceId}
                        onValueChange={(value) => handleUpdateAssignment("voiceId", value)}
                      >
                        <SelectTrigger id="voiceId">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentService?.voices.map((voice) => (
                            <SelectItem key={voice} value={voice}>
                              {voice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speed">Speed</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Slow</span>
                      <Input
                        id="speed"
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={assignment.settings.speed}
                        onChange={(e) => handleUpdateAssignment("settings.speed", Number.parseFloat(e.target.value))}
                      />
                      <span className="text-sm">Fast</span>
                      <span className="text-sm font-mono ml-2 w-10 text-center">
                        {assignment.settings.speed.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {currentService?.id === "elevenlabs" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="stability">Stability</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Variable</span>
                          <Input
                            id="stability"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={assignment.settings.stability || 0.5}
                            onChange={(e) =>
                              handleUpdateAssignment("settings.stability", Number.parseFloat(e.target.value))
                            }
                          />
                          <span className="text-sm">Stable</span>
                          <span className="text-sm font-mono ml-2 w-10 text-center">
                            {(assignment.settings.stability || 0.5).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clarity">Clarity</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Low</span>
                          <Input
                            id="clarity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={assignment.settings.clarity || 0.75}
                            onChange={(e) =>
                              handleUpdateAssignment("settings.clarity", Number.parseFloat(e.target.value))
                            }
                          />
                          <span className="text-sm">High</span>
                          <span className="text-sm font-mono ml-2 w-10 text-center">
                            {(assignment.settings.clarity || 0.75).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="isDefault"
                      checked={assignment.isDefault}
                      onCheckedChange={() => handleSetDefault(assignment.id || "new")}
                    />
                    <Label htmlFor="isDefault">Set as default voice for {aiFamilyMember.name}</Label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteAssignment(assignment.id || "")}
                      disabled={!assignment.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handlePlayTest} disabled={isSaving}>
                        {isPlaying ? <Square className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {isPlaying ? "Stop" : "Test Voice"}
                      </Button>

                      <Button onClick={handleSaveAssignment} disabled={isSaving}>
                        {isSaving ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
