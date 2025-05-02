"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Code, RefreshCw } from "lucide-react"
import type { FileData } from "@/lib/file-model"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface CodePreviewProps {
  files: FileData[]
}

export function CodePreview({ files }: CodePreviewProps) {
  const [previewMode, setPreviewMode] = useState<"combined" | "individual">("combined")
  const [refreshKey, setRefreshKey] = useState(0)

  // Extract files by type
  const htmlFile = files.find((file) => file.language === "html")
  const cssFile = files.find((file) => file.language === "css")
  const jsFile = files.find((file) => file.language === "javascript")
  const mdFile = files.find((file) => file.language === "markdown")

  // Combined preview HTML
  const combinedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${cssFile?.content || ""}</style>
    </head>
    <body>
      ${htmlFile?.content || ""}
      <script>${jsFile?.content || ""}</script>
    </body>
    </html>
  `

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-lg">Preview</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="combined">
                <Eye className="h-4 w-4 mr-1" />
                Combined
              </TabsTrigger>
              <TabsTrigger value="individual">
                <Code className="h-4 w-4 mr-1" />
                Individual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-auto">
        <div className="h-full">
          {previewMode === "combined" ? (
            <div className="h-full">
              {htmlFile || cssFile || jsFile ? (
                <iframe
                  key={refreshKey}
                  srcDoc={combinedHTML}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              ) : mdFile ? (
                <div className="p-4 prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{mdFile.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue={files.length > 0 ? files[0].id : undefined} className="h-full">
              <TabsList className="border-b rounded-none w-full justify-start">
                {files.map((file) => (
                  <TabsTrigger key={file.id} value={file.id} className="rounded-none">
                    {file.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {files.map((file) => (
                <TabsContent key={file.id} value={file.id} className="h-[calc(100%-40px)] m-0">
                  {file.language === "markdown" ? (
                    <div className="p-4 prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{file.content}</ReactMarkdown>
                    </div>
                  ) : file.language === "html" ? (
                    <iframe
                      key={`${file.id}-${refreshKey}`}
                      srcDoc={file.content}
                      className="w-full h-full border-0"
                      title={file.name}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <pre
                      className={cn(
                        "p-4 overflow-auto h-full",
                        file.language === "css" ? "language-css" : "language-javascript",
                      )}
                    >
                      <code>{file.content}</code>
                    </pre>
                  )}
                </TabsContent>
              ))}

              {files.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">No files to preview</div>
              )}
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
