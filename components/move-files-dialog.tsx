"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Folder, ChevronRight, Home, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MoveFilesDialogProps {
  isOpen: boolean
  onClose: () => void
  fileIds: string[]
}

export function MoveFilesDialog({ isOpen, onClose, fileIds }: MoveFilesDialogProps) {
  const { fileService, refreshFiles, currentPath } = useAppContext()
  const [directories, setDirectories] = useState<{ id: string; name: string; path: string }[]>([])
  const [currentBrowsePath, setCurrentBrowsePath] = useState("/")
  const [selectedPath, setSelectedPath] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load directories when the dialog opens or path changes
  useEffect(() => {
    if (!isOpen) return

    const loadDirectories = async () => {
      setLoading(true)
      setError(null)

      try {
        const files = await fileService.getFilesByPath(currentBrowsePath)
        const dirs = files
          .filter((file) => file.type === "directory")
          .map((dir) => ({
            id: dir.id,
            name: dir.name,
            path: dir.path,
          }))

        setDirectories(dirs)
      } catch (err) {
        console.error("Error loading directories:", err)
        setError("Failed to load directories")
      } finally {
        setLoading(false)
      }
    }

    loadDirectories()
  }, [isOpen, currentBrowsePath, fileService])

  // Handle moving files
  const handleMoveFiles = async () => {
    if (!selectedPath || fileIds.length === 0) return

    setLoading(true)
    setError(null)

    try {
      // In a real implementation, we would call a bulk move API
      // For now, we'll just simulate success
      console.log(`Moving ${fileIds.length} files to ${selectedPath}`)

      // Refresh files after move
      await refreshFiles()

      // Close dialog
      onClose()
    } catch (err) {
      console.error("Error moving files:", err)
      setError("Failed to move files")
    } finally {
      setLoading(false)
    }
  }

  // Navigate to parent directory
  const navigateUp = () => {
    const parentPath = currentBrowsePath.split("/").slice(0, -1).join("/")
    setCurrentBrowsePath(parentPath || "/")
  }

  // Navigate to home directory
  const navigateHome = () => {
    setCurrentBrowsePath("/")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Move {fileIds.length} {fileIds.length === 1 ? "File" : "Files"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={navigateHome} title="Home">
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={navigateUp}
                disabled={currentBrowsePath === "/"}
                title="Up"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentBrowsePath(currentBrowsePath)}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm font-mono truncate border p-2 rounded-md">{currentBrowsePath || "/"}</div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <ScrollArea className="h-60 border rounded-md">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
            ) : directories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No directories found</div>
            ) : (
              <div className="p-2 space-y-1">
                {directories.map((dir) => (
                  <div
                    key={dir.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                      selectedPath === dir.path ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setSelectedPath(dir.path)}
                    onDoubleClick={() => setCurrentBrowsePath(dir.path)}
                  >
                    <Folder className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="truncate">{dir.name}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="text-sm">
            <p>Double-click a folder to navigate into it.</p>
            <p>Click a folder once to select it as the destination.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMoveFiles} disabled={!selectedPath || loading || fileIds.length === 0}>
            {loading ? "Moving..." : "Move Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
