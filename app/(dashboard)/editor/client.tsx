"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import components that use browser APIs
const DynamicTabbedEditor = dynamic(
  () => import("@/components/tabbed-editor").then((mod) => ({ default: mod.TabbedEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-4 h-full">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  },
)

const DynamicCodePreview = dynamic(
  () => import("@/components/code-preview").then((mod) => ({ default: mod.CodePreview })),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-4 h-full">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  },
)

const DynamicResizable = dynamic(
  () =>
    import("@/components/ui/resizable").then((mod) => ({
      ResizablePanelGroup: mod.ResizablePanelGroup,
      ResizablePanel: mod.ResizablePanel,
      ResizableHandle: mod.ResizableHandle,
    })),
  { ssr: false },
)

import type { FileData } from "@/lib/file-model"

export default function EditorClientPage() {
  const [files, setFiles] = useState<FileData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [ResizableComponents, setResizableComponents] = useState<any>(null)

  // Load files and components after mount
  useEffect(() => {
    // Import here to avoid SSR issues
    import("@/lib/file-storage").then(({ loadFiles }) => {
      const savedFiles = loadFiles()
      if (savedFiles.length > 0) {
        setFiles(savedFiles)
      }
      setIsLoaded(true)
    })

    // Set resizable components
    import("@/components/ui/resizable").then((mod) => {
      setResizableComponents({
        ResizablePanelGroup: mod.ResizablePanelGroup,
        ResizablePanel: mod.ResizablePanel,
        ResizableHandle: mod.ResizableHandle,
      })
    })
  }, [])

  if (!isLoaded || !ResizableComponents) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Code Editor</h1>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          <Skeleton className="h-full w-full" />
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  const { ResizablePanelGroup, ResizablePanel, ResizableHandle } = ResizableComponents

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Code Editor</h1>
        <p className="text-muted-foreground">Edit and preview Markdown, HTML, CSS, and JavaScript files</p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-80px)]">
        <ResizablePanel defaultSize={50} minSize={30}>
          <DynamicTabbedEditor files={files} setFiles={setFiles} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <DynamicCodePreview files={files} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
