"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Upload, X, File } from "lucide-react"
import { uploadFile } from "@/actions/file-actions"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentFolderId: number | null
  userId: number
  onUploadComplete: () => void
}

export function FileUploadModal({ isOpen, onClose, currentFolderId, userId, onUploadComplete }: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      let successCount = 0

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        try {
          await uploadFile({
            file,
            userId,
            folderId: currentFolderId,
          })

          successCount++
          setProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast({
            title: `Failed to upload ${file.name}`,
            description: "There was an error uploading this file.",
            variant: "destructive",
          })
        }
      }

      if (successCount > 0) {
        toast({
          title: "Files uploaded",
          description: `Successfully uploaded ${successCount} of ${selectedFiles.length} files.`,
        })
        onUploadComplete()
        onClose()
      }
    } catch (error) {
      console.error("Error during upload:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setProgress(0)
      setSelectedFiles([])
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select files to upload to {currentFolderId ? "this folder" : "root directory"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              selectedFiles.length > 0 ? "border-primary" : "border-muted-foreground"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setSelectedFiles(Array.from(e.dataTransfer.files))
              }
            }}
          >
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  browse
                </Button>
              </p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <File className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground flex-shrink-0">({formatBytes(file.size)})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
