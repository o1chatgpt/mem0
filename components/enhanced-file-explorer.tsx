"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, File, Search, Star, StarOff, RefreshCw, Upload, Plus, Filter, SortAsc, SortDesc } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MemoryStatus } from "@/components/memory-status"
import { smartMemoryService } from "@/lib/smart-memory-service"
import type { FileInfo } from "@/lib/file-service"

// Define file format types
export type FileFormat = "markdown" | "yaml" | "json" | "jsonl" | "jsonb" | "env" | "txt" | "other"

// File type icons mapping
const fileTypeIcons: Record<string, JSX.Element> = {
  directory: <Folder className="h-4 w-4 text-blue-500" />,
  markdown: <File className="h-4 w-4 text-purple-500" />,
  yaml: <File className="h-4 w-4 text-green-500" />,
  json: <File className="h-4 w-4 text-amber-500" />,
  jsonl: <File className="h-4 w-4 text-orange-500" />,
  jsonb: <File className="h-4 w-4 text-red-500" />,
  env: <File className="h-4 w-4 text-cyan-500" />,
  text: <File className="h-4 w-4 text-gray-500" />,
  image: <File className="h-4 w-4 text-pink-500" />,
  code: <File className="h-4 w-4 text-indigo-500" />,
  default: <File className="h-4 w-4 text-gray-500" />,
}

