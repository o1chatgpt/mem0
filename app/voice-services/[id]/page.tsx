import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { VoiceTestPlayer } from "@/components/voice-test-player"
import { ApiKeyForm } from "@/components/api-key-form"

export default function VoiceServiceConfigPage({ params }: { params: { id: string } }) {
  const { id } = params

  // Validate the service ID
  const validServices = ["openai", "elevenlabs", "hume"]
  if (!validServices.includes(id)) {
    notFound()
  }

  // Service-specific information
  const serviceInfo = {
    openai: {
      name: "OpenAI TTS",
      description: "OpenAI's text-to-speech API provides high-quality voice synthesis.",
      apiKeyPlaceholder: "sk-...",
      voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      defaultVoice: "alloy",
      apiKeyName: "OPENAI_API_KEY",
    },
    elevenlabs: {
      name: "ElevenLabs",
      description: "ElevenLabs provides ultra-realistic and versatile AI speech software.",
      apiKeyPlaceholder: "your-elevenlabs-api-key",
      voices: ["Rachel", "Domi", "Bella", "Antoni", "Thomas", "Charlie"],
      defaultVoice: "Rachel",
      apiKeyName: "ELEVENLABS_API_KEY",
    },
    hume: {
      name: "HUME AI",
      description: "HUME AI provides emotionally expressive voice synthesis.",
      apiKeyPlaceholder: "your-hume-api-key",
      voices: ["Calm", "Cheerful", "Excited", "Friendly", "Sad", "Serious"],
      defaultVoice: "Friendly",
      apiKeyName: "HUME_API_KEY",
    },
  }

  const service = serviceInfo[id as keyof typeof serviceInfo]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/voice-services" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{service.name} Configuration</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyForm
                serviceId={id}
                serviceName={service.name}
                apiKeyPlaceholder={service.apiKeyPlaceholder}
                voices={service.voices}
                defaultVoice={service.defaultVoice}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Test Voice</CardTitle>
              <CardDescription>Try out the voice service with your configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testVoice">Voice</Label>
                <select id="testVoice" className="w-full p-2 border rounded-md" defaultValue={service.defaultVoice}>
                  {service.voices.map((voice) => (
                    <option key={voice} value={voice}>
                      {voice}
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
                />
              </div>

              <VoiceTestPlayer
                serviceId={id}
                voiceId={service.defaultVoice}
                text="Hello, I'm an AI assistant. How can I help you today?"
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Adjust advanced voice parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speed">Speed</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Slow</span>
                  <Input id="speed" type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" />
                  <span className="text-sm">Fast</span>
                </div>
              </div>

              {id === "elevenlabs" && (
                <div className="space-y-2">
                  <Label htmlFor="stability">Stability</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Variable</span>
                    <Input id="stability" type="range" min="0" max="1" step="0.1" defaultValue="0.5" />
                    <span className="text-sm">Stable</span>
                  </div>
                </div>
              )}

              {id === "elevenlabs" && (
                <div className="space-y-2">
                  <Label htmlFor="clarity">Clarity + Similarity</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Low</span>
                    <Input id="clarity" type="range" min="0" max="1" step="0.1" defaultValue="0.75" />
                    <span className="text-sm">High</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
