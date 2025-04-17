import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { VoiceTestPlayer } from "@/components/voice-test-player"

export default function VoiceTestPage() {
  // Sample AI family members
  const aiFamily = [
    { id: "stan", name: "Stan", role: "Technical Lead" },
    { id: "lyra", name: "Lyra", role: "Home Assistant" },
    { id: "sophia", name: "Sophia", role: "Creative Director" },
    { id: "max", name: "Max", role: "Education Specialist" },
  ]

  // Sample voice services
  const voiceServices = [
    { id: "openai", name: "OpenAI TTS", isDefault: true },
    { id: "elevenlabs", name: "ElevenLabs", isDefault: false },
    { id: "hume", name: "HUME AI", isDefault: false },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Voice Test</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test AI Family Voices</CardTitle>
              <CardDescription>Try out different voices for your AI family members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aiMember">AI Family Member</Label>
                <select id="aiMember" className="w-full p-2 border rounded-md">
                  {aiFamily.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceService">Voice Service</Label>
                <select id="voiceService" className="w-full p-2 border rounded-md">
                  {voiceServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} {service.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testText">Text to speak</Label>
                <Textarea
                  id="testText"
                  placeholder="Enter text to convert to speech"
                  defaultValue="Hello, I'm an AI assistant. How can I help you today?"
                  rows={4}
                />
              </div>

              <VoiceTestPlayer
                serviceId="openai"
                voiceId="alloy"
                text="Hello, I'm an AI assistant. How can I help you today?"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Voice Comparison</CardTitle>
              <CardDescription>Compare different voice services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">OpenAI TTS</h3>
                  <VoiceTestPlayer
                    serviceId="openai"
                    voiceId="alloy"
                    text="Hello, I'm an AI assistant. How can I help you today?"
                  />
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">ElevenLabs</h3>
                  <VoiceTestPlayer
                    serviceId="elevenlabs"
                    voiceId="Rachel"
                    text="Hello, I'm an AI assistant. How can I help you today?"
                  />
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">HUME AI</h3>
                  <VoiceTestPlayer
                    serviceId="hume"
                    voiceId="Friendly"
                    text="Hello, I'm an AI assistant. How can I help you today?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Save voice preferences for AI family members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                After testing different voices, you can save your preferred voice settings for each AI family member.
              </p>
              <Link href="/ai-family">
                <Button className="w-full">Manage AI Family Voices</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
