"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  CheckSquare,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react"

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  onCancel: () => void
}

export function MarkdownEditor({ content, onChange, onSave, onCancel }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Insert markdown syntax at cursor position
  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  // Toolbar button handlers
  const handleBold = () => insertMarkdown("**", "**")
  const handleItalic = () => insertMarkdown("*", "*")
  const handleH1 = () => insertMarkdown("# ")
  const handleH2 = () => insertMarkdown("## ")
  const handleH3 = () => insertMarkdown("### ")
  const handleList = () => insertMarkdown("- ")
  const handleOrderedList = () => insertMarkdown("1. ")
  const handleLink = () => insertMarkdown("[", "](url)")
  const handleImage = () => insertMarkdown("![alt text](", ")")
  const handleCode = () => insertMarkdown("```\n", "\n```")
  const handleQuote = () => insertMarkdown("> ")
  const handleCheckbox = () => insertMarkdown("- [ ] ")

  // Render markdown preview
  const renderMarkdown = (markdown: string) => {
    // Simple markdown rendering
    const html = markdown
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gm, "<em>$1</em>")
      .replace(/\n/gm, "<br>")
      .replace(/!\[(.*?)\]$$(.*?)$$/gm, '<img alt="$1" src="$2" style="max-width: 100%;">')
      .replace(/\[(.*?)\]$$(.*?)$$/gm, '<a href="$2" target="_blank">$1</a>')
      .replace(/```([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/gm, "<code>$1</code>")
      .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
      .replace(
        /- \[(x| )\] (.*$)/gm,
        (match, checked, text) =>
          `<div><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled /> ${text}</div>`,
      )
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^[0-9]+\. (.*$)/gm, "<li>$1</li>")

    return html
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "write" | "preview")}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="write" className="flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
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

      {activeTab === "write" && (
        <>
          <div className="flex flex-wrap gap-1 mb-2 bg-muted/30 p-1 rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBold} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleItalic} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleH1} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleH2} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleH3} title="Heading 3">
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleList} title="Bullet List">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOrderedList} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCheckbox} title="Task List">
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleQuote} title="Quote">
              <Quote className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCode} title="Code Block">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLink} title="Link">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleImage} title="Image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 p-4 rounded-md bg-muted/20 resize-none font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Start writing markdown here..."
          />
        </>
      )}

      {activeTab === "preview" && (
        <div
          className="flex-1 p-4 overflow-auto bg-muted/20 rounded-md prose max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  )
}
