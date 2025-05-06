"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FileText, Code, FileJson, FileType } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function NewFileTabs({ onClose }: { onClose: () => void }) {
  const { fileService, currentPath, refreshFiles, setSelectedFileId } = useAppContext()
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState("markdown")
  const [fileContent, setFileContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFile = async () => {
    if (!fileName.trim()) return

    setLoading(true)
    setError(null)

    try {
      const newFilePath = `${currentPath}/${fileName}`.replace(/\/+/g, "/")
      const newFileId = await fileService.createFile(newFilePath, fileContent)
      await refreshFiles()

      setSelectedFileId(newFileId as string)
      onClose()
    } catch (err) {
      console.error("Error creating file:", err)
      setError("Failed to create file. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    if (["html", "htm"].includes(extension)) return <Code className="h-4 w-4 text-orange-500" />
    if (["css"].includes(extension)) return <Code className="h-4 w-4 text-blue-500" />
    if (["js"].includes(extension)) return <Code className="h-4 w-4 text-yellow-500" />
    if (["jsx"].includes(extension)) return <Code className="h-4 w-4 text-cyan-500" />
    if (["md", "markdown"].includes(extension)) return <FileText className="h-4 w-4 text-purple-500" />
    if (["json"].includes(extension)) return <FileJson className="h-4 w-4 text-green-500" />
    return <FileType className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New File</DialogTitle>
        <DialogDescription>Enter a name and content for your new file.</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="file-name">File Name</Label>
        <div className="flex items-center space-x-2">
          {fileName && getFileIcon(fileName)}
          <Input
            id="file-name"
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>File Type</Label>
        <Tabs defaultValue="markdown" className="w-full">
          <TabsList>
            <TabsTrigger value="markdown" onClick={() => setFileType("markdown")}>
              Markdown
            </TabsTrigger>
            <TabsTrigger value="html" onClick={() => setFileType("html")}>
              HTML
            </TabsTrigger>
            <TabsTrigger value="css" onClick={() => setFileType("css")}>
              CSS
            </TabsTrigger>
            <TabsTrigger value="javascript" onClick={() => setFileType("javascript")}>
              JavaScript
            </TabsTrigger>
          </TabsList>
          <TabsContent value="markdown">
            <Textarea
              placeholder="Start writing markdown here..."
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="min-h-[150px]"
            />
          </TabsContent>
          <TabsContent value="html">
            <Textarea
              placeholder="<!DOCTYPE html>..."
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="min-h-[150px]"
            />
          </TabsContent>
          <TabsContent value="css">
            <Textarea
              placeholder="body { ... }"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="min-h-[150px]"
            />
          </TabsContent>
          <TabsContent value="javascript">
            <Textarea
              placeholder="// JavaScript code"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="min-h-[150px]"
            />
          </TabsContent>
        </Tabs>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateFile} disabled={!fileName.trim() || loading}>
          {loading ? "Creating..." : "Create File"}
        </Button>
      </DialogFooter>
    </div>
  )
}
