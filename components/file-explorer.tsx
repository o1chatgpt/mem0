"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileIcon, FolderIcon, PlusCircle, Trash2, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react"
import type { FileSystemItem, FileType } from "@/types/file-system"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface FileExplorerProps {
  items: FileSystemItem[]
  currentPath: string
  selectedItem: string | null
  onSelectItem: (path: string) => void
  onCreateItem: (name: string, type: FileType) => void
  onDeleteItem: (path: string) => void
  onNavigate: (path: string) => void
  onMoveItem: (sourcePath: string, targetPath: string) => void
}

export function FileExplorer({
  items,
  currentPath,
  selectedItem,
  onSelectItem,
  onCreateItem,
  onDeleteItem,
  onNavigate,
  onMoveItem,
}: FileExplorerProps) {
  const [newItemName, setNewItemName] = useState("")
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [newItemType, setNewItemType] = useState<FileType>("file")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([currentPath]))
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleCreateItem = () => {
    if (newItemName.trim()) {
      onCreateItem(newItemName.trim(), newItemType)
      setNewItemName("")
      setIsCreatingItem(false)
    }
  }

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.dataTransfer.setData("text/plain", path)
    e.dataTransfer.effectAllowed = "move"
    setDraggedItem(path)
  }

  const handleDragOver = (e: React.DragEvent, path: string, isDirectory: boolean) => {
    e.preventDefault()
    e.stopPropagation()

    // Only allow dropping into directories
    if (isDirectory && draggedItem !== path) {
      e.dataTransfer.dropEffect = "move"
      setDropTarget(path)
      setIsDraggingOver(true)
    } else {
      e.dataTransfer.dropEffect = "none"
    }
  }

  const handleDragEnter = (e: React.DragEvent, path: string, isDirectory: boolean) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDirectory && draggedItem !== path) {
      setDropTarget(path)
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault()
    e.stopPropagation()

    const sourcePath = e.dataTransfer.getData("text/plain")

    if (sourcePath && targetPath && sourcePath !== targetPath) {
      onMoveItem(sourcePath, targetPath)
    }

    setDraggedItem(null)
    setDropTarget(null)
    setIsDraggingOver(false)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropTarget(null)
    setIsDraggingOver(false)
  }

  const renderFileItem = (item: FileSystemItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.path)
    const isDirectory = item.type === "directory"
    const isDragging = draggedItem === item.path
    const isDropTargetItem = dropTarget === item.path && isDraggingOver

    return (
      <li key={item.path} className={isDragging ? "opacity-50" : ""}>
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-md text-sm cursor-pointer",
            selectedItem === item.path ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900",
            isDropTargetItem ? "bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700" : "",
          )}
          style={{ paddingLeft: `${(depth + 1) * 8}px` }}
          onClick={() => (isDirectory ? onNavigate(item.path) : onSelectItem(item.path))}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.path)}
          onDragOver={(e) => handleDragOver(e, item.path, isDirectory)}
          onDragEnter={(e) => handleDragEnter(e, item.path, isDirectory)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.path)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-center flex-1 overflow-hidden">
            {isDirectory && (
              <span className="mr-1 cursor-pointer" onClick={(e) => toggleFolder(item.path, e)}>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </span>
            )}
            {isDirectory ? (
              <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            ) : (
              <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteItem(item.path)
            }}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {isDirectory && isExpanded && item.children && item.children.length > 0 && (
          <ul className="space-y-1 mt-1">{item.children.map((child) => renderFileItem(child, depth + 1))}</ul>
        )}
      </li>
    )
  }

  const canNavigateUp = currentPath !== "/"

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {canNavigateUp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentPath.split("/").slice(0, -1).join("/") || "/")}
              className="h-8 w-8 p-0 mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h3 className="text-sm font-medium truncate">{currentPath === "/" ? "Root" : currentPath}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setNewItemType("file")
                setIsCreatingItem(true)
              }}
            >
              <FileIcon className="h-4 w-4 mr-2" />
              New File
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setNewItemType("directory")
                setIsCreatingItem(true)
              }}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isCreatingItem && (
        <div className="flex items-center mb-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={newItemType === "file" ? "filename.js" : "folder-name"}
            className="text-sm h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateItem()
              if (e.key === "Escape") setIsCreatingItem(false)
            }}
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={handleCreateItem} className="ml-1 h-8">
            Add
          </Button>
        </div>
      )}

      <ScrollArea
        className={cn(
          "h-[calc(100%-2rem)] border rounded-md p-2",
          isDraggingOver && dropTarget === currentPath
            ? "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
            : "",
        )}
        onDragOver={(e) => handleDragOver(e, currentPath, true)}
        onDragEnter={(e) => handleDragEnter(e, currentPath, true)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, currentPath)}
      >
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            No files or folders yet. Create or upload to get started.
          </div>
        ) : (
          <ul className="space-y-1">{items.map((item) => renderFileItem(item))}</ul>
        )}
      </ScrollArea>
    </div>
  )
}
