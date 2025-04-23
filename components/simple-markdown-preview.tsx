"use client"

import { useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"

interface SimpleMarkdownPreviewProps {
  content: string
  className?: string
}

export function SimpleMarkdownPreview({ content, className }: SimpleMarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!content || !previewRef.current) return

    // Configure Marked.js without syntax highlighting
    marked.setOptions({
      pedantic: false,
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false,
    })

    // Generate HTML from Markdown
    const html = marked.parse(content)

    // Sanitize HTML to prevent XSS attacks
    const cleanHtml = DOMPurify.sanitize(html)

    // Update the preview container
    previewRef.current.innerHTML = cleanHtml
  }, [content])

  return <div ref={previewRef} className={`prose max-w-none ${className || ""}`}></div>
}
