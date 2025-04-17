"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface SlackConfigProps {
  config: any
  setConfig: (config: any) => void
}

export function SlackConfig({ config, setConfig }: SlackConfigProps) {
  const [channels, setChannels] = useState<string[]>(config.channels || [])
  const [newChannel, setNewChannel] = useState("")
  const [notifyOnMention, setNotifyOnMention] = useState(config.notify_on_mention !== false)
  const [notifyOnDM, setNotifyOnDM] = useState(config.notify_on_dm !== false)
  const [notifyOnKeywords, setNotifyOnKeywords] = useState(config.notify_on_keywords === true)
  const [keywords, setKeywords] = useState<string[]>(config.keywords || [])
  const [newKeyword, setNewKeyword] = useState("")
  const [workspace, setWorkspace] = useState(config.workspace || "")

  // Update the config whenever any value changes
  useEffect(() => {
    setConfig({
      ...config,
      channels,
      notify_on_mention: notifyOnMention,
      notify_on_dm: notifyOnDM,
      notify_on_keywords: notifyOnKeywords,
      keywords,
      workspace,
    })
  }, [channels, notifyOnMention, notifyOnDM, notifyOnKeywords, keywords, workspace])

  const addChannel = () => {
    if (newChannel && !channels.includes(newChannel)) {
      setChannels([...channels, newChannel])
      setNewChannel("")
    }
  }

  const removeChannel = (channel: string) => {
    setChannels(channels.filter((c) => c !== channel))
  }

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="workspace" className="text-white">
          Workspace Name
        </Label>
        <Input
          id="workspace"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          placeholder="Enter your Slack workspace name"
          className="bg-secondary border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Monitored Channels</Label>
        <div className="flex space-x-2">
          <Input
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Enter channel name (e.g., general)"
            className="bg-secondary border-gray-700 text-white"
          />
          <Button
            type="button"
            onClick={addChannel}
            variant="outline"
            className="border-gray-700 text-white hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {channels.length > 0 && (
          <div className="mt-2 space-y-2">
            {channels.map((channel) => (
              <div key={channel} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                <span className="text-gray-300">#{channel}</span>
                <Button
                  type="button"
                  onClick={() => removeChannel(channel)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card className="bg-secondary border-gray-700">
        <CardContent className="pt-4 space-y-4">
          <h3 className="text-sm font-medium text-white">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-mention" className="text-gray-300">
                Notify on mentions
              </Label>
              <Switch id="notify-mention" checked={notifyOnMention} onCheckedChange={setNotifyOnMention} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-dm" className="text-gray-300">
                Notify on direct messages
              </Label>
              <Switch id="notify-dm" checked={notifyOnDM} onCheckedChange={setNotifyOnDM} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-keywords" className="text-gray-300">
                Notify on keywords
              </Label>
              <Switch id="notify-keywords" checked={notifyOnKeywords} onCheckedChange={setNotifyOnKeywords} />
            </div>
          </div>
        </CardContent>
      </Card>

      {notifyOnKeywords && (
        <div className="space-y-2">
          <Label className="text-white">Notification Keywords</Label>
          <div className="flex space-x-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter keyword"
              className="bg-secondary border-gray-700 text-white"
            />
            <Button
              type="button"
              onClick={addKeyword}
              variant="outline"
              className="border-gray-700 text-white hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {keywords.length > 0 && (
            <div className="mt-2 space-y-2">
              {keywords.map((keyword) => (
                <div key={keyword} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                  <span className="text-gray-300">{keyword}</span>
                  <Button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
