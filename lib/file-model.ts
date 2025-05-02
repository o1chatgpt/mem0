import { FileIcon, BookMarkedIcon as MarkdownIcon, FileCode2, FileJson } from "lucide-react"

export interface FileData {
  id: string
  name: string
  content: string
  language: "markdown" | "html" | "css" | "javascript"
  lastModified: Date
}

export function getFileLanguage(filename: string): "markdown" | "html" | "css" | "javascript" {
  const extension = filename.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "md":
      return "markdown"
    case "html":
    case "htm":
      return "html"
    case "css":
      return "css"
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return "javascript"
    default:
      return "markdown"
  }
}

export function getFileIcon(language: string) {
  switch (language) {
    case "markdown":
      return <MarkdownIcon className="h-4 w-4" />
    case "html":
      return <FileCode2 className="h-4 w-4" />
    case "css":
      return <FileIcon className="h-4 w-4" />
    case "javascript":
      return <FileJson className="h-4 w-4" />
    default:
      return <FileIcon className="h-4 w-4" />
  }
}
