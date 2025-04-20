"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useAppContext } from "@/lib/app-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Folder,
  File,
  Search,
  Star,
  StarOff,
  RefreshCw,
  Clock,
  Upload,
  Square,
  CheckSquare,
  Brain,
  Sparkles,
  BarChart2,
} from "lucide-react"
import { MemoryStatus } from "@/components/memory-status"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { SearchResults } from "@/components/search-results"
import { useHotkeys } from "react-hotkeys-hook"
import { BulkActionsBar } from "@/components/bulk-actions-bar"
import { SortMenu, type SortConfig } from "@/components/sort-menu"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { FileGridItem } from "@/components/file-grid-item"
import type { FileInfo } from "@/lib/file-service"
import { CollapsiblePanel } from "@/components/collapsible-panel"
import { MemoryInsights } from "@/components/memory-insights"
import { FileRecommendations } from "@/components/file-recommendations"
import { UsageVisualizations } from "@/components/usage-visualizations"

// Update the component to support multi-select
export function FileExplorer() {
  const {
    files,
    currentPath,
    setCurrentPath,
    selectedFileId,
    setSelectedFileId,
    selectedFileIds,
    toggleFileSelection,
    setSelectedFileIds,
    clearFileSelection,
    refreshFiles,
    isLoading,
    error,
    favoriteFiles,
    addToFavorites,
    removeFromFavorites,
    recentFiles,
    searchHistory,
    addToSearchHistory,
    memoryStore,
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [showRecent, setShowRecent] = useState(false)
  const [filteredFiles, setFilteredFiles] = useState(files)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showMemoryInsights, setShowMemoryInsights] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showVisualizations, setShowVisualizations] = useState(false)

  // Add sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  })

  // Add view mode state
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  // Load sort preferences and view mode from memory
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load sort preferences
        const savedSort = await memoryStore.retrieveMemory<SortConfig>("sortPreferences")
        if (savedSort) {
          setSortConfig(savedSort)
        }

        // Load view mode
        const savedViewMode = await memoryStore.retrieveMemory<ViewMode>("viewMode")
        if (savedViewMode) {
          setViewMode(savedViewMode)
        }
      } catch (error) {
        console.warn("Failed to load preferences:", error)
      }
    }

    loadPreferences()
  }, [memoryStore])

  // Save sort preferences to memory
  const handleSortChange = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig)

    try {
      await memoryStore.storeMemory("sortPreferences", newSortConfig)
      await memoryStore.addMemory(`Changed sort order to ${newSortConfig.field} ${newSortConfig.direction}`)
    } catch (error) {
      console.warn("Failed to save sort preferences:", error)
    }
  }

  // Save view mode to memory
  const handleViewChange = async (newViewMode: ViewMode) => {
    setViewMode(newViewMode)

    try {
      await memoryStore.storeMemory("viewMode", newViewMode)
      await memoryStore.addMemory(`Changed view mode to ${newViewMode}`)
    } catch (error) {
      console.warn("Failed to save view mode:", error)
    }
  }

  // Add keyboard shortcuts for selection
  useHotkeys(
    "ctrl+a, meta+a",
    (e) => {
      e.preventDefault()
      // Select all files in the current view
      const fileIds = displayedFiles.map((file) => file.id)
      setSelectedFileIds(fileIds)
    },
    { enableOnFormTags: true },
  )

  useHotkeys(
    "escape",
    () => {
      // Clear selection when Escape is pressed
      if (selectedFileIds.length > 0) {
        clearFileSelection()
      }
    },
    { enableOnFormTags: true },
  )

  // Add keyboard shortcut for toggling view mode
  useHotkeys(
    "ctrl+g, meta+g",
    () => {
      handleViewChange(viewMode === "list" ? "grid" : "list")
    },
    { enableOnFormTags: true },
  )

  // Update filtered files when files or search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFiles(files)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = files.filter((file) => file.name.toLowerCase().includes(query))

    setFilteredFiles(filtered)
  }, [files, searchQuery])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery)
      setIsSearching(true)
    }
  }

  // Navigate to parent directory
  const navigateUp = () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/")
    setCurrentPath(parentPath || "/")
  }

  // Sort files based on current sort configuration
  const sortFiles = (filesToSort: FileInfo[]): FileInfo[] => {
    return [...filesToSort].sort((a, b) => {
      // Always put directories first
      if (a.type === "directory" && b.type !== "directory") return -1
      if (a.type !== "directory" && b.type === "directory") return 1

      // Then sort by the selected field
      let comparison = 0

      switch (sortConfig.field) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "lastModified":
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          break
        case "sizeInBytes":
          comparison = a.sizeInBytes - b.sizeInBytes
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      // Apply sort direction
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }

  // Get files to display based on current mode and apply sorting
  const displayedFiles = useMemo(() => {
    const filesToDisplay = showRecent ? recentFiles : filteredFiles
    return sortFiles(filesToDisplay)
  }, [filteredFiles, recentFiles, showRecent, sortConfig])

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploadDialogOpen(true)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }

  const handleSelectSearchResult = (fileId: string) => {
    setSelectedFileId(fileId)
    setIsSearching(false)
    setSearchQuery("")
  }

  // Function to toggle sidebar content
  const toggleSidebarContent = (content: "files" | "memory" | "recommendations" | "visualizations") => {
    setShowMemoryInsights(content === "memory")
    setShowRecommendations(content === "recommendations")
    setShowVisualizations(content === "visualizations")
  }

  // Update the file item rendering to support multi-select
  return (
    <>
      <CollapsiblePanel className="w-1/3 flex flex-col border-r overflow-hidden">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
            <Input placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={navigateUp} disabled={currentPath === "/"}>
                ..
              </Button>
              <span className="text-sm font-mono truncate">{currentPath}</span>
            </div>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRecent(!showRecent)}
                title={showRecent ? "Show current directory" : "Show recent files"}
              >
                <Clock className={`h-4 w-4 ${showRecent ? "text-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={refreshFiles} disabled={isLoading} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsUploadDialogOpen(true)} title="Upload files">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <MemoryStatus />
            <div className="flex items-center space-x-2">
              {/* Add toggle for visualizations */}
              <Button
                variant={showVisualizations ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("visualizations")}
                title="Usage Visualizations"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              {/* Add toggle for recommendations */}
              <Button
                variant={showRecommendations ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("recommendations")}
                title="Recommendations"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              {/* Toggle memory insights */}
              <Button
                variant={showMemoryInsights ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("memory")}
                title="Memory Insights"
              >
                <Brain className="h-4 w-4" />
              </Button>
              {/* Toggle back to files */}
              <Button
                variant={!showMemoryInsights && !showRecommendations && !showVisualizations ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("files")}
                title="Files"
              >
                <File className="h-4 w-4" />
              </Button>
              {/* Add view toggle */}
              <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
              {/* Sort menu */}
              <SortMenu currentSort={sortConfig} onSortChange={handleSortChange} />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

          {searchHistory.length > 0 && searchQuery && !isSearching && (
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

        <div className="flex-1 flex flex-col">
          {showMemoryInsights ? (
            <div className="flex-1 p-2">
              <MemoryInsights />
            </div>
          ) : showRecommendations ? (
            <div className="flex-1 p-2">
              <FileRecommendations />
            </div>
          ) : showVisualizations ? (
            <div className="flex-1 p-2">
              <UsageVisualizations />
            </div>
          ) : (
            <div
              className={`flex-1 overflow-y-auto p-2 ${isDraggingOver ? "bg-primary/10" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Add BulkActionsBar component */}
              <BulkActionsBar />

              {isDraggingOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg z-10 pointer-events-none">
                  <div className="text-center p-4 bg-background/80 rounded-lg shadow-sm">
                    <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
                    <p className="font-medium">Drop files to upload</p>
                  </div>
                </div>
              )}

              {isSearching ? (
                <SearchResults
                  query={searchQuery}
                  onSelectFile={handleSelectSearchResult}
                  onClearSearch={handleClearSearch}
                />
              ) : displayedFiles.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    {showRecent
                      ? "No recent files"
                      : searchQuery
                        ? "No files match your search"
                        : "No files in this directory"}
                  </CardContent>
                </Card>
              ) : viewMode === "grid" ? (
                // Grid view
                <div className="grid grid-cols-2 gap-3">
                  {displayedFiles.map((file) => (
                    <FileGridItem
                      key={file.id}
                      file={file}
                      isSelected={selectedFileIds.includes(file.id)}
                      isFavorite={favoriteFiles.includes(file.id)}
                      onSelect={(id, exclusive) => toggleFileSelection(id, exclusive)}
                      onToggleFavorite={(id) =>
                        favoriteFiles.includes(id) ? removeFromFavorites(id) : addToFavorites(id)
                      }
                      onDoubleClick={() => {
                        if (file.type === "directory") {
                          setCurrentPath(file.path)
                        } else {
                          setSelectedFileId(file.id)
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                // List view
                <div className="space-y-1">
                  {displayedFiles.map((file) => {
                    const isFavorite = favoriteFiles.includes(file.id)
                    const isSelected = selectedFileIds.includes(file.id)

                    return (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                          isSelected ? "bg-primary/10" : selectedFileId === file.id ? "bg-muted" : ""
                        }`}
                        onClick={(e) => {
                          // Handle selection based on modifier keys
                          if (e.ctrlKey || e.metaKey) {
                            // Ctrl/Cmd+click for toggling selection
                            toggleFileSelection(file.id)
                          } else if (e.shiftKey && selectedFileId) {
                            // Shift+click for range selection
                            const currentIndex = displayedFiles.findIndex((f) => f.id === selectedFileId)
                            const clickedIndex = displayedFiles.findIndex((f) => f.id === file.id)

                            if (currentIndex !== -1 && clickedIndex !== -1) {
                              const start = Math.min(currentIndex, clickedIndex)
                              const end = Math.max(currentIndex, clickedIndex)

                              const rangeIds = displayedFiles.slice(start, end + 1).map((f) => f.id)

                              setSelectedFileIds(rangeIds)
                            }
                          } else {
                            // Regular click for single selection
                            toggleFileSelection(file.id, true)
                          }
                        }}
                        onDoubleClick={() => {
                          // Handle double-click to open/navigate
                          if (file.type === "directory") {
                            setCurrentPath(file.path)
                          } else {
                            setSelectedFileId(file.id)
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {/* Add checkbox for selection */}
                          <div
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFileSelection(file.id)
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {file.type === "directory" ? (
                            <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>

                        <div className="flex items-center">
                          {/* Add file size and date info */}
                          <div className="text-xs text-muted-foreground mr-2 hidden sm:block">
                            <span className="mr-2">{file.size}</span>
                            <span>{file.lastModified}</span>
                          </div>
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
          )}
        </div>
      </CollapsiblePanel>

      <FileUploadDialog isOpen={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} />
    </>
  )
}

export default FileExplorer
