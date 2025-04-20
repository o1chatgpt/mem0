"use client"

import type React from "react"

import { useState } from "react"
import { Folder, MoreVertical, FileText, FileImage, FileArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMem0 } from "@/components/mem0/mem0-provider"

type FileItem = {
  id: string
  name: string
  type: "file"
  size: string
  modified: string
  icon: React.ReactNode
}

type FolderItem = {
  id: string
  name: string
  type: "folder"
  items: number
  modified: string
  icon: React.ReactNode
}

type FileExplorerProps = {
  onFileOpen?: (file: FileItem) => void
  onFolderOpen?: (folder: FolderItem) => void
}

export function FileExplorer({ onFileOpen, onFolderOpen }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"])
  const { addMemory, isInitialized } = useMem0()

  // Sample data - in a real app, this would come from an API
  const folders: FolderItem[] = [
    {
      id: "f1",
      name: "Documents",
      type: "folder",
      items: 15,
      modified: "2023-04-12",
      icon: <Folder className="h-4 w-4" />,
    },
    {
      id: "f2",
      name: "Images",
      type: "folder",
      items: 32,
      modified: "2023-04-10",
      icon: <Folder className="h-4 w-4" />,
    },
    {
      id: "f3",
      name: "Projects",
      type: "folder",
      items: 8,
      modified: "2023-04-05",
      icon: <Folder className="h-4 w-4" />,
    },
  ]

  const files: FileItem[] = [
    {
      id: "file1",
      name: "Report.docx",
      type: "file",
      size: "245 KB",
      modified: "2023-04-11",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "file2",
      name: "Presentation.pptx",
      type: "file",
      size: "1.2 MB",
      modified: "2023-04-09",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "file3",
      name: "Budget.xlsx",
      type: "file",
      size: "380 KB",
      modified: "2023-04-08",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "file4",
      name: "Logo.png",
      type: "file",
      size: "1.5 MB",
      modified: "2023-04-07",
      icon: <FileImage className="h-4 w-4" />,
    },
    {
      id: "file5",
      name: "Archive.zip",
      type: "file",
      size: "4.2 MB",
      modified: "2023-04-06",
      icon: <FileArchive className="h-4 w-4" />,
    },
  ]

  const handleFileClick = (file: FileItem) => {
    if (onFileOpen) {
      onFileOpen(file)
    }

    // Record this interaction in mem0
    if (isInitialized) {
      addMemory(`User opened file: ${file.name} in ${currentPath.join("/")}`)
    }
  }

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentPath([...currentPath, folder.name])

    if (onFolderOpen) {
      onFolderOpen(folder)
    }

    // Record this interaction in mem0
    if (isInitialized) {
      addMemory(`User navigated to folder: ${folder.name} from ${currentPath.join("/")}`)
    }
  }

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1))

    // Record this interaction in mem0
    if (isInitialized) {
      addMemory(`User navigated to path: ${currentPath.slice(0, index + 1).join("/")}`)
    }
  }

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-4 text-sm">
        {currentPath.map((path, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigateToPath(index)}>
              {path}
            </Button>
          </div>
        ))}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Folders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer group"
                onClick={() => handleFolderClick(folder)}
              >
                {folder.icon}
                <span className="ml-2 flex-1 truncate">{folder.name}</span>
                <span className="text-xs text-muted-foreground">{folder.items} items</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer group"
                onClick={() => handleFileClick(file)}
              >
                {file.icon}
                <span className="ml-2 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{file.size}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
