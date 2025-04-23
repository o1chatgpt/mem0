"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { createFolder } from "@/actions/folder-actions"

interface FolderCreateModalProps {
  isOpen: boolean
  onClose: () => void
  currentFolderId: number | null
  userId: number
  onFolderCreated: () => void
}

export function FolderCreateModal({
  isOpen,
  onClose,
  currentFolderId,
  userId,
  onFolderCreated,
}: FolderCreateModalProps) {
  const [folderName, setFolderName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty")
      return
    }

    // Check for invalid characters in folder name
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(folderName)) {
      setError('Folder name contains invalid characters (< > : " / \\ | ? *)')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      await createFolder({
        name: folderName.trim(),
        userId,
        parentId: currentFolderId,
      })

      toast({
        title: "Folder created",
        description: `Folder "${folderName}" has been created successfully.`,
      })

      setFolderName("")
      onFolderCreated()
      onClose()
    } catch (error) {
      console.error("Error creating folder:", error)
      setError("Failed to create folder. Please try again.")
      toast({
        title: "Error creating folder",
        description: "There was an error creating the folder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating && folderName.trim()) {
      handleCreateFolder()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for the new folder in {currentFolderId ? "this location" : "the root directory"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter folder name"
              autoFocus
              disabled={isCreating}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} disabled={isCreating || !folderName.trim()}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
