"use client"

import { useState } from "react"
import { ImagePreview } from "@/components/image-preview"
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  VideoIcon,
  FileAudioIcon as AudioIcon,
  ArchiveIcon,
  FileIcon as FileUnknownIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileViewerProps {
  fileUrl: string
  fileName: string
  mimeType: string
  fileId?: number | string
  fileSize?: number
}

export function FileViewer({ fileUrl, fileName, mimeType, fileId, fileSize }: FileViewerProps) {
  const [error, setError] = useState<string | null>(null)

  // Helper function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"

    const units = ["B", "KB", "MB", "GB", "TB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Determine file type category
  const getFileCategory = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    if (mimeType.startsWith("text/")) return "text"
    if (mimeType.includes("pdf")) return "pdf"
    if (mimeType.includes("zip") || mimeType.includes("compressed") || mimeType.includes("archive")) return "archive"
    return "other"
  }

  const fileCategory = getFileCategory(mimeType)

  // Render appropriate preview based on file type
  const renderPreview = () => {
    switch (fileCategory) {
      case "image":
        return <ImagePreview src={fileUrl || "/placeholder.svg"} alt={fileName} mimeType={mimeType} fileId={fileId} />

      case "video":
        return (
          <div className="h-full flex items-center justify-center">
            <video controls className="max-h-full max-w-full" onError={() => setError("Failed to load video")}>
              <source src={fileUrl} type={mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        )

      case "audio":
        return (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <AudioIcon className="h-24 w-24 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-4">{fileName}</p>
            <audio controls className="w-full max-w-md" onError={() => setError("Failed to load audio")}>
              <source src={fileUrl} type={mimeType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        )

      case "pdf":
        return (
          <div className="h-full flex items-center justify-center">
            <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-full border-0" title={fileName} />
          </div>
        )

      default:
        // For other file types, show a generic preview with download option
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            {renderFileIcon()}
            <h3 className="text-lg font-medium mt-4 mb-2">{fileName}</h3>
            <p className="text-sm text-gray-500 mb-4">{formatFileSize(fileSize)}</p>
            <p className="text-sm text-gray-500 mb-6">This file type cannot be previewed</p>
            <Button onClick={() => window.open(fileUrl, "_blank")} variant="outline">
              Download File
            </Button>
          </div>
        )
    }
  }

  // Render appropriate icon based on file type
  const renderFileIcon = () => {
    switch (fileCategory) {
      case "image":
        return <ImageIcon className="h-16 w-16 text-blue-500" />
      case "video":
        return <VideoIcon className="h-16 w-16 text-purple-500" />
      case "audio":
        return <AudioIcon className="h-16 w-16 text-green-500" />
      case "text":
        return <FileTextIcon className="h-16 w-16 text-yellow-500" />
      case "archive":
        return <ArchiveIcon className="h-16 w-16 text-orange-500" />
      default:
        return <FileIcon className="h-16 w-16 text-gray-500" />
    }
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <FileUnknownIcon className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Preview Error</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.open(fileUrl, "_blank")} variant="outline">
          Download File
        </Button>
      </div>
    )
  }

  return <div className="w-full h-full min-h-[400px] bg-white rounded-md overflow-hidden">{renderPreview()}</div>
}
