"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Mem0ConfigProps {
  config: any
  setConfig: (config: any) => void
}

export function Mem0Config({ config, setConfig }: Mem0ConfigProps) {
  const [memorySize, setMemorySize] = useState(config.memory_size || "medium")
  const [retentionPeriod, setRetentionPeriod] = useState(config.retention_period || "6 months")
  const [contextLength, setContextLength] = useState(config.context_length || 5)
  const [enablePersonalization, setEnablePersonalization] = useState(config.enable_personalization !== false)
  const [enableCrossAppMemory, setEnableCrossAppMemory] = useState(config.enable_cross_app_memory === true)
  const [memoryPrompt, setMemoryPrompt] = useState(config.memory_prompt || "")

  // Update the config whenever any value changes
  useEffect(() => {
    setConfig({
      ...config,
      memory_size: memorySize,
      retention_period: retentionPeriod,
      context_length: contextLength,
      enable_personalization: enablePersonalization,
      enable_cross_app_memory: enableCrossAppMemory,
      memory_prompt: memoryPrompt,
    })
  }, [memorySize, retentionPeriod, contextLength, enablePersonalization, enableCrossAppMemory, memoryPrompt])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="memory-size" className="text-white">
          Memory Size
        </Label>
        <Select value={memorySize} onValueChange={setMemorySize}>
          <SelectTrigger id="memory-size" className="bg-secondary border-gray-700 text-white">
            <SelectValue placeholder="Select memory size" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-gray-700 text-white">
            <SelectItem value="small">Small (Basic memory capabilities)</SelectItem>
            <SelectItem value="medium">Medium (Standard memory capabilities)</SelectItem>
            <SelectItem value="large">Large (Enhanced memory capabilities)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="retention-period" className="text-white">
          Memory Retention Period
        </Label>
        <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
          <SelectTrigger id="retention-period" className="bg-secondary border-gray-700 text-white">
            <SelectValue placeholder="Select retention period" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-gray-700 text-white">
            <SelectItem value="1 month">1 Month</SelectItem>
            <SelectItem value="3 months">3 Months</SelectItem>
            <SelectItem value="6 months">6 Months</SelectItem>
            <SelectItem value="1 year">1 Year</SelectItem>
            <SelectItem value="forever">Forever</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="context-length" className="text-white">
            Context Length: {contextLength}
          </Label>
          <span className="text-gray-400 text-sm">{contextLength} memories</span>
        </div>
        <Slider
          id="context-length"
          min={1}
          max={10}
          step={1}
          value={[contextLength]}
          onValueChange={(value) => setContextLength(value[0])}
          className="py-4"
        />
        <p className="text-gray-400 text-xs">
          Number of memories to include in each conversation context. Higher values provide more context but may slow
          down responses.
        </p>
      </div>

      <Card className="bg-secondary border-gray-700">
        <CardContent className="pt-4 space-y-4">
          <h3 className="text-sm font-medium text-white">Memory Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-personalization" className="text-gray-300">
                Enable personalization
              </Label>
              <Switch
                id="enable-personalization"
                checked={enablePersonalization}
                onCheckedChange={setEnablePersonalization}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-cross-app" className="text-gray-300">
                Enable cross-app memory
              </Label>
              <Switch id="enable-cross-app" checked={enableCrossAppMemory} onCheckedChange={setEnableCrossAppMemory} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="memory-prompt" className="text-white">
          Custom Memory Prompt
        </Label>
        <Textarea
          id="memory-prompt"
          value={memoryPrompt}
          onChange={(e) => setMemoryPrompt(e.target.value)}
          placeholder="Enter a custom prompt to guide memory retrieval (optional)"
          className="bg-secondary border-gray-700 text-white min-h-[100px]"
        />
        <p className="text-gray-400 text-xs">
          This prompt will be used to guide how memories are retrieved and used in conversations.
        </p>
      </div>
    </div>
  )
}
