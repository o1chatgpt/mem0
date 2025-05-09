"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/db"
import { ChevronRight, Folder, ArrowLeft, Plus, Upload, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileUploadModal } from "@/components/file-upload-modal"
import { FolderCreateModal } from "@/components/folder-create-modal"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { RenameModal } from "@/components/rename-modal"
import { toast } from "@/components/ui/use-toast"
import { deleteFile, renameFile } from "@/actions/file-actions"
import { deleteFolder, renameFolder } from "@/actions/folder-actions"
import Link from "next/link"
import { useMemory } from "@/components/memory-context-provider"

type FolderType = {
  id: number
  name: string
  path: string
  parent_id: number | null
}

type FileType = {
  id: number
  name: string
  path: string
  size: number
  mime_type: string
  folder_id: number | null
  blob_url: string | null
}

type DeleteItemType = {
  id: number
  name: string
  type: "file" | "folder"
}

type RenameItemType = {
  id: number
  name: string
  type: "file" | "folder"
}

export function FileExplorer({ userId }: { userId: number }) {
  const [currentFolder, setCurrentFolder] = useState<number | null>(null)
  const [folderPath, setFolderPath] = useState<FolderType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isFolderCreateModalOpen, setIsFolderCreateModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DeleteItemType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [itemToRename, setItemToRename] = useState<RenameItemType | null>(null)

  const { recordFileView, recordFolderNavigation } = useMemory()

  useEffect(() => {
    fetchFolderContents()
  }, [currentFolder, userId])

  const fetchFolderContents = async () => {
    if (!userId) return

    setLoading(true)
    const supabase = createClientComponentClient()

    // Fetch folders in current directory
    let folderQuery = supabase.from("fm_folders").select("*").eq("user_id", userId).order("name")

    if (currentFolder === null) {
      folderQuery = folderQuery.is("parent_id", null)
    } else {
      folderQuery = folderQuery.eq("parent_id", currentFolder)
    }

    const { data: folderData, error: folderError } = await folderQuery

    if (folderError) {
      console.error("Error fetching folders:", folderError)
    } else {
      setFolders(folderData || [])
    }

    // Fetch files in current directory
    let fileQuery = supabase.from("fm_files").select("*").eq("user_id", userId).order("name")

    if (currentFolder === null) {
      fileQuery = fileQuery.is("folder_id", null)
    } else {
      fileQuery = fileQuery.eq("folder_id", currentFolder)
    }

    const { data: fileData, error: fileError } = await fileQuery

    if (fileError) {
      console.error("Error fetching files:", fileError)
    } else {
      setFiles(fileData || [])
    }

    // Update folder path
    if (currentFolder === null) {
      setFolderPath([])
    } else {
      await updateFolderPath(currentFolder)
    }

    setLoading(false)
  }

  const updateFolderPath = async (folderId: number) => {
    const path: FolderType[] = []
    let currentId: number | null = folderId
    const supabase = createClientComponentClient()

    while (currentId !== null) {
      const { data, error } = await supabase.from("fm_folders").select("*").eq("id", currentId).single()

      if (error || !data) {
        console.error("Error fetching folder path:", error)
        break
      }

      path.unshift(data)
      currentId = data.parent_id
    }

    setFolderPath(path)
  }

  const navigateToFolder = (folderId: number | null) => {
    setCurrentFolder(folderId)

    // Record folder navigation if it's not null
    if (folderId !== null) {
      const folder = folders.find((f) => f.id === folderId)
      if (folder) {
        recordFolderNavigation(folder.id, folder.name, userId)
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️"
    if (mimeType.startsWith("video/")) return "🎬"
    if (mimeType.startsWith("audio/")) return "🎵"
    if (mimeType.includes("pdf")) return "📄"
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊"
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️"
    if (mimeType.includes("document") || mimeType.includes("word")) return "📝"
    if (mimeType.includes("text")) return "📄"
    return "📁"
  }

  const isEditableFile = (fileName: string, mimeType: string) => {
    const editableExtensions = [".html", ".htm", ".css", ".js", ".md", ".txt", ".json"]
    const editableMimeTypes = ["text/", "application/javascript", "application/json", "text/markdown"]

    const extension = "." + fileName.split(".").pop()?.toLowerCase()

    return (
      editableExtensions.some((ext) => fileName.toLowerCase().endsWith(ext)) ||
      editableMimeTypes.some((type) => mimeType.includes(type))
    )
  }

  const handleFileClick = (file: FileType) => {
    // Record file view
    recordFileView(file.id, file.name, userId)

    if (isEditableFile(file.name, file.mime_type)) {
      // Navigate to editor for editable files
      window.location.href = `/file-editor/${file.id}`
    } else if (file.blob_url) {
      // Open blob URL for non-editable files
      window.open(file.blob_url, "_blank")
    }
  }

  const handleDeleteClick = (item: DeleteItemType) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)

    try {
      if (itemToDelete.type === "file") {
        await deleteFile(itemToDelete.id)
        toast({
          title: "File deleted",
          description: `${itemToDelete.name} has been deleted successfully.`,
        })
      } else {
        await deleteFolder(itemToDelete.id)
        toast({
          title: "Folder deleted",
          description: `${itemToDelete.name} and all its contents have been deleted successfully.`,
        })
      }

      // Refresh the folder contents
      fetchFolderContents()
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error)
      toast({
        title: `Error deleting ${itemToDelete.type}`,
        description: `There was an error deleting ${itemToDelete.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  const handleRenameClick = (item: RenameItemType) => {
    setItemToRename(item)
    setRenameModalOpen(true)
  }

  const handleRename = async (newName: string) => {
    if (!itemToRename) return

    try {
      if (itemToRename.type === "file") {
        await renameFile(itemToRename.id, newName)
      } else {
        await renameFolder(itemToRename.id, newName)
      }

      // Refresh the folder contents
      fetchFolderContents()
    } catch (error) {
      console.error(`Error renaming ${itemToRename.type}:`, error)
      throw error
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-2">
          <CardTitle>File Explorer</CardTitle>
          {currentFolder !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigateToFolder(folderPath.length > 1 ? folderPath[folderPath.length - 2].parent_id : null)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsFolderCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <div className="px-4 py-2 bg-muted/50 flex items-center overflow-x-auto">
        <Button variant="ghost" size="sm" onClick={() => navigateToFolder(null)}>
          Root
        </Button>
        {folderPath.map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            <Button variant="ghost" size="sm" onClick={() => navigateToFolder(folder.id)}>
              {folder.name}
            </Button>
          </div>
        ))}
      </div>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            This folder is empty. Create a new folder or upload files to get started.
          </div>
        ) : (
          <div className="divide-y">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => navigateToFolder(folder.id)}
              >
                <div className="flex items-center">
                  <Folder className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{folder.name}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameClick({ id: folder.id, name: folder.name, type: "folder" })
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick({ id: folder.id, name: folder.name, type: "folder" })
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center">
                  <div className="mr-3 text-lg">{getFileIcon(file.mime_type)}</div>
                  <div>
                    <div>{file.name}</div>
                    <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isEditableFile(file.name, file.mime_type) && (
                      <Link href={`/file-editor/${file.id}`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                    )}
                    {file.blob_url && (
                      <DropdownMenuItem asChild>
                        <a href={file.blob_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameClick({ id: file.id, name: file.name, type: "file" })
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick({ id: file.id, name: file.name, type: "file" })
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentFolderId={currentFolder}
        userId={userId}
        onUploadComplete={fetchFolderContents}
      />

      <FolderCreateModal
        isOpen={isFolderCreateModalOpen}
        onClose={() => setIsFolderCreateModalOpen(false)}
        currentFolderId={currentFolder}
        userId={userId}
        onFolderCreated={fetchFolderContents}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type === "folder" ? "Folder" : "File"}`}
        description={
          itemToDelete?.type === "folder"
            ? `Are you sure you want to delete the folder "${itemToDelete?.name}" and all its contents? This action cannot be undone.`
            : `Are you sure you want to delete the file "${itemToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="destructive"
      />

      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false)
          setItemToRename(null)
        }}
        itemName={itemToRename?.name || ""}
        itemType={itemToRename?.type || "file"}
        onRename={handleRename}
      />
    </Card>
  )
}
