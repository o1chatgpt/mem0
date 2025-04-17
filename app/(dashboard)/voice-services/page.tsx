"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

// Voice services from the database
const VOICE_SERVICES = [
  {
    id: "openai",
    name: "OpenAI TTS",
    isActive: true,
    isDefault: true,
    voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    isActive: true,
    isDefault: false,
    voices: ["Rachel", "Domi", "Bella", "Antoni", "Elli", "Josh", "Arnold", "Adam", "Sam"],
  },
  {
    id: "hume",
    name: "HUME AI",
    isActive: false,
    isDefault: false,
    voices: ["Calm", "Cheerful", "Excited", "Friendly", "Unfriendly", "Sad", "Serious"],
  },
]

export default function VoiceServicesPage() {
  const [isPending, setIsPending] = useState(false)
  const [voiceServices, setVoiceServices] = useState(VOICE_SERVICES)

  const handleToggleService = (serviceId: string) => {
    setVoiceServices((prev) =>
      prev.map((service) => (service.id === serviceId ? { ...service, isActive: !service.isActive } : service)),
    )
  }

  const handleSetDefault = (serviceId: string) => {
    setVoiceServices((prev) =>
      prev.map((service) => ({
        ...service,
        isDefault: service.id === serviceId,
      })),
    )
  }

  const handleSaveChanges = () => {
    setIsPending(true)
    setTimeout(() => {
      toast({
        title: "Voice services updated",
        description: "Your voice service settings have been saved.",
      })
      setIsPending(false)
    }, 1000)
  }

  const handleTestVoice = (serviceName: string, voiceName: string) => {
    toast({
      title: "Testing voice",
      description: `Playing test audio with ${serviceName} using ${voiceName} voice.`,
    })
    // In a real app, you would play a test audio here
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Voice Services</h1>
      <p className="mb-8 text-lg text-muted-foreground">Configure voice services for your AI family members.</p>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="services">Voice Services</TabsTrigger>
          <TabsTrigger value="assignments">Voice Assignments</TabsTrigger>
        </TabsList>

        {/* Voice Services Tab */}
        <TabsContent value="services">
          <div className="grid gap-6">
            {voiceServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>Configure {service.name} settings</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`${service.id}-active`} className="text-sm">
                        Active
                      </Label>
                      <Switch
                        id={`${service.id}-active`}
                        checked={service.isActive}
                        onCheckedChange={() => handleToggleService(service.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${service.id}-default`} className="text-sm">
                      Set as Default
                    </Label>
                    <Switch
                      id={`${service.id}-default`}
                      checked={service.isDefault}
                      onCheckedChange={() => handleSetDefault(service.id)}
                      disabled={!service.isActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${service.id}-api-key`}>API Key</Label>
                    <Input
                      id={`${service.id}-api-key`}
                      type="password"
                      placeholder="Enter your API key"
                      disabled={!service.isActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Test Voice</Label>
                    <div className="flex space-x-2">
                      <Select disabled={!service.isActive}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {service.voices.map((voice) => (
                            <SelectItem key={voice} value={voice}>
                              {voice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => handleTestVoice(service.name, service.voices[0])}
                        disabled={!service.isActive}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSaveChanges} disabled={isPending} className="mt-4">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Voice Assignments Tab */}
        <TabsContent value="assignments">
          <div className="grid gap-6">
            {AI_FAMILY_MEMBERS.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Voice Service</Label>
                    <Select defaultValue="openai">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceServices
                          .filter((service) => service.isActive)
                          .map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Voice</Label>
                    <Select defaultValue={member.voice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceServices
                          .find((service) => service.id === "openai")
                          ?.voices.map((voice) => (
                            <SelectItem key={voice} value={voice}>
                              {voice}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Voice Personality</Label>
                    <Input placeholder="Describe the voice personality" defaultValue={member.personality} />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => handleTestVoice("OpenAI TTS", member.voice)}>
                      Test Voice
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => toast({ title: "Saved", description: "Voice settings saved for " + member.name })}
                  >
                    Save
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
