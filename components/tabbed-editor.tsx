"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { nanoid } from "nanoid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CodeEditor } from "@/components/code-editor"
import { CodeFormatter } from "@/components/code-formatter"
import { type FileData, getFileLanguage, getFileIcon } from "@/lib/file-model"
import { saveFiles, loadFiles } from "@/lib/file-storage"
import { Plus, X, Download, Upload, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"

interface TabbedEditorProps {
  files: FileData[]
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>
}

export function TabbedEditor({ files, setFiles }: TabbedEditorProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load files from local storage on first render
  useEffect(() => {
    const savedFiles = loadFiles()
    if (savedFiles.length > 0) {
      setFiles(savedFiles)
      setActiveFileId(savedFiles[0].id)
    } else {
      // Create a welcome file if no saved files
      const welcomeFile: FileData = {
        id: nanoid(),
        name: "welcome.md",
        content:
          "# Welcome to the Code Editor\n\nThis is a simple tabbed editor that supports:\n- Markdown\n- HTML\n- CSS\n- JavaScript\n\nCreate a new file to get started!",
        language: "markdown",
        lastModified: new Date(),
      }
      setFiles([welcomeFile])
      setActiveFileId(welcomeFile.id)
    }
  }, [setFiles])

  // Save files to local storage when they change
  useEffect(() => {
    if (files.length > 0) {
      saveFiles(files)
      setLastSaved(new Date())
    }
  }, [files])

  const activeFile = files.find((file) => file.id === activeFileId)

  const createNewFile = () => {
    if (!newFileName) return

    const language = getFileLanguage(newFileName)
    const newFile: FileData = {
      id: nanoid(),
      name: newFileName,
      content: "",
      language,
      lastModified: new Date(),
    }

    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
    setNewFileName("")
    setIsNewFileDialogOpen(false)
  }

  const updateFileContent = (content: string) => {
    if (!activeFileId) return

    setFiles(files.map((file) => (file.id === activeFileId ? { ...file, content, lastModified: new Date() } : file)))
  }

  const closeFile = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(files.length > 1 ? files.find((f) => f.id !== fileId)?.id || null : null)
    }
  }

  const downloadFile = () => {
    if (!activeFile) return

    const blob = new Blob([activeFile.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = activeFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newFile: FileData = {
        id: nanoid(),
        name: file.name,
        content,
        language: getFileLanguage(file.name),
        lastModified: new Date(),
      }

      setFiles([...files, newFile])
      setActiveFileId(newFile.id)
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  const handleFormatCode = (formattedCode: string) => {
    if (activeFileId) {
      updateFileContent(formattedCode)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-muted/30">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  placeholder="filename.ext (e.g. index.html, styles.css)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createNewFile()
                  }}
                />
                <div className="text-sm text-muted-foreground">Supported extensions: .md, .html, .css, .js</div>
                <Button onClick={createNewFile}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>

          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".md,.html,.css,.js,.jsx,.ts,.tsx"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button variant="outline" size="sm" onClick={downloadFile} disabled={!activeFile}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          {activeFile && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <CodeFormatter
                code={activeFile.content}
                language={activeFile.language}
                onFormat={handleFormatCode}
                disabled={!activeFile}
              />
            </>
          )}
        </div>
      </div>

      {files.length > 0 ? (
        <Tabs value={activeFileId || ""} onValueChange={setActiveFileId} className="flex-1 flex flex-col">
          <div className="border-b overflow-x-auto">
            <TabsList className="h-10 bg-transparent p-0">
              {files.map((file) => (
                <div key={file.id} className="flex items-center">
                  <TabsTrigger
                    value={file.id}
                    className="data-[state=active]:bg-background rounded-none border-r px-4 h-10"
                  >
                    <span className="mr-2">{getFileIcon(file.language)}</span>
                    {file.name}
                  </TabsTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeFile(file.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </TabsList>
          </div>

          {files.map((file) => (
            <TabsContent
              key={file.id}
              value={file.id}
              className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <CodeEditor
                value={file.content}
                onChange={updateFileContent}
                language={file.language}
                className="flex-1"
                height="100%"
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No files open</p>
            <Button onClick={() => setIsNewFileDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create a new file
            </Button>
          </div>
        </div>
      )}

      {activeFile && (
        <div className="p-2 border-t flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {activeFile.language.toUpperCase()} | Last modified: {activeFile.lastModified.toLocaleTimeString()}
          </div>
          <div>
            {lastSaved && (
              <span>
                <RefreshCw className="h-3 w-3 inline mr-1" />
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}
