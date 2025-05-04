"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save, X, Play, Code, FileCode, FileText } from "lucide-react"

interface CodeEditorProps {
  content: string
  fileName: string
  onChange: (content: string) => void
  onSave: () => void
  onCancel: () => void
}

export function CodeEditor({ content, fileName, onChange, onSave, onCancel }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [htmlContent, setHtmlContent] = useState("")
  const [cssContent, setCssContent] = useState("")
  const [jsContent, setJsContent] = useState("")
  const [combinedPreview, setCombinedPreview] = useState("")

  // Determine file type
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""
  const isHtml = fileExtension === "html" || fileExtension === "htm"
  const isCss = fileExtension === "css"
  const isJs = fileExtension === "js" || fileExtension === "javascript"

  // Initialize content based on file type
  useEffect(() => {
    if (isHtml) {
      setHtmlContent(content)
    } else if (isCss) {
      setCssContent(content)
    } else if (isJs) {
      setJsContent(content)
    } else {
      // Default to HTML if unknown
      setHtmlContent(content)
    }
  }, [content, isHtml, isCss, isJs])

  // Update content when editing
  useEffect(() => {
    if (isHtml) {
      onChange(htmlContent)
    } else if (isCss) {
      onChange(cssContent)
    } else if (isJs) {
      onChange(jsContent)
    }
  }, [htmlContent, cssContent, jsContent, onChange, isHtml, isCss, isJs])

  // Generate combined preview
  const generatePreview = () => {
    const preview = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
      </html>
    `
    setCombinedPreview(preview)
  }

  // Update preview when switching to preview tab
  useEffect(() => {
    if (activeTab === "preview") {
      generatePreview()
    }
  }, [activeTab, htmlContent, cssContent, jsContent])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "preview")} className="w-full">
          <TabsList>
            <TabsTrigger value="code" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
            {isHtml && (
              <TabsTrigger value="preview" className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex space-x-2 ml-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {activeTab === "code" && (
        <div className="flex-1 flex flex-col">
          {isHtml ? (
            <Tabs defaultValue="html" className="flex-1 flex flex-col">
              <TabsList>
                <TabsTrigger value="html" className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  CSS
                </TabsTrigger>
                <TabsTrigger value="js" className="flex items-center">
                  <FileCode className="h-4 w-4 mr-2" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="flex-1 mt-0">
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/20 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="<!DOCTYPE html>..."
                />
              </TabsContent>
              <TabsContent value="css" className="flex-1 mt-0">
                <textarea
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/20 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="body { ... }"
                />
              </TabsContent>
              <TabsContent value="js" className="flex-1 mt-0">
                <textarea
                  value={jsContent}
                  onChange={(e) => setJsContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/20 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="// JavaScript code"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 p-4 font-mono text-sm bg-muted/20 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={`// ${fileName}`}
            />
          )}
        </div>
      )}

      {activeTab === "preview" && isHtml && (
        <div className="flex-1 bg-white rounded-md overflow-hidden border">
          <iframe srcDoc={combinedPreview} title="Preview" className="w-full h-full" sandbox="allow-scripts" />
        </div>
      )}
    </div>
  )
}
