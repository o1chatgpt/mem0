"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Mic, Save, ArrowLeft } from "lucide-react"

interface AIFamilyMember {
  id: string
  name: string
  specialty: string
  personality: string
  knowledgeAreas: string
  communicationStyle: string
  avatar?: string
}

interface VoiceService {
  id: string
  name: string
  voices: string[]
}

interface EditAIFamilyMemberProps {
  aiFamilyMember?: AIFamilyMember
  voiceServices: VoiceService[]
  defaultVoiceService?: string
  defaultVoice?: string
}

export function EditAIFamilyMember({
  aiFamilyMember,
  voiceServices,
  defaultVoiceService,
  defaultVoice,
}: EditAIFamilyMemberProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [name, setName] = useState(aiFamilyMember?.name || "")
  const [specialty, setSpecialty] = useState(aiFamilyMember?.specialty || "")
  const [personality, setPersonality] = useState(aiFamilyMember?.personality || "")
  const [knowledgeAreas, setKnowledgeAreas] = useState(aiFamilyMember?.knowledgeAreas || "")
  const [communicationStyle, setCommunicationStyle] = useState(aiFamilyMember?.communicationStyle || "")
  const [avatar, setAvatar] = useState(aiFamilyMember?.avatar || "")

  // Voice settings
  const [selectedVoiceService, setSelectedVoiceService] = useState(defaultVoiceService || voiceServices[0]?.id || "")
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice || "")

  // Update available voices when voice service changes
  useEffect(() => {
    const service = voiceServices.find((s) => s.id === selectedVoiceService)
    if (service && service.voices.length > 0 && !service.voices.includes(selectedVoice)) {
      setSelectedVoice(service.voices[0])
    }
  }, [selectedVoiceService, voiceServices, selectedVoice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !specialty) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would call your API to save the AI family member
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: aiFamilyMember ? "AI family member updated" : "AI family member created",
        description: `${name} has been ${aiFamilyMember ? "updated" : "created"} successfully.`,
      })

      router.push("/ai-family")
    } catch (error) {
      toast({
        title: `Failed to ${aiFamilyMember ? "update" : "create"} AI family member`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mr-4"
            onClick={() => router.push("/ai-family")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {aiFamilyMember ? `Edit ${aiFamilyMember.name}` : "Create New AI Family Member"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Basic information about this AI family member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex, Sophia, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty *</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g., Web Development, Creative Writing, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality</Label>
              <Textarea
                id="personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Describe the personality traits of this AI family member"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledgeAreas">Knowledge Areas</Label>
              <Textarea
                id="knowledgeAreas"
                value={knowledgeAreas}
                onChange={(e) => setKnowledgeAreas(e.target.value)}
                placeholder="List the areas of expertise for this AI family member"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communicationStyle">Communication Style</Label>
              <Textarea
                id="communicationStyle"
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value)}
                placeholder="Describe how this AI family member communicates"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="URL to an avatar image"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>Configure the voice for this AI family member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="h-5 w-5 text-blue-500" />
              <div className="text-sm text-gray-500">
                Select a default voice service and voice for this AI family member
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voiceService">Voice Service</Label>
              <Select value={selectedVoiceService} onValueChange={setSelectedVoiceService}>
                <SelectTrigger id="voiceService">
                  <SelectValue placeholder="Select voice service" />
                </SelectTrigger>
                <SelectContent>
                  {voiceServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceServices
                    .find((s) => s.id === selectedVoiceService)
                    ?.voices.map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 text-sm text-gray-500">
              Additional voice settings can be configured after creating the AI family member.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          variant="outline"
          className="mr-2"
          onClick={() => router.push("/ai-family")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {aiFamilyMember ? "Update" : "Create"} AI Family Member
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
