"use client"

import { useEffect, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { javascript } from "@codemirror/lang-javascript"
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night"

interface CodeMirrorBundleProps {
  value: string
  onChange: (value: string) => void
  language: "markdown" | "html" | "css" | "javascript"
  height?: string
}

export function CodeMirrorBundle({ value, onChange, language, height = "500px" }: CodeMirrorBundleProps) {
  const [extension, setExtension] = useState<any>(null)

  useEffect(() => {
    // Set the appropriate language extension
    switch (language) {
      case "markdown":
        setExtension(markdown())
        break
      case "html":
        setExtension(html())
        break
      case "css":
        setExtension(css())
        break
      case "javascript":
        setExtension(javascript({ jsx: true }))
        break
      default:
        setExtension(markdown())
    }
  }, [language])

  if (!extension) {
    return <div>Loading editor...</div>
  }

  return (
    <CodeMirror
      value={value}
      height={height}
      onChange={onChange}
      theme={tokyoNight}
      extensions={[extension]}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        autocompletion: true,
        foldGutter: true,
        dropCursor: true,
      }}
    />
  )
}
