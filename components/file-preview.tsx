"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { FileViewer } from "@/components/file-viewer"

interface FilePreviewProps {
  content: string
  fileType: "html" | "css" | "javascript" | "markdown" | "text"
  fileUrl?: string
  fileName?: string
  mimeType?: string
  fileId?: number | string
}

export function FilePreview({ content, fileType, fileUrl, fileName, mimeType, fileId }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")

  // Check if this is an image file that should use the FileViewer
  const isImageFile = mimeType && mimeType.startsWith("image/")

  const renderPreview = () => {
    // If it's an image and we have the URL, use the FileViewer
    if (isImageFile && fileUrl && fileName) {
      return (
        <div className="border rounded-md h-[500px] overflow-auto bg-white">
          <FileViewer fileUrl={fileUrl} fileName={fileName} mimeType={mimeType || ""} fileId={fileId} />
        </div>
      )
    }

    // Otherwise use the standard preview rendering
    switch (fileType) {
      case "html":
        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white">
            <iframe srcDoc={content} title="HTML Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
          </div>
        )
      case "css":
        // For CSS, we'll create a simple preview with some HTML
        const cssPreviewHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${content}</style>
            </head>
            <body>
              <div class="preview-container">
                <h1>CSS Preview</h1>
                <p>This is a paragraph to demonstrate text styling.</p>
                <button>Button Example</button>
                <div class="box">Box Element</div>
              </div>
            </body>
          </html>
        `
        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white">
            <iframe srcDoc={cssPreviewHtml} title="CSS Preview" className="w-full h-full border-0" />
          </div>
        )
      case "javascript":
        // For JS, we'll show console output
        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-gray-900 text-white font-mono">
            <p className="text-gray-400">// JavaScript preview is limited in this environment</p>
            <p className="text-gray-400">// Check the browser console for output</p>
            <pre className="mt-4">{content}</pre>
          </div>
        )
      case "markdown":
        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap">{content}</pre>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Markdown preview is temporarily disabled while we fix some issues.</p>
              <p>Please check back soon!</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white font-mono">
            <pre>{content}</pre>
          </div>
        )
    }
  }

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "code")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="p-4">
          {renderPreview()}
        </TabsContent>
        <TabsContent value="code" className="p-4">
          <CodeEditor value={content} onChange={() => {}} language={fileType} readOnly={true} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
