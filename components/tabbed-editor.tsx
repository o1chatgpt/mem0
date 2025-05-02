"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { nanoid } from "nanoid"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { type FileData, getFileLanguage, getFileIcon } from "@/lib/file-model"
import { Plus, X, Download, Upload, RefreshCw, Wand2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

// Dynamically import CodeEditor to avoid SSR issues
const DynamicCodeEditor = dynamic(() => import("./code-editor").then((mod) => ({ default: mod.CodeEditor })), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

interface TabbedEditorProps {
  files: FileData[]
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>
}

export function TabbedEditor({ files, setFiles }: TabbedEditorProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isFormatting, setIsFormatting] = useState(false)
  const { toast } = useToast()
  const [fileStorage, setFileStorage] = useState<any>(null)

  // Load file storage module after mount
  useEffect(() => {
    import("@/lib/file-storage").then((module) => {
      setFileStorage(module)
    })
  }, [])

  // Set active file when files change
  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id)
    } else if (files.length === 0) {
      setActiveFileId(null)
    }
  }, [files, activeFileId])

  // Save files to local storage when they change
  useEffect(() => {
    if (files.length > 0 && fileStorage) {
      fileStorage.saveFiles(files)
      setLastSaved(new Date())
    }
  }, [files, fileStorage])

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

  const formatCode = async () => {
    if (!activeFile || isFormatting) return

    setIsFormatting(true)

    try {
      // Dynamically import prettier and the appropriate parser
      const prettier = await import("prettier/standalone")

      let parser: string
      let plugins: any[] = []

      switch (activeFile.language) {
        case "html":
          parser = "html"
          plugins = [await import("prettier/parser-html").then((mod) => mod.default)]
          break
        case "css":
          parser = "css"
          plugins = [await import("prettier/parser-postcss").then((mod) => mod.default)]
          break
        case "markdown":
          parser = "markdown"
          plugins = [await import("prettier/parser-markdown").then((mod) => mod.default)]
          break
        case "javascript":
          parser = "babel"
          plugins = [await import("prettier/parser-babel").then((mod) => mod.default)]
          break
        default:
          parser = "babel"
          plugins = [await import("prettier/parser-babel").then((mod) => mod.default)]
      }

      // Format the code
      const formattedCode = await prettier.format(activeFile.content, {
        parser,
        plugins,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: "es5",
        bracketSpacing: true,
        arrowParens: "always",
      })

      // Update the file content
      updateFileContent(formattedCode)

      toast({
        title: "Code formatted",
        description: "Your code has been formatted successfully.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Formatting error:", error)
      toast({
        title: "Formatting failed",
        description: error instanceof Error ? error.message : "An error occurred while formatting the code.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsFormatting(false)
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={formatCode}
                      disabled={!activeFile || isFormatting}
                      className={isFormatting ? "opacity-70" : ""}
                    >
                      <Wand2 className={`h-4 w-4 ${isFormatting ? "animate-pulse" : "mr-1"}`} />
                      {!isFormatting && "Format"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format code using Prettier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <DynamicCodeEditor
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
    </div>
  )
}

export default TabbedEditor
