"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Import CodeMirror and extensions in a single dynamic import
import dynamic from "next/dynamic"

const CodeMirrorBundle = dynamic(() => import("./code-mirror-bundle").then((mod) => mod.CodeMirrorBundle), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})

function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 h-full">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: "markdown" | "html" | "css" | "javascript"
  className?: string
  height?: string
}

export function CodeEditor({ value, onChange, language, className, height = "500px" }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <EditorSkeleton />
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)} style={{ height }}>
      <CodeMirrorBundle value={value} onChange={onChange} language={language} height={height} />
    </div>
  )
}
