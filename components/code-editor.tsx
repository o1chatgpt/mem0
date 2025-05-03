"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import CodeMirror with no SSR
const CodeMirror = dynamic(() => import("@uiw/react-codemirror").then((mod) => mod.default), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

// Dynamically import language extensions
const languageLoaders = {
  markdown: () => import("@codemirror/lang-markdown").then((mod) => mod.markdown()),
  html: () => import("@codemirror/lang-html").then((mod) => mod.html()),
  css: () => import("@codemirror/lang-css").then((mod) => mod.css()),
  javascript: () => import("@codemirror/lang-javascript").then((mod) => mod.javascript({ jsx: true })),
}

// Dynamically import theme
const themeLoader = () => import("@uiw/codemirror-theme-tokyo-night").then((mod) => mod.tokyoNight)

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: "markdown" | "html" | "css" | "javascript"
  className?: string
  height?: string
}

export function CodeEditor({ value, onChange, language, className = "", height = "500px" }: CodeEditorProps) {
  const [extensions, setExtensions] = useState<any[]>([])
  const [theme, setTheme] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load language extension and theme
    const loadDependencies = async () => {
      try {
        setIsLoading(true)
        const [langExtension, themeExtension] = await Promise.all([languageLoaders[language](), themeLoader()])

        setExtensions([langExtension])
        setTheme(themeExtension)
      } catch (error) {
        console.error("Failed to load CodeMirror dependencies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDependencies()
  }, [language])

  if (isLoading) {
    return <Skeleton className={`h-full w-full ${className}`} />
  }

  return (
    <div className={className} style={{ height }}>
      {extensions.length > 0 && theme && (
        <CodeMirror
          value={value}
          height={height}
          onChange={onChange}
          theme={theme}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            foldGutter: true,
            dropCursor: true,
          }}
        />
      )}
    </div>
  )
}

export default CodeEditor
