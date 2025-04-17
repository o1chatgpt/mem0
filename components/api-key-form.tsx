"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

interface ApiKeyFormProps {
  serviceId: string
  serviceName: string
  apiKeyPlaceholder: string
  voices: string[]
  defaultVoice: string
}

export function ApiKeyForm({ serviceId, serviceName, apiKeyPlaceholder, voices, defaultVoice }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice)
  const [isDefault, setIsDefault] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey) {
      setError("API key is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // In a real implementation, this would call your API to save the configuration
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(`${serviceName} configuration saved successfully!`)
    } catch (err) {
      setError("Failed to save configuration. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder={apiKeyPlaceholder}
          className="font-mono"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          This key will be stored securely and used for all {serviceName} voice requests.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultVoice">Default Voice</Label>
        <select
          id="defaultVoice"
          className="w-full p-2 border rounded-md"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice} value={voice}>
              {voice}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
        <Label htmlFor="isDefault">Set as default voice service</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive">Service active</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {success && <p className="text-sm text-green-500">{success}</p>}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setApiKey("")}>
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
