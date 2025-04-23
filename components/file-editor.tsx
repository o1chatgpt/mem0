"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Loader2, Save, ArrowLeft, Code, Eye, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { python } from "@codemirror/lang-python"
import { sql } from "@codemirror/lang-sql"
import { xml } from "@codemirror/lang-xml"
import { php } from "@codemirror/lang-php"
import { java } from "@codemirror/lang-java"
import { rust } from "@codemirror/lang-rust"
import { cpp } from "@codemirror/lang-cpp"
import { yaml } from "@codemirror/lang-yaml"
import { shell } from "@codemirror/legacy-modes/mode/shell"
import { ruby } from "@codemirror/legacy-modes/mode/ruby"
import { go } from "@codemirror/legacy-modes/mode/go"
import { swift } from "@codemirror/legacy-modes/mode/swift"
import { kotlin } from "@codemirror/legacy-modes/mode/clike"
import { StreamLanguage } from "@codemirror/language"
import { oneDark } from "@codemirror/theme-one-dark"

// Import the language utilities
import { getLanguageFromFileName } from "@/lib/language-utils"
import { MarkdownPreview } from "@/components/markdown-preview"

interface FileEditorProps {
  fileId: string
  initialContent?: string
  fileName?: string
  readOnly?: boolean
}

export function FileEditor({ fileId, initialContent = "", fileName = "Untitled", readOnly = false }: FileEditorProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [language, setLanguage] = useState<string>("text")
  const [activeTab, setActiveTab] = useState<string>("editor")
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)

  // Determine if file supports preview
  const supportsPreview = () => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    return ["md", "markdown", "html", "htm"].includes(ext)
  }

  // Determine language based on file extension
  const getLanguageExtension = () => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    let detectedLanguage = "text"

    switch (ext) {
      // JavaScript and TypeScript
      case "js":
        detectedLanguage = "javascript"
        return javascript()
      case "jsx":
        detectedLanguage = "jsx"
        return javascript({ jsx: true })
      case "ts":
        detectedLanguage = "typescript"
        return javascript({ typescript: true })
      case "tsx":
        detectedLanguage = "tsx"
        return javascript({ jsx: true, typescript: true })

      // HTML
      case "html":
      case "htm":
        detectedLanguage = "html"
        return html()

      // CSS
      case "css":
        detectedLanguage = "css"
        return css()

      // JSON
      case "json":
        detectedLanguage = "json"
        return json()

      // Markdown
      case "md":
      case "markdown":
        detectedLanguage = "markdown"
        return markdown()

      // Python
      case "py":
      case "pyw":
      case "pyi":
        detectedLanguage = "python"
        return python()

      // SQL
      case "sql":
        detectedLanguage = "sql"
        return sql()

      // XML and SVG
      case "xml":
      case "svg":
      case "xhtml":
        detectedLanguage = "xml"
        return xml()

      // PHP
      case "php":
      case "phtml":
        detectedLanguage = "php"
        return php()

      // Java
      case "java":
        detectedLanguage = "java"
        return java()

      // Rust
      case "rs":
        detectedLanguage = "rust"
        return rust()

      // C/C++
      case "c":
      case "h":
        detectedLanguage = "c"
        return cpp()
      case "cpp":
      case "cc":
      case "cxx":
      case "hpp":
      case "hxx":
        detectedLanguage = "cpp"
        return cpp()

      // YAML
      case "yml":
      case "yaml":
        detectedLanguage = "yaml"
        return yaml()

      // Shell/Bash
      case "sh":
      case "bash":
      case "zsh":
        detectedLanguage = "shell"
        return StreamLanguage.define(shell)

      // Ruby
      case "rb":
      case "ruby":
        detectedLanguage = "ruby"
        return StreamLanguage.define(ruby)

      // Go
      case "go":
        detectedLanguage = "go"
        return StreamLanguage.define(go)

      // Swift
      case "swift":
        detectedLanguage = "swift"
        return StreamLanguage.define(swift)

      // Kotlin
      case "kt":
      case "kts":
        detectedLanguage = "kotlin"
        return StreamLanguage.define(kotlin)

      // Default to plain text
      default:
        detectedLanguage = "text"
        return []
    }

    // Update the language state
    setLanguage(detectedLanguage)
  }

  useEffect(() => {
    const fetchFileContent = async () => {
      if (initialContent) {
        setContent(initialContent)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/files/${fileId}`)
        if (!response.ok) throw new Error("Failed to fetch file")

        const data = await response.json()
        setContent(data.content || "")
      } catch (error) {
        console.error("Error fetching file:", error)
        toast({
          title: "Error",
          description: "Failed to load file content",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileContent()
  }, [fileId, initialContent, toast])

  useEffect(() => {
    if (editorRef.current && !isLoading) {
      // Clean up previous editor instance
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
      }

      // Create editor state
      const startState = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          getLanguageExtension(),
          oneDark,
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setContent(update.state.doc.toString())
            }
          }),
        ],
      })

      // Create editor view
      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      })

      editorViewRef.current = view

      // Cleanup on unmount
      return () => {
        view.destroy()
      }
    }
  }, [isLoading, content, readOnly, fileName])

  const saveFile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error("Failed to save file")

      toast({
        title: "Success",
        description: "File saved successfully",
      })
    } catch (error) {
      console.error("Error saving file:", error)
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    router.back()
  }

  // Get file extension for display
  const getFileExtension = () => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    return ext ? `.${ext}` : ""
  }

  // Get language display name
  const getLanguageDisplayName = () => {
    return getLanguageFromFileName(fileName)
  }

  // Render the preview content based on file type
  const renderPreview = () => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""

    if (["md", "markdown"].includes(ext)) {
      return <MarkdownPreview content={content} className="p-6" />
    } else if (["html", "htm"].includes(ext)) {
      return <iframe title="HTML Preview" srcDoc={content} className="w-full h-full border-0" sandbox="allow-scripts" />
    }

    return <div className="p-6">Preview not available for this file type.</div>
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium ml-2">{fileName}</h2>
          <div className="ml-2 flex items-center">
            <Code className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{getLanguageDisplayName()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {supportsPreview() && (
            <div className="border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none ${activeTab === "editor" ? "bg-muted" : ""}`}
                onClick={() => setActiveTab("editor")}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none ${activeTab === "preview" ? "bg-muted" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          )}
          {!readOnly && (
            <Button onClick={saveFile} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsContent value="editor" className="flex-1 p-0 m-0 data-[state=active]:flex">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div ref={editorRef} className="h-full w-full" />
          )}
        </TabsContent>

        <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-auto data-[state=active]:block">
          {renderPreview()}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
