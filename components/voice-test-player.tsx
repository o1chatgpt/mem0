"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Save } from "lucide-react"

interface VoiceTestPlayerProps {
  serviceId: string
  voiceId: string
  text: string
}

export function VoiceTestPlayer({ serviceId, voiceId, text }: VoiceTestPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playAudio = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real implementation, this would call your TTS API
      // For now, we'll simulate a delay and use a placeholder audio
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // This would be the URL returned from your API
      // For demo purposes, we'll use a placeholder
      const demoAudioUrl = "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3"

      setAudioUrl(demoAudioUrl)
      setIsPlaying(true)

      const audio = new Audio(demoAudioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.play()
    } catch (err) {
      setError("Failed to generate audio. Please check your API key and try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const stopAudio = () => {
    setIsPlaying(false)
    // In a real implementation, you would stop the audio playback
  }

  const saveSettings = () => {
    // In a real implementation, this would save the voice settings
    alert("Voice settings saved!")
  }

  return (
    <div>
      <div className="flex space-x-2">
        {isPlaying ? (
          <Button variant="outline" onClick={stopAudio}>
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button onClick={playAudio} disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Test Voice
              </>
            )}
          </Button>
        )}

        <Button variant="outline" onClick={saveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {audioUrl && !isPlaying && !isLoading && (
        <p className="mt-2 text-sm text-green-500">Audio generated successfully!</p>
      )}
    </div>
  )
}
