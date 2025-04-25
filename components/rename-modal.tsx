"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemType: "file" | "folder"
  onRename: (newName: string) => Promise<void>
}

export function RenameModal({ isOpen, onClose, itemName, itemType, onRename }: RenameModalProps) {
  const [newName, setNewName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setNewName(itemName)
      setError(null)
    }
  }, [isOpen, itemName])

  const handleRename = async () => {
    if (!newName.trim()) {
      setError(`${itemType === "folder" ? "Folder" : "File"} name cannot be empty`)
      return
    }

    // Check for invalid characters in name
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(newName)) {
      setError(`Name contains invalid characters (< > : " / \\ | ? *)`)
      return
    }

    // If name hasn't changed, just close the modal
    if (newName === itemName) {
      onClose()
      return
    }

    setIsRenaming(true)
    setError(null)

    try {
      await onRename(newName.trim())
      toast({
        title: `${itemType === "folder" ? "Folder" : "File"} renamed`,
        description: `Successfully renamed to "${newName}"`,
      })
      onClose()
    } catch (error) {
      console.error(`Error renaming ${itemType}:`, error)
      setError(`Failed to rename ${itemType}. ${error instanceof Error ? error.message : "Please try again."}`)
      toast({
        title: `Error renaming ${itemType}`,
        description: `There was an error renaming the ${itemType}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRenaming && newName.trim()) {
      handleRename()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename {itemType === "folder" ? "Folder" : "File"}</DialogTitle>
          <DialogDescription>
            Enter a new name for the {itemType === "folder" ? "folder" : "file"} "{itemName}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Enter new ${itemType} name`}
              autoFocus
              disabled={isRenaming}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