export function EnhancedFileExplorer() {
  const {
    files,
    currentPath,
    setCurrentPath,
    selectedFileId,
    setSelectedFileId,
    refreshFiles,
    isLoading,
    error,
    favoriteFiles,
    addToFavorites,
    removeFromFavorites,
    recentFiles,
    searchHistory,
    addToSearchHistory,
    fileService,
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<"files" | "recent" | "favorites" | "ai-suggested">("files")
  const [filteredFiles, setFilteredFiles] = useState(files)
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState<FileFormat | "all">("all")
  const [aiSuggestedFiles, setAiSuggestedFiles] = useState<FileInfo[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Update filtered files when files or search query changes
  useEffect(() => {
    let result = [...files]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((file) => file.name.toLowerCase().includes(query))
    }

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter((file) => getFileFormat(file) === filterType)
    }

    // Apply sorting
    result = sortFiles(result, sortBy, sortDirection)

    setFilteredFiles(result)
  }, [files, searchQuery, sortBy, sortDirection, filterType])

  // Load AI suggested files
  useEffect(() => {
    const loadSuggestedFiles = async () => {
      try {
        // This would normally come from an AI recommendation system
        // For now, we'll just use the most recently accessed files
        const recentFileIds = await smartMemoryService.getRecentFiles()
        const suggested = recentFileIds
          .map((recent) => files.find((file) => file.id === recent.id))
          .filter((file): file is FileInfo => !!file)
          .slice(0, 5)

        setAiSuggestedFiles(suggested)
      } catch (error) {
        console.error("Error loading suggested files:", error)
      }
    }

    loadSuggestedFiles()
  }, [files])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery)
    }
  }

  // Navigate to parent directory
  const navigateUp = () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/")
    setCurrentPath(parentPath || "/")
  }

  // Get file format based on file extension
  const getFileFormat = (file: FileInfo): FileFormat => {
    if (file.type === "directory") return "other"

    const extension = file.name.split(".").pop()?.toLowerCase() || ""

    if (extension === "md" || extension === "markdown") return "markdown"
    if (extension === "yml" || extension === "yaml") return "yaml"
    if (extension === "json") return "json"
    if (extension === "jsonl") return "jsonl"
    if (extension === "jsonb") return "jsonb"
    if (extension.includes("env")) return "env"
    if (extension === "txt") return "txt"

    return "other"
  }

  // Sort files based on criteria
  const sortFiles = (filesToSort: FileInfo[], by: string, direction: "asc" | "desc"): FileInfo[] => {
    return [...filesToSort].sort((a, b) => {
      // Always put directories first
      if (a.type === "directory" && b.type !== "directory") return -1
      if (a.type !== "directory" && b.type === "directory") return 1

      let comparison = 0

      switch (by) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          break
        case "size":
          comparison = a.sizeInBytes - b.sizeInBytes
          break
        case "type":
          comparison = getFileFormat(a).localeCompare(getFileFormat(b))
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await fileService.uploadFile(file)
      }

      await refreshFiles()
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  // Create new file
  const createNewFile = (format: FileFormat) => {
    const extensions: Record<FileFormat, string> = {
      markdown: "md",
      yaml: "yaml",
      json: "json",
      jsonl: "jsonl",
      jsonb: "jsonb",
      env: "env",
      txt: "txt",
      other: "txt",
    }

    const extension = extensions[format]
    const newFileName = `new-file-${Date.now()}.${extension}`
    const newFilePath = `${currentPath}/${newFileName}`.replace(/\/+/g, "/")

    // Create initial content based on format
    let initialContent = ""
    switch (format) {
      case "markdown":
        initialContent = "# New Document\n\n## Section 1\n\nStart writing here...\n"
        break
      case "yaml":
        initialContent = "# YAML Document\nkey: value\nlist:\n  - item1\n  - item2\n"
        break
      case "json":
        initialContent = '{\n  "key": "value",\n  "array": [1, 2, 3],\n  "nested": {\n    "property": true\n  }\n}'
        break
      case "jsonl":
        initialContent = '{"id": 1, "name": "Example 1"}\n{"id": 2, "name": "Example 2"}\n'
        break
      case "jsonb":
        initialContent = '{"data": {"binary": true, "format": "JSONB"}}'
        break
      case "env":
        initialContent = "# Environment Variables\nAPI_KEY=your_api_key_here\nDEBUG=false\n"
        break
      default:
        initialContent = ""
    }

    fileService
      .createFile(newFilePath, initialContent)
      .then((newFileId) => {
        refreshFiles()
        // Select the new file
        if (typeof newFileId === "string") {
          setSelectedFileId(newFileId)
        }
      })
      .catch((error) => {
        console.error("Error creating file:", error)
      })
  }

  // Get files to display based on current view
  const getDisplayedFiles = () => {
    switch (activeView) {
      case "recent":
        return recentFiles
      case "favorites":
        return files.filter((file) => favoriteFiles.includes(file.id))
      case "ai-suggested":
        return aiSuggestedFiles
      default:
        return filteredFiles
    }
  }

  const displayedFiles = getDisplayedFiles()

  // Get file icon based on type
  const getFileIcon = (file: FileInfo) => {
    if (file.type === "directory") return fileTypeIcons.directory

    const format = getFileFormat(file)
    return fileTypeIcons[format] || fileTypeIcons.default
  }

  return (
    <div className="w-1/3 flex flex-col border-r overflow-hidden">
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
          <Input placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={navigateUp} disabled={currentPath === "/"}>
              ..
            </Button>
            <span className="text-sm font-mono truncate">{currentPath}</span>
          </div>

          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={refreshFiles} disabled={isLoading} title="Refresh">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Sort and Filter">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort and Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-2">
                  <p className="text-xs mb-1">Sort by</p>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-2">
                  <p className="text-xs mb-1">Direction</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={sortDirection === "asc" ? "default" : "outline"}
                      onClick={() => setSortDirection("asc")}
                      className="w-full"
                    >
                      <SortAsc className="h-4 w-4 mr-1" /> Asc
                    </Button>
                    <Button
                      size="sm"
                      variant={sortDirection === "desc" ? "default" : "outline"}
                      onClick={() => setSortDirection("desc")}
                      className="w-full"
                    >
                      <SortDesc className="h-4 w-4 mr-1" /> Desc
                    </Button>
                  </div>
                </div>

                <div className="p-2">
                  <p className="text-xs mb-1">Filter by type</p>
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="jsonl">JSONL</SelectItem>
                      <SelectItem value="jsonb">JSONB</SelectItem>
                      <SelectItem value="env">ENV</SelectItem>
                      <SelectItem value="txt">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Create New">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => createNewFile("markdown")}>
                  {fileTypeIcons.markdown} <span className="ml-2">Markdown</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("yaml")}>
                  {fileTypeIcons.yaml} <span className="ml-2">YAML</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("json")}>
                  {fileTypeIcons.json} <span className="ml-2">JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("jsonl")}>
                  {fileTypeIcons.jsonl} <span className="ml-2">JSONL</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("jsonb")}>
                  {fileTypeIcons.jsonb} <span className="ml-2">JSONB</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("env")}>
                  {fileTypeIcons.env} <span className="ml-2">ENV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createNewFile("txt")}>
                  {fileTypeIcons.text} <span className="ml-2">Text</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <input
                type="file"
                id="file-upload"
                multiple
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button variant="ghost" size="icon" title="Upload Files" disabled={isUploading}>
                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="files" className="flex-1">
              Files
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Recent
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1">
              Favorites
            </TabsTrigger>
            <TabsTrigger value="ai-suggested" className="flex-1">
              AI Suggested
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <MemoryStatus />

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        {searchHistory.length > 0 && searchQuery && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-1">Recent searches:</p>
            <div className="flex flex-wrap gap-1">
              {searchHistory.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setSearchQuery(query)}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {displayedFiles.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {activeView === "recent"
                ? "No recent files"
                : activeView === "favorites"
                  ? "No favorite files"
                  : activeView === "ai-suggested"
                    ? "No suggested files"
                    : searchQuery
                      ? "No files match your search"
                      : "No files in this directory"}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {displayedFiles.map((file) => {
              const isFavorite = favoriteFiles.includes(file.id)

              return (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedFileId === file.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {getFileIcon(file)}
                    <span className="truncate">{file.name}</span>
                  </div>

                  <div className="flex items-center">
                    {activeView === "ai-suggested" && (
                      <Badge variant="outline" className="mr-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        isFavorite ? removeFromFavorites(file.id) : addToFavorites(file.id)
                      }}
                    >
                      {isFavorite ? (
                        <Star className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
