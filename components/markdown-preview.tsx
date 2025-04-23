"use client"

import { useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import "highlight.js/styles/github.css"

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!content || !previewRef.current) return

    // Import highlight.js dynamically to avoid MIME type issues
    import("highlight.js")
      .then((hljs) => {
        // Configure Marked.js
        marked.setOptions({
          highlight: (code, lang) => {
            const language = hljs.default.getLanguage(lang) ? lang : "plaintext"
            return hljs.default.highlight(code, { language }).value
          },
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
      })
      .catch((error) => {
        console.error("Failed to load highlight.js:", error)

        // Fallback rendering without syntax highlighting
        marked.setOptions({
          highlight: null,
          pedantic: false,
          gfm: true,
          breaks: true,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false,
        })

        const html = marked.parse(content)
        const cleanHtml = DOMPurify.sanitize(html)

        if (previewRef.current) {
          previewRef.current.innerHTML = cleanHtml
        }
      })
  }, [content])

  return <div ref={previewRef} className={`prose max-w-none ${className || ""}`}></div>
}
