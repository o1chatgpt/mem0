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
  Tag,
  Plus,
  Share2,
  AlertCircle,
  FileCode,
} from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ShareFileDialog } from "@/components/share-file-dialog"
import { SaveAsTemplateDialog } from "@/components/save-as-template-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FeatureHighlights } from "@/components/feature-highlights"
import { FileAssociations } from "@/components/file-associations"

export function FileViewer() {
  const { selectedFile, selectedFileId, selectedFileIds, fileService, memoryStore, refreshFiles } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [fileTags, setFileTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

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
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!selectedFileId) return

    try {
      const newFavoriteStatus = await memoryStore.toggleFavorite(selectedFileId)
      setIsFavorite(newFavoriteStatus)
      await refreshFiles()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleStartEditing = () => {
    if (!selectedFile || !selectedFile.content) return

    setEditedContent(selectedFile.content)
    setIsEditing(true)
  }

  const handleSaveEdits = async () => {
    if (!selectedFileId) return

    try {
      await fileService.updateFile(selectedFileId, { content: editedContent })
      setIsEditing(false)
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
      setNewTag("")
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }

  const handleShare = () => {
    setIsShareDialogOpen(true)
  }

  const handleSaveAsTemplate = () => {
    setIsTemplateDialogOpen(true)
  }

  if (selectedFileIds.length > 1) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto text-primary" />
          <h3 className="mt-4 text-lg font-medium">Multiple Files Selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedFileIds.length} files are selected. Use the bulk actions bar above to perform operations on these
            files.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Select a single file to view its contents, or use keyboard shortcuts:
            <br />
            <kbd className="px-1 py-0.5 text-xs border rounded mx-1">Ctrl/Cmd+Click</kbd> to toggle selection
            <br />
            <kbd className="px-1 py-0.5 text-xs border rounded mx-1">Shift+Click</kbd> to select a range
            <br />
            <kbd className="px-1 py-0.5 text-xs border rounded mx-1">Esc</kbd> to clear selection
          </p>
        </div>
      </div>
    )
  }

  if (!selectedFileId || !selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
        <FeatureHighlights />
      </div>
    )
  }

  const getFileIcon = () => {
    switch (selectedFile.type) {
      case "text":
        return <FileText className="h-6 w-6" />
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      case "presentation":
        return <FileIcon className="h-6 w-6 text-orange-500" />
      case "code":
        return <Code className="h-6 w-6 text-purple-500" />
      case "pdf":
        return <FileIcon className="h-6 w-6 text-red-500" />
      case "video":
        return <FileIcon className="h-6 w-6 text-pink-500" />
      case "audio":
        return <FileIcon className="h-6 w-6 text-yellow-500" />
      case "markdown":
        return <FileText className="h-6 w-6 text-teal-500" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  const renderFileContent = () => {
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
        .replace(/!\[(.*?)\]$$(.*?)$$/gm, '<img alt="$1" src="$2" style="max-width: 100%;">')
        .replace(/\[(.*?)\]$$(.*?)$$/gm, '<a href="$2" target="_blank">$1</a>')
        .replace(/```([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")
        .replace(/`([^`]+)`/gm, "<code>$1</code>")
        .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
        .replace(
          /- \[(x| )\] (.*$)/gm,
          (match, checked, text) =>
            `<div><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled /> ${text}</div>`,
        )
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/^[0-9]+\. (.*$)/gm, "<li>$1</li>")

      return <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: html }} />
    }

    // For HTML files, render in an iframe
    if (
      (selectedFile.type === "html" || selectedFile.name.endsWith(".html") || selectedFile.name.endsWith(".htm")) &&
      selectedFile.content
    ) {
      return (
        <div className="h-full">
          <iframe
            srcDoc={selectedFile.content}
            title={selectedFile.name}
            className="w-full h-full border rounded"
            sandbox="allow-scripts"
          />
        </div>
      )
    }

    return (
      <pre className={selectedFile.type === "code" ? "text-sm" : ""}>
        {selectedFile.content || "No content available"}
      </pre>
    )
  }

  const canEdit =
    ["text", "markdown", "code", "json", "xml", "yaml", "yml", "css", "html", "htm", "js", "jsx", "ts", "tsx"].includes(
      selectedFile.type,
    ) || selectedFile.name.match(/\.(md|txt|json|xml|yaml|yml|css|html|htm|js|jsx|ts|tsx)$/)

  const canSaveAsTemplate = canEdit && selectedFile.content

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          {getFileIcon()}
          <h2 className="ml-2 text-xl font-semibold">{selectedFile.name}</h2>
        </div>

        <div className="flex space-x-2">
          {canEdit ? (
            <Button size="sm" variant="outline" onClick={handleStartEditing}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button size="sm" variant={isFavorite ? "default" : "outline"} onClick={handleToggleFavorite}>
            <Star className={`h-4 w-4 mr-2 ${isFavorite ? "text-yellow-400 fill-yellow-400" : ""}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {canSaveAsTemplate && (
            <Button size="sm" variant="outline" onClick={handleSaveAsTemplate}>
              <FileCode className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <span className="mr-4">Size: {selectedFile.size}</span>
        <span className="mr-4">Last modified: {selectedFile.lastModified}</span>
        <span>Type: {selectedFile.type}</span>
      </div>

      <div className="mb-4 flex items-center">
        <Tag className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium mr-2">Tags:</span>
        <div className="flex flex-wrap gap-2">
          {fileTags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
          <div className="flex items-center">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-6 w-24 text-xs"
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTag()
                }
              }}
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddTag}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <Tabs defaultValue="edit" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="h-full">
            {renderFileContent()}
          </TabsContent>
          <TabsContent value="preview" className="h-full">
            {renderFileContent()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className={`p-4 rounded-md ${selectedFile.type === "code" ? "bg-muted font-mono" : "bg-muted/20"}`}>
          {renderFileContent()}
        </div>
      )}

      {/* Add file associations from mem0 */}
      <FileAssociations />

      <ShareFileDialog isOpen={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} />

      {/* Add the SaveAsTemplateDialog */}
      {selectedFile && (
        <SaveAsTemplateDialog
          isOpen={isTemplateDialogOpen}
          onClose={() => setIsTemplateDialogOpen(false)}
          fileName={selectedFile.name}
          fileContent={selectedFile.content || ""}
        />
      )}
    </div>
  )
}

export default FileViewer
