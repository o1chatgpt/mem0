"use client"

import { useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { smartMemoryService } from "@/lib/smart-memory-service"
import type { FileFormat } from "./enhanced-file-explorer"
import {
  FileText,
  Save,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  FileCode,
  FileJson,
  FileSpreadsheet,
  Settings,
  Wand2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

// Define conversion functions
const convertMarkdownToYaml = (markdown: string): string => {
  // Simple conversion for demo purposes
  const lines = markdown.split("\n")
  let yaml = 'title: "Converted from Markdown"\n'
  yaml += "content:\n"

  for (const line of lines) {
    if (line.startsWith("# ")) {
      yaml += `  heading: "${line.substring(2)}"\n`
    } else if (line.trim() !== "") {
      yaml += `  - "${line.replace(/"/g, '\\"')}"\n`
    }
  }

  return yaml
}

const convertMarkdownToJson = (markdown: string): string => {
  // Simple conversion for demo purposes
  const lines = markdown.split("\n")
  const json: any = {
    title: "Converted from Markdown",
    content: [],
  }

  for (const line of lines) {
    if (line.startsWith("# ")) {
      json.heading = line.substring(2)
    } else if (line.trim() !== "") {
      json.content.push(line)
    }
  }

  return JSON.stringify(json, null, 2)
}

const convertYamlToMarkdown = (yaml: string): string => {
  // Simple conversion for demo purposes
  const lines = yaml.split("\n")
  let markdown = ""

  for (const line of lines) {
    if (line.includes("title:")) {
      const title = line.split("title:")[1].trim().replace(/"/g, "")
      markdown += `# ${title}\n\n`
    } else if (line.includes('- "')) {
      const content = line.split('- "')[1].replace(/"/g, "")
      markdown += `${content}\n`
    }
  }

  return markdown
}

const convertJsonToMarkdown = (json: string): string => {
  try {
    const parsed = JSON.parse(json)
    let markdown = ""

    if (parsed.heading) {
      markdown += `# ${parsed.heading}\n\n`
    } else if (parsed.title) {
      markdown += `# ${parsed.title}\n\n`
    }

    if (Array.isArray(parsed.content)) {
      for (const item of parsed.content) {
        markdown += `${item}\n`
      }
    }

    return markdown
  } catch (e) {
    console.error("Error parsing JSON:", e)
    return "Error converting JSON to Markdown"
  }
}

export function MultiFormatEditor() {
  const { selectedFile, fileContent, setFileContent, saveFile, fileService } = useAppContext()
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "convert">("edit")
  const [convertedContent, setConvertedContent] = useState<string>("")
  const [targetFormat, setTargetFormat] = useState<FileFormat>("markdown")
  const [isSaving, setIsSaving] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    lineWrapping: true,
    darkMode: false,
    tabSize: 2,
  })

  // Determine file format
  const getFileFormat = (): FileFormat => {
    if (!selectedFile) return "txt"

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || ""

    if (extension === "md" || extension === "markdown") return "markdown"
    if (extension === "yml" || extension === "yaml") return "yaml"
    if (extension === "json") return "json"
    if (extension === "jsonl") return "jsonl"
    if (extension === "jsonb") return "jsonb"
    if (extension.includes("env")) return "env"
    if (extension === "txt") return "txt"

    return "other"
  }

  // Convert content to target format
  const convertContent = () => {
    if (!fileContent) return

    setIsConverting(true)

    try {
      const sourceFormat = getFileFormat()
      let result = ""

      // Perform conversion based on source and target formats
      if (sourceFormat === "markdown" && targetFormat === "yaml") {
        result = convertMarkdownToYaml(fileContent)
      } else if (sourceFormat === "markdown" && targetFormat === "json") {
        result = convertMarkdownToJson(fileContent)
      } else if (sourceFormat === "yaml" && targetFormat === "markdown") {
        result = convertYamlToMarkdown(fileContent)
      } else if (sourceFormat === "json" && targetFormat === "markdown") {
        result = convertJsonToMarkdown(fileContent)
      } else if (sourceFormat === targetFormat) {
        result = fileContent
      } else {
        // For other conversions, we'd use more sophisticated libraries
        // This is just a placeholder
        result = `// Conversion from ${sourceFormat} to ${targetFormat} not implemented yet\n\n${fileContent}`
      }

      setConvertedContent(result)
      setActiveTab("convert")
    } catch (error) {
      console.error("Error converting content:", error)
      toast({
        title: "Conversion Error",
        description: "Failed to convert the content. Please check the format and try again.",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveFile()

      // Record in smart memory
      if (selectedFile) {
        await smartMemoryService.recordInteraction(selectedFile.id, "edit", "Saved file content")
      }

      toast({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving file:", error)
      toast({
        title: "Save Error",
        description: "Failed to save the file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle download of converted content
  const handleDownloadConverted = () => {
    if (!convertedContent || !selectedFile) return

    const extension = targetFormat === "markdown" ? "md" : targetFormat
    const filename = `${selectedFile.name.split(".")[0]}.${extension}`

    const blob = new Blob([convertedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  // Request AI assistance with the document
  const requestAiAssistance = async () => {
    if (!selectedFile || !fileContent) return

    toast({
      title: "AI Processing",
      description: "Analyzing your document and generating suggestions...",
    })

    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const format = getFileFormat()
      let suggestion = ""

      switch (format) {
        case "markdown":
          suggestion =
            "## AI Suggestions\n\n- Consider adding a table of contents\n- The second paragraph could be more concise\n- Add more descriptive headings for better structure"
          break
        case "yaml":
          suggestion =
            "# AI Suggestions:\n- Add documentation comments\n- Consider grouping related configuration items\n- Validate against schema"
          break
        case "json":
          suggestion =
            "// AI Suggestions:\n// 1. Add proper indentation\n// 2. Consider using more descriptive property names\n// 3. Add type information in comments"
          break
        default:
          suggestion =
            "# AI Suggestions\n\n- Structure could be improved\n- Consider adding more documentation\n- Check for consistency in formatting"
      }

      setConvertedContent(suggestion)
      setActiveTab("convert")

      // Record this interaction
      if (selectedFile) {
        await smartMemoryService.recordInteraction(selectedFile.id, "analyze", "Requested AI assistance")
      }
    } catch (error) {
      console.error("Error getting AI assistance:", error)
      toast({
        title: "AI Error",
        description: "Failed to process your document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render preview based on file format
  const renderPreview = () => {
    const format = getFileFormat()

    switch (format) {
      case "markdown":
        return (
          <div className="prose max-w-full dark:prose-invert">
            {/* Simple markdown rendering */}
            {fileContent.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return <h1 key={i}>{line.substring(2)}</h1>
              } else if (line.startsWith("## ")) {
                return <h2 key={i}>{line.substring(3)}</h2>
              } else if (line.startsWith("### ")) {
                return <h3 key={i}>{line.substring(4)}</h3>
              } else if (line.startsWith("- ")) {
                return <li key={i}>{line.substring(2)}</li>
              } else if (line.trim() === "") {
                return <br key={i} />
              } else {
                return <p key={i}>{line}</p>
              }
            })}
          </div>
        )
      case "json":
      case "jsonl":
      case "jsonb":
        try {
          const formatted = JSON.stringify(JSON.parse(fileContent), null, 2)
          return (
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              <code>{formatted}</code>
            </pre>
          )
        } catch (e) {
          return (
            <div className="text-red-500">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Invalid JSON format
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2">
                <code>{fileContent}</code>
              </pre>
            </div>
          )
        }
      case "yaml":
        return (
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            <code>{fileContent}</code>
          </pre>
        )
      case "env":
        return (
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            {fileContent.split("\n").map((line, i) => {
              if (line.startsWith("#")) {
                return (
                  <div key={i} className="text-muted-foreground">
                    {line}
                  </div>
                )
              } else if (line.includes("=")) {
                const [key, value] = line.split("=")
                return (
                  <div key={i}>
                    <span className="text-blue-500">{key}</span>=<span className="text-green-500">{value}</span>
                  </div>
                )
              } else {
                return <div key={i}>{line}</div>
              }
            })}
          </pre>
        )
      default:
        return (
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            <code>{fileContent}</code>
          </pre>
        )
    }
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No file selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a file from the explorer to view and edit its contents
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          {getFileFormat() === "markdown" ? (
            <FileText className="h-6 w-6 text-purple-500" />
          ) : getFileFormat() === "yaml" ? (
            <FileCode className="h-6 w-6 text-green-500" />
          ) : ["json", "jsonl", "jsonb"].includes(getFileFormat()) ? (
            <FileJson className="h-6 w-6 text-amber-500" />
          ) : getFileFormat() === "env" ? (
            <FileSpreadsheet className="h-6 w-6 text-cyan-500" />
          ) : (
            <FileText className="h-6 w-6" />
          )}
          <h2 className="ml-2 text-xl font-semibold">{selectedFile.name}</h2>
          <Badge variant="outline" className="ml-2">
            {getFileFormat().toUpperCase()}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>

          <Button variant="outline" size="sm" onClick={() => fileService.downloadFile(selectedFile.id)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditorSettings((s) => ({ ...s, fontSize: s.fontSize + 2 }))}>
                Increase Font Size
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditorSettings((s) => ({ ...s, fontSize: Math.max(10, s.fontSize - 2) }))}
              >
                Decrease Font Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditorSettings((s) => ({ ...s, lineWrapping: !s.lineWrapping }))}>
                {editorSettings.lineWrapping ? "Disable" : "Enable"} Line Wrapping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditorSettings((s) => ({ ...s, darkMode: !s.darkMode }))}>
                {editorSettings.darkMode ? "Light" : "Dark"} Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={requestAiAssistance}>
            <Wand2 className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
        </div>
      </div>

      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <span className="mr-4">Size: {selectedFile.size}</span>
        <span className="mr-4">Last modified: {selectedFile.lastModified}</span>
        <span>Type: {selectedFile.type}</span>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="edit" className="flex-1">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            Preview
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex-1">
            Convert
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="min-h-[500px] font-mono"
            style={{
              fontSize: `${editorSettings.fontSize}px`,
              whiteSpace: editorSettings.lineWrapping ? "pre-wrap" : "pre",
              backgroundColor: editorSettings.darkMode ? "#1e1e1e" : "white",
              color: editorSettings.darkMode ? "#d4d4d4" : "black",
            }}
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>{renderPreview()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Convert to:</span>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as FileFormat)}
                  className="text-sm border rounded p-1"
                >
                  <option value="markdown">Markdown</option>
                  <option value="yaml">YAML</option>
                  <option value="json">JSON</option>
                  <option value="jsonl">JSONL</option>
                  <option value="env">ENV</option>
                </select>
                <Button size="sm" onClick={convertContent} disabled={isConverting}>
                  {isConverting ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Convert
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(convertedContent)}
                  disabled={!convertedContent}
                >
                  {hasCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {hasCopied ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadConverted} disabled={!convertedContent}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {convertedContent ? (
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                <code>{convertedContent}</code>
              </pre>
            ) : (
              <Alert>
                <AlertDescription>
                  Select a target format and click "Convert" to transform your document.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
