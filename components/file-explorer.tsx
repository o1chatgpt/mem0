"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/db"
import { ChevronRight, Folder, ArrowLeft, Plus, Upload, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
}

export function FileExplorer({ userId }: { userId: number }) {
  const [currentFolder, setCurrentFolder] = useState<number | null>(null)
  const [folderPath, setFolderPath] = useState<FolderType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [loading, setLoading] = useState(true)

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
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button variant="outline" size="sm">
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
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Move</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                <div className="flex items-center">
                  <div className="mr-3 text-lg">{getFileIcon(file.mime_type)}</div>
                  <div>
                    <div>{file.name}</div>
                    <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Move</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
