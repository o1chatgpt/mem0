"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAppContext } from "@/lib/app-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function FileUploadDialog({ isOpen, onClose }: FileUploadDialogProps) {
  const { currentPath, fileService, refreshFiles, memoryStore } = useAppContext()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
      setUploadStatus("idle")
      setErrorMessage(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      setSelectedFiles(filesArray)
      setUploadStatus("idle")
      setErrorMessage(null)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploadStatus("uploading")
    setErrorMessage(null)

    // Initialize progress for each file
    const initialProgress: Record<string, number> = {}
    selectedFiles.forEach((file) => {
      initialProgress[file.name] = 0
    })
    setUploadProgress(initialProgress)

    try {
      // Upload files one by one
      for (const file of selectedFiles) {
        try {
          // Update progress to show we're starting this file
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 10,
          }))

          // Upload the file
          await fileService.uploadFile(file)

          // Record in memory
          await memoryStore.addMemory(`Uploaded file: ${file.name} to ${currentPath}`)

          // Update progress to 100% for this file
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100,
          }))
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          setErrorMessage(`Failed to upload ${file.name}. ${error instanceof Error ? error.message : "Unknown error"}`)

          // Mark progress as failed
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: -1, // Use negative value to indicate error
          }))
        }
      }

      // Refresh file list
      await refreshFiles()

      // Check if all files were uploaded successfully
      const hasErrors = Object.values(uploadProgress).some((progress) => progress === -1)
      setUploadStatus(hasErrors ? "error" : "success")
    } catch (error) {
      console.error("Upload process error:", error)
      setUploadStatus("error")
      setErrorMessage(`Upload process failed. ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  const handleClose = () => {
    if (uploadStatus !== "uploading") {
      setSelectedFiles([])
      setUploadProgress({})
      setUploadStatus("idle")
      setErrorMessage(null)
      onClose()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return <File className="h-5 w-5 text-blue-500" />
    } else if (["mp4", "webm", "mov"].includes(extension)) {
      return <File className="h-5 w-5 text-pink-500" />
    } else if (["mp3", "wav", "ogg"].includes(extension)) {
      return <File className="h-5 w-5 text-yellow-500" />
    } else if (["pdf"].includes(extension)) {
      return <File className="h-5 w-5 text-red-500" />
    } else if (["doc", "docx"].includes(extension)) {
      return <File className="h-5 w-5 text-blue-700" />
    } else if (["xls", "xlsx"].includes(extension)) {
      return <File className="h-5 w-5 text-green-600" />
    } else if (["ppt", "pptx"].includes(extension)) {
      return <File className="h-5 w-5 text-orange-500" />
    } else if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs", "go", "rb", "php"].includes(extension)) {
      return <File className="h-5 w-5 text-purple-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and drop area */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Upload files to {currentPath}</p>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>

              {selectedFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {getFileTypeIcon(file.name)}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploadProgress[file.name] === 100 && (
                      <Badge variant="success" className="h-6">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    )}

                    {uploadProgress[file.name] === -1 && (
                      <Badge variant="destructive" className="h-6">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}

                    {(uploadProgress[file.name] === undefined ||
                      (uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100)) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(file.name)
                        }}
                        disabled={uploadStatus === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress */}
          {uploadStatus === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>
                  {Object.values(uploadProgress).filter((p) => p === 100).length} of {selectedFiles.length} complete
                </span>
              </div>
              <Progress
                value={
                  (Object.values(uploadProgress).reduce((sum, current) => (current > 0 ? sum + current : sum), 0) /
                    (selectedFiles.length * 100)) *
                  100
                }
              />
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {uploadStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">All files uploaded successfully!</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={uploadStatus === "uploading"}>
            {uploadStatus === "success" ? "Close" : "Cancel"}
          </Button>

          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploadStatus === "uploading"}>
            <Upload className="h-4 w-4 mr-2" />
            {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
