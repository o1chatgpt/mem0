"use client"

import { useState, lazy, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { SimpleMarkdownPreview } from "@/components/simple-markdown-preview"
import { Loader2 } from "lucide-react"

// Dynamically import the full markdown preview component
const MarkdownPreview = lazy(() =>
  import("@/components/markdown-preview").then((mod) => ({
    default: mod.MarkdownPreview,
  })),
)

interface FilePreviewProps {
  content: string
  fileType: "html" | "css" | "javascript" | "markdown" | "text"
}

export function FilePreview({ content, fileType }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")
  const [useSimplePreview, setUseSimplePreview] = useState(false)

  const renderPreview = () => {
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
        if (useSimplePreview) {
          return (
            <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white">
              <SimpleMarkdownPreview content={content} />
              <button onClick={() => setUseSimplePreview(false)} className="mt-4 text-xs text-blue-500 hover:underline">
                Try with syntax highlighting
              </button>
            </div>
          )
        }

        return (
          <div className="border rounded-md p-4 h-[500px] overflow-auto bg-white">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading markdown preview...</span>
                </div>
              }
            >
              <MarkdownPreview content={content} />
              <button onClick={() => setUseSimplePreview(true)} className="mt-4 text-xs text-blue-500 hover:underline">
                Switch to simple preview
              </button>
            </Suspense>
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
