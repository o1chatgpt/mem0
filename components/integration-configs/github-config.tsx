"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GithubConfigProps {
  config: any
  setConfig: (config: any) => void
}

export function GithubConfig({ config, setConfig }: GithubConfigProps) {
  const [repositories, setRepositories] = useState<string[]>(config.repositories || [])
  const [newRepo, setNewRepo] = useState("")
  const [notifyOnPR, setNotifyOnPR] = useState(config.notify_on_pr !== false)
  const [notifyOnIssue, setNotifyOnIssue] = useState(config.notify_on_issue !== false)
  const [notifyOnMention, setNotifyOnMention] = useState(config.notify_on_mention !== false)
  const [defaultBranch, setDefaultBranch] = useState(config.default_branch || "main")
  const [autoMerge, setAutoMerge] = useState(config.auto_merge === true)

  // Update the config whenever any value changes
  useEffect(() => {
    setConfig({
      ...config,
      repositories,
      notify_on_pr: notifyOnPR,
      notify_on_issue: notifyOnIssue,
      notify_on_mention: notifyOnMention,
      default_branch: defaultBranch,
      auto_merge: autoMerge,
    })
  }, [repositories, notifyOnPR, notifyOnIssue, notifyOnMention, defaultBranch, autoMerge])

  const addRepository = () => {
    if (newRepo && !repositories.includes(newRepo)) {
      setRepositories([...repositories, newRepo])
      setNewRepo("")
    }
  }

  const removeRepository = (repo: string) => {
    setRepositories(repositories.filter((r) => r !== repo))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white">Repositories</Label>
        <div className="flex space-x-2">
          <Input
            value={newRepo}
            onChange={(e) => setNewRepo(e.target.value)}
            placeholder="username/repository"
            className="bg-secondary border-gray-700 text-white"
          />
          <Button
            type="button"
            onClick={addRepository}
            variant="outline"
            className="border-gray-700 text-white hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {repositories.length > 0 && (
          <div className="mt-2 space-y-2">
            {repositories.map((repo) => (
              <div key={repo} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                <span className="text-gray-300">{repo}</span>
                <Button
                  type="button"
                  onClick={() => removeRepository(repo)}
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

      <div className="space-y-2">
        <Label htmlFor="default-branch" className="text-white">
          Default Branch
        </Label>
        <Select value={defaultBranch} onValueChange={setDefaultBranch}>
          <SelectTrigger id="default-branch" className="bg-secondary border-gray-700 text-white">
            <SelectValue placeholder="Select default branch" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-gray-700 text-white">
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="master">master</SelectItem>
            <SelectItem value="develop">develop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-secondary border-gray-700">
        <CardContent className="pt-4 space-y-4">
          <h3 className="text-sm font-medium text-white">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-pr" className="text-gray-300">
                Notify on pull requests
              </Label>
              <Switch id="notify-pr" checked={notifyOnPR} onCheckedChange={setNotifyOnPR} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-issue" className="text-gray-300">
                Notify on issues
              </Label>
              <Switch id="notify-issue" checked={notifyOnIssue} onCheckedChange={setNotifyOnIssue} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-mention" className="text-gray-300">
                Notify on mentions
              </Label>
              <Switch id="notify-mention" checked={notifyOnMention} onCheckedChange={setNotifyOnMention} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox id="auto-merge" checked={autoMerge} onCheckedChange={setAutoMerge} />
        <Label htmlFor="auto-merge" className="text-white">
          Enable auto-merge for pull requests with passing checks
        </Label>
      </div>
    </div>
  )
}
