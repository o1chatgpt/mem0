"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  FileIcon,
  Code,
  Download,
  Star,
  Pencil,
  Save,
  X,
  Tag,
  Plus,
} from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { MemoryInsights } from "@/components/memory-insights"

export function FileViewer() {
  const { selectedFile, selectedFileId, fileService, memoryStore, refreshFiles } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [fileTags, setFileTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Load file tags when selected file changes
  useEffect(() => {
    const loadFileTags = async () => {
      if (!selectedFileId) return

      try {
        const tags = await memoryStore.getFileTags(selectedFileId)
        setFileTags(tags)
      } catch (error) {
        console.error("Error loading file tags:", error)
      }
    }

    loadFileTags()
  }, [selectedFileId, memoryStore])

  const handleDownload = async () => {
    if (!selectedFileId) return

    try {
      await fileService.downloadFile(selectedFileId)
      // Track the download action
      await memoryStore.trackFileInteraction(selectedFileId, "download")
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!selectedFileId) return

    try {
      const newFavoriteStatus = await memoryStore.toggleFavorite(selectedFileId)
      setIsFavorite(newFavoriteStatus)
      // Track the favorite action
      await memoryStore.trackFileInteraction(selectedFileId, newFavoriteStatus ? "favorite" : "unfavorite")
      await refreshFiles()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleStartEditing = () => {
    if (!selectedFile || !selectedFile.content) return

    setEditedContent(selectedFile.content)
    setIsEditing(true)

    // Track the edit action
    memoryStore.trackFileInteraction(selectedFileId, "start_editing")
  }

  const handleSaveEdits = async () => {
    if (!selectedFileId) return

    try {
      await fileService.updateFile(selectedFileId, { content: editedContent })
      setIsEditing(false)
      // Track the save action
      await memoryStore.trackFileInteraction(
        selectedFileId,
        "save_edits",
        `Content length: ${editedContent.length} characters`,
      )
      await refreshFiles()
    } catch (error) {
      console.error("Error saving edits:", error)
    }
  }

  const handleCancelEdits = () => {
    setIsEditing(false)
  }

  const handleAddTag = async () => {
    if (!selectedFileId || !newTag) return

    try {
      await memoryStore.rememberTag(selectedFileId, newTag)
      const tags = await memoryStore.getFileTags(selectedFileId)
      setFileTags(tags)
      // Track the tag action
      await memoryStore.trackFileInteraction(selectedFileId, "add_tag", `Tag: ${newTag}`)
      setNewTag("")
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }

  if (!selectedFileId || !selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No file selected</h3>
          <p className="mt-2 text-sm text-gray-500">Select a file from the explorer to view its contents</p>
        </div>
      </div>
    )
  }

  const getFileIcon = () => {
    switch (selectedFile.type) {
      case "text":
        return <FileText className="h-6 w-6 text-gray-300" />
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-400" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-400" />
      case "presentation":
        return <FileIcon className="h-6 w-6 text-orange-400" />
      case "code":
        return <Code className="h-6 w-6 text-purple-400" />
      case "pdf":
        return <FileIcon className="h-6 w-6 text-red-400" />
      case "video":
        return <FileIcon className="h-6 w-6 text-pink-400" />
      case "audio":
        return <FileIcon className="h-6 w-6 text-yellow-400" />
      case "markdown":
        return <FileText className="h-6 w-6 text-teal-400" />
      default:
        return <FileText className="h-6 w-6 text-gray-300" />
    }
  }

  const renderFileContent = () => {
    if (isEditing) {
      return (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[300px] font-mono bg-gray-800 text-gray-200 border-gray-700"
        />
      )
    }

    if (selectedFile.type === "image" && selectedFile.url) {
      return (
        <div className="flex justify-center">
          <Image
            src={selectedFile.url || "/placeholder.svg"}
            alt={selectedFile.name}
            width={500}
            height={300}
            className="max-w-full object-contain"
          />
        </div>
      )
    }

    if (selectedFile.type === "video" && selectedFile.url) {
      return (
        <div className="flex justify-center">
          <video controls className="max-w-full">
            <source src={selectedFile.url} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (selectedFile.type === "audio" && selectedFile.url) {
      return (
        <div className="flex justify-center">
          <audio controls className="w-full">
            <source src={selectedFile.url} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    if (selectedFile.type === "markdown" && selectedFile.content) {
      // Simple markdown rendering
      const html = selectedFile.content
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gm, "<em>$1</em>")
        .replace(/\n/gm, "<br>")
        .replace(
          /- \[(x| )\] (.*$)/gm,
          (match, checked, text) =>
            `<div><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled /> ${text}</div>`,
        )
        .replace(/- (.*$)/gm, "<li>$1</li>")

      return <div className="prose prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: html }} />
    }

    return (
      <pre className={`${selectedFile.type === "code" ? "text-sm" : ""} text-gray-200`}>
        {selectedFile.content || "No content available"}
      </pre>
    )
  }

  const canEdit = ["text", "markdown", "code", "json", "xml", "yaml", "yml", "css", "html"].includes(selectedFile.type)

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          {getFileIcon()}
          <h2 className="ml-2 text-xl font-semibold text-gray-200">{selectedFile.name}</h2>
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveEdits}
                className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdits}
                className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEditing}
                  className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant={isFavorite ? "default" : "outline"}
                onClick={handleToggleFavorite}
                className={isFavorite ? "bg-gray-700" : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"}
              >
                <Star className={`h-4 w-4 mr-2 ${isFavorite ? "text-yellow-400 fill-yellow-400" : ""}`} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-400 mb-4">
        <span className="mr-4">Size: {selectedFile.size}</span>
        <span className="mr-4">Last modified: {selectedFile.lastModified}</span>
        <span>Type: {selectedFile.type}</span>
      </div>

      <div className="mb-4 flex items-center">
        <Tag className="h-4 w-4 mr-2 text-gray-400" />
        <span className="text-sm font-medium mr-2 text-gray-300">Tags:</span>
        <div className="flex flex-wrap gap-2">
          {fileTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
              {tag}
            </Badge>
          ))}
          <div className="flex items-center">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-6 w-24 text-xs bg-gray-800 border-gray-700 text-gray-200"
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTag()
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              onClick={handleAddTag}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-md ${selectedFile.type === "code" ? "bg-gray-800 font-mono" : "bg-gray-800/50"}`}>
        {renderFileContent()}
      </div>

      <MemoryInsights />
    </div>
  )
}
