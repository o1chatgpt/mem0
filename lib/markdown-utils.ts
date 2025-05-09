import { marked } from "marked"
import DOMPurify from "dompurify"

/**
 * Renders markdown content to sanitized HTML without syntax highlighting
 */
export function renderMarkdown(content: string): string {
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
  return DOMPurify.sanitize(html)
}

/**
 * Extracts the first heading from markdown content
 */
export function extractMarkdownTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1] : "Untitled Document"
}
