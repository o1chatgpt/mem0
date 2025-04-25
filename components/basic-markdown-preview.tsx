"use client"

import { useState, useEffect } from "react"

interface BasicMarkdownPreviewProps {
  content: string
  className?: string
}

export function BasicMarkdownPreview({ content, className }: BasicMarkdownPreviewProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    // Very basic markdown parsing
    const parsed = content
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Code blocks (simple)
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      // Inline code
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // Lists
      .replace(/^- (.*$)/gm, "<ul><li>$1</li></ul>")
      .replace(/^\d\. (.*$)/gm, "<ol><li>$1</li></ol>")
      // Links
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2">$1</a>')
      // Paragraphs
      .replace(/^\s*(\n)?(.+)/gm, (m) => (/<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : "<p>" + m + "</p>"))
      // Line breaks
      .replace(/\n/g, "<br>")

    setHtml(parsed)
  }, [content])

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
