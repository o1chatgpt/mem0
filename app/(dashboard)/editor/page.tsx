"use client"

import { useState, useEffect } from "react"
import { TabbedEditor } from "@/components/tabbed-editor"
import { CodePreview } from "@/components/code-preview"
import type { FileData } from "@/lib/file-model"
import { loadFiles } from "@/lib/file-storage"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Toaster } from "@/components/ui/toaster"

export default function EditorPage() {
  const [files, setFiles] = useState<FileData[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once the component mounts
  useEffect(() => {
    setIsClient(true)

    // Load files from local storage on first render
    const savedFiles = loadFiles()
    if (savedFiles.length > 0) {
      setFiles(savedFiles)
    }
  }, [])

  // Don't render anything on the server
  if (!isClient) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Code Editor</h1>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Code Editor</h1>
        <p className="text-muted-foreground">Edit and preview Markdown, HTML, CSS, and JavaScript files</p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-80px)]">
        <ResizablePanel defaultSize={50} minSize={30}>
          <TabbedEditor files={files} setFiles={setFiles} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <CodePreview files={files} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <Toaster />
    </div>
  )
}
