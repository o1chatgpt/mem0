"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import type { FileData } from "@/lib/file-model"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Dynamically import markdown renderer
const DynamicMarkdownRenderer = dynamic(() => import("@/components/simple-markdown-renderer"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

interface CodePreviewProps {
  files: FileData[]
}

export function CodePreview({ files }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [combinedHtml, setCombinedHtml] = useState<string>("")
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once the component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Combine HTML, CSS, and JavaScript files
  useEffect(() => {
    if (!isClient) return

    const htmlFile = files.find((file) => file.language === "html")
    const cssFiles = files.filter((file) => file.language === "css")
    const jsFiles = files.filter((file) => file.language === "javascript")

    const html = htmlFile?.content || "<div id='app'></div>"
    const css = cssFiles.map((file) => file.content).join("\n")
    const js = jsFiles.map((file) => file.content).join("\n")

    const combined = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `

    setCombinedHtml(combined)
  }, [files, isClient])

  if (!isClient) {
    return <Skeleton className="h-full w-full" />
  }

  const markdownFiles = files.filter((file) => file.language === "markdown")
  const htmlFiles = files.filter((file) => file.language === "html")
  const cssFiles = files.filter((file) => file.language === "css")
  const jsFiles = files.filter((file) => file.language === "javascript")

  return (
    <div className="h-full flex flex-col border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="h-10">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {markdownFiles.length > 0 && <TabsTrigger value="markdown">Markdown</TabsTrigger>}
            {htmlFiles.length > 0 && <TabsTrigger value="html">HTML</TabsTrigger>}
            {cssFiles.length > 0 && <TabsTrigger value="css">CSS</TabsTrigger>}
            {jsFiles.length > 0 && <TabsTrigger value="javascript">JavaScript</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="p-4 flex-1 overflow-auto bg-white">
            {files.length > 0 ? (
              <iframe
                srcDoc={combinedHtml}
                title="Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No files to preview</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="markdown" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="p-4 flex-1 overflow-auto">
            {markdownFiles.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  {markdownFiles.map((file) => (
                    <div key={file.id} className="mb-6">
                      <h3 className="text-sm font-medium mb-2">{file.name}</h3>
                      <DynamicMarkdownRenderer content={file.content} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No Markdown files to preview
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="html" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="p-4 flex-1 overflow-auto">
            {htmlFiles.length > 0 ? (
              htmlFiles.map((file) => (
                <div key={file.id} className="mb-6">
                  <h3 className="text-sm font-medium mb-2">{file.name}</h3>
                  <iframe
                    srcDoc={file.content}
                    title={file.name}
                    className="w-full h-[300px] border rounded"
                    sandbox="allow-scripts"
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No HTML files to preview
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="css" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="p-4 flex-1 overflow-auto">
            {cssFiles.length > 0 ? (
              cssFiles.map((file) => (
                <div key={file.id} className="mb-6">
                  <h3 className="text-sm font-medium mb-2">{file.name}</h3>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No CSS files to preview
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="javascript"
          className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <div className="p-4 flex-1 overflow-auto">
            {jsFiles.length > 0 ? (
              jsFiles.map((file) => (
                <div key={file.id} className="mb-6">
                  <h3 className="text-sm font-medium mb-2">{file.name}</h3>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No JavaScript files to preview
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CodePreview
