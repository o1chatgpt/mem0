"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface GenericConfigProps {
  config: any
  setConfig: (config: any) => void
  integration: any
}

export function GenericConfig({ config, setConfig, integration }: GenericConfigProps) {
  const [configEntries, setConfigEntries] = useState<Array<{ key: string; value: string }>>(
    Object.entries(config)
      .filter(([key]) => !["access_token", "refresh_token", "expires_at", "provider_user_data"].includes(key))
      .map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      })),
  )
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // Update the config whenever entries change
  useEffect(() => {
    const newConfig = { ...config }

    // Remove old entries that aren't protected
    Object.keys(newConfig).forEach((key) => {
      if (!["access_token", "refresh_token", "expires_at", "provider_user_data"].includes(key)) {
        delete newConfig[key]
      }
    })

    // Add current entries
    configEntries.forEach(({ key, value }) => {
      try {
        // Try to parse as JSON if it looks like an object or array
        if ((value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"))) {
          newConfig[key] = JSON.parse(value)
        } else {
          newConfig[key] = value
        }
      } catch (e) {
        newConfig[key] = value
      }
    })

    setConfig(newConfig)
  }, [configEntries])

  const addConfigEntry = () => {
    if (newKey && !configEntries.some((entry) => entry.key === newKey)) {
      setConfigEntries([...configEntries, { key: newKey, value: newValue }])
      setNewKey("")
      setNewValue("")
    }
  }

  const removeConfigEntry = (keyToRemove: string) => {
    setConfigEntries(configEntries.filter((entry) => entry.key !== keyToRemove))
  }

  const updateEntryValue = (key: string, value: string) => {
    setConfigEntries(configEntries.map((entry) => (entry.key === key ? { ...entry, value } : entry)))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white">Configuration Settings</Label>
        <p className="text-gray-400 text-sm">
          Customize the settings for your {integration.integrations?.name} integration.
        </p>
      </div>

      {configEntries.length > 0 && (
        <div className="space-y-4">
          {configEntries.map(({ key, value }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`config-${key}`} className="text-white capitalize">
                {key.replace(/_/g, " ")}
              </Label>
              {value.length > 50 ? (
                <Textarea
                  id={`config-${key}`}
                  value={value}
                  onChange={(e) => updateEntryValue(key, e.target.value)}
                  className="bg-secondary border-gray-700 text-white"
                />
              ) : (
                <div className="flex space-x-2">
                  <Input
                    id={`config-${key}`}
                    value={value}
                    onChange={(e) => updateEntryValue(key, e.target.value)}
                    className="bg-secondary border-gray-700 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => removeConfigEntry(key)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Card className="bg-secondary border-gray-700">
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium text-white mb-4">Add New Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-key" className="text-gray-300">
                Setting Name
              </Label>
              <Input
                id="new-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g., api_endpoint"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-value" className="text-gray-300">
                Setting Value
              </Label>
              <Input
                id="new-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., https://api.example.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              type="button"
              onClick={addConfigEntry}
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-800"
              disabled={!newKey}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
