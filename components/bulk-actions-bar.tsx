"use client"

import { Trash2, Download, Star, Move, Tag, X } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MoveFilesDialog } from "@/components/move-files-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function BulkActionsBar() {
  const {
    selectedFileIds,
    clearFileSelection,
    bulkDeleteFiles,
    bulkDownloadFiles,
    bulkAddToFavorites,
    bulkRemoveFromFavorites,
    bulkAddTags,
    favoriteFiles,
  } = useAppContext()

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)

  // If no files are selected, don't show the bar
  if (selectedFileIds.length === 0) {
    return null
  }

  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setTagsToAdd([...tagsToAdd, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsToAdd(tagsToAdd.filter((tag) => tag !== tagToRemove))
  }

  const handleApplyTags = async () => {
    if (tagsToAdd.length > 0) {
      await bulkAddTags(tagsToAdd)
      setTagsToAdd([])
      setIsTagDialogOpen(false)
    }
  }

  const isAllSelectedFilesFavorite =
    selectedFileIds.length > 0 && selectedFileIds.every((fileId) => favoriteFiles.includes(fileId))

  return (
    <div className="sticky top-0 z-20 w-full bg-muted/50 p-2 mb-2 rounded-md border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium mr-2">
            {selectedFileIds.length} {selectedFileIds.length === 1 ? "file" : "files"} selected
          </span>

          <Button variant="ghost" size="sm" onClick={bulkDownloadFiles} title="Download files" className="h-8">
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isAllSelectedFilesFavorite) {
                bulkRemoveFromFavorites()
              } else {
                bulkAddToFavorites()
              }
            }}
            title={isAllSelectedFilesFavorite ? "Remove from favorites" : "Add to favorites"}
            className="h-8"
          >
            <Star className={cn("h-4 w-4 mr-1", isAllSelectedFilesFavorite && "fill-yellow-400 text-yellow-400")} />
            <span className="hidden sm:inline">{isAllSelectedFilesFavorite ? "Unfavorite" : "Favorite"}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setIsTagDialogOpen(true)} title="Add tags" className="h-8">
            <Tag className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Tag</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMoveDialogOpen(true)}
            title="Move files"
            className="h-8"
          >
            <Move className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Move</span>
          </Button>

          <Button
            variant={confirmDelete ? "destructive" : "ghost"}
            size="sm"
            onClick={() => {
              if (confirmDelete) {
                bulkDeleteFiles()
                setConfirmDelete(false)
              } else {
                setConfirmDelete(true)
              }
            }}
            title="Delete files"
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{confirmDelete ? "Confirm" : "Delete"}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearFileSelection()
            setConfirmDelete(false)
          }}
        >
          <X className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Cancel</span>
        </Button>
      </div>

      {confirmDelete && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Are you sure you want to delete {selectedFileIds.length} {selectedFileIds.length === 1 ? "file" : "files"}?
            This action cannot be undone.
          </AlertDescription>
        </Alert>
      )}

      {/* Tag Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add tags</DialogTitle>
            <DialogDescription>Add tags to the selected files.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                id="tag"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tagsToAdd.length > 0 && (
              <div>
                {tagsToAdd.map((tag) => (
                  <Badge key={tag} variant="secondary" className="mr-1.5 mb-1">
                    {tag}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleApplyTags}>
              Apply tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Files Dialog */}
      <MoveFilesDialog isOpen={isMoveDialogOpen} onClose={() => setIsMoveDialogOpen(false)} fileIds={selectedFileIds} />
    </div>
  )
}
