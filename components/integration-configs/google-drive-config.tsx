"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface GoogleDriveConfigProps {
  config: any
  setConfig: (config: any) => void
}

export function GoogleDriveConfig({ config, setConfig }: GoogleDriveConfigProps) {
  const [folders, setFolders] = useState<string[]>(config.folders || [])
  const [newFolder, setNewFolder] = useState("")
  const [syncFrequency, setSyncFrequency] = useState(config.sync_frequency || "daily")
  const [autoSync, setAutoSync] = useState(config.auto_sync !== false)
  const [fileTypes, setFileTypes] = useState<string[]>(config.file_types || ["docs", "sheets", "slides"])

  // Update the config whenever any value changes
  useEffect(() => {
    setConfig({
      ...config,
      folders,
      sync_frequency: syncFrequency,
      auto_sync: autoSync,
      file_types: fileTypes,
    })
  }, [folders, syncFrequency, autoSync, fileTypes])

  const addFolder = () => {
    if (newFolder && !folders.includes(newFolder)) {
      setFolders([...folders, newFolder])
      setNewFolder("")
    }
  }

  const removeFolder = (folder: string) => {
    setFolders(folders.filter((f) => f !== folder))
  }

  const toggleFileType = (type: string) => {
    if (fileTypes.includes(type)) {
      setFileTypes(fileTypes.filter((t) => t !== type))
    } else {
      setFileTypes([...fileTypes, type])
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white">Sync Folders</Label>
        <div className="flex space-x-2">
          <Input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Enter folder name"
            className="bg-secondary border-gray-700 text-white"
          />
          <Button
            type="button"
            onClick={addFolder}
            variant="outline"
            className="border-gray-700 text-white hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {folders.length > 0 && (
          <div className="mt-2 space-y-2">
            {folders.map((folder) => (
              <div key={folder} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                <span className="text-gray-300">{folder}</span>
                <Button
                  type="button"
                  onClick={() => removeFolder(folder)}
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
        <Label className="text-white">Sync Frequency</Label>
        <Select value={syncFrequency} onValueChange={setSyncFrequency}>
          <SelectTrigger className="bg-secondary border-gray-700 text-white">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-gray-700 text-white">
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="manual">Manual Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
        <Label htmlFor="auto-sync" className="text-white">
          Enable automatic synchronization
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-white">File Types to Sync</Label>
        <Card className="bg-secondary border-gray-700">
          <CardContent className="pt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="docs" checked={fileTypes.includes("docs")} onCheckedChange={() => toggleFileType("docs")} />
              <Label htmlFor="docs" className="text-white">
                Google Docs
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sheets"
                checked={fileTypes.includes("sheets")}
                onCheckedChange={() => toggleFileType("sheets")}
              />
              <Label htmlFor="sheets" className="text-white">
                Google Sheets
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="slides"
                checked={fileTypes.includes("slides")}
                onCheckedChange={() => toggleFileType("slides")}
              />
              <Label htmlFor="slides" className="text-white">
                Google Slides
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="forms"
                checked={fileTypes.includes("forms")}
                onCheckedChange={() => toggleFileType("forms")}
              />
              <Label htmlFor="forms" className="text-white">
                Google Forms
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="pdfs" checked={fileTypes.includes("pdfs")} onCheckedChange={() => toggleFileType("pdfs")} />
              <Label htmlFor="pdfs" className="text-white">
                PDFs
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="images"
                checked={fileTypes.includes("images")}
                onCheckedChange={() => toggleFileType("images")}
              />
              <Label htmlFor="images" className="text-white">
                Images
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
