"use client"

interface SimpleMarkdownRendererProps {
  content: string
}

export function SimpleMarkdownRenderer({ content }: SimpleMarkdownRendererProps) {
  // Function to convert markdown to HTML
  const renderMarkdown = (text: string) => {
    // Replace code blocks
    let html = text.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

    // Replace inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

    // Replace bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

    // Replace italic text
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // Replace headers
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>")
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>")
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>")

    // Replace lists
    html = html.replace(/^\s*- (.*$)/gm, "<li>$1</li>")
    html = html.replace(/(<li>.*<\/li>)/gm, "<ul>{'$1'}</ul>")

    // Replace paragraphs
    html = html.replace(/^(?!<[a-z])(.*$)/gm, "<p>$1</p>")

    // Fix nested tags
    html = html.replace(/<\/ul>\s*<ul>/g, "")

    return html
  }

  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
}
