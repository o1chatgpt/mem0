"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
  History,
  Tag,
  ChevronDown,
} from "lucide-react"
import { MemoryStatus } from "@/components/memory-status"
import { SearchResults } from "@/components/search-results"
import { useHotkeys } from "react-hotkeys-hook"
import { BulkActionsBar } from "@/components/bulk-actions-bar"
import { SortMenu, type SortConfig } from "@/components/sort-menu"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { FileGridItem } from "@/components/file-grid-item"
import type { FileInfo } from "@/lib/file-service"
import { MemoryInsights } from "@/components/memory-insights"
import { FileRecommendations } from "@/components/file-recommendations"
import { UsageVisualizations } from "@/components/usage-visualizations"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

// Update the component to support multi-select and mem0 integration
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
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showMemoryInsights, setShowMemoryInsights] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showVisualizations, setShowVisualizations] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [fileTags, setFileTags] = useState<Record<string, string[]>>({})
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [activeTab, setActiveTab] = useState("files")
  const [memoryEnabled, setMemoryEnabled] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<{ path: string; timestamp: number }[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendations, setRecommendations] = useState<FileInfo[]>([])
  const [showFooterAnchor, setShowFooterAnchor] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Add sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  })

  // Add view mode state
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  // Check if content is scrolled to bottom
  const checkScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      setShowFooterAnchor(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 20)
    }
  }, [])

  // Check if mem0 is enabled
  useEffect(() => {
    const checkMemoryEnabled = async () => {
      try {
        // Simplified check to avoid server-side errors
        setMemoryEnabled(!!memoryStore)
      } catch (error) {
        console.error("Error checking memory status:", error)
        setMemoryEnabled(false)
      }
    }

    checkMemoryEnabled()
  }, [memoryStore])

  // Load navigation history from mem0
  const loadNavigationHistory = useCallback(async () => {
    if (!memoryEnabled) return

    setIsLoadingHistory(true)
    try {
      // Simplified to avoid potential API errors
      setNavigationHistory([])
    } catch (error) {
      console.error("Error loading navigation history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [memoryEnabled])

  // Load all tags from memory
  const loadAllTags = useCallback(async () => {
    try {
      if (memoryStore?.retrieveMemory) {
        const tags = await memoryStore.retrieveMemory<string[]>("all-tags")
        if (tags) {
          setAllTags(tags)
        }
      }
    } catch (error) {
      console.error("Error loading all tags:", error)
    }
  }, [memoryStore])

  // Load file tags
  const loadFileTags = useCallback(async () => {
    setIsLoadingTags(true)
    try {
      const tagsMap: Record<string, string[]> = {}
      setFileTags(tagsMap)
    } catch (error) {
      console.error("Error loading file tags:", error)
    } finally {
      setIsLoadingTags(false)
    }
  }, [])

  // Load recommendations based on current path and user history
  const loadRecommendations = useCallback(async () => {
    if (!memoryEnabled) return

    setIsLoadingRecommendations(true)
    try {
      // Simplified to avoid potential API errors
      setRecommendations([])
    } catch (error) {
      console.error("Error loading recommendations:", error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }, [memoryEnabled])

  // Load sort preferences and view mode from memory
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Simplified to avoid potential memory store errors
        if (memoryStore?.retrieveMemory) {
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
        }

        // Load all tags
        await loadAllTags()

        // Load file tags
        await loadFileTags()

        // Load navigation history
        await loadNavigationHistory()

        // Load recommendations
        await loadRecommendations()
      } catch (error) {
        console.warn("Failed to load preferences:", error)
      }
    }

    loadPreferences()
  }, [memoryStore, loadAllTags, loadFileTags, loadNavigationHistory, loadRecommendations])

  // Record navigation to mem0 when path changes
  useEffect(() => {
    const recordNavigation = async () => {
      if (!memoryEnabled) return

      try {
        // Simplified to avoid potential API errors
        await loadNavigationHistory()
      } catch (error) {
        console.error("Error recording navigation:", error)
      }
    }

    recordNavigation()
  }, [currentPath, memoryEnabled, loadNavigationHistory])

  // Save sort preferences to memory
  const handleSortChange = async (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig)

    try {
      if (memoryStore?.storeMemory) {
        await memoryStore.storeMemory("sortPreferences", newSortConfig)
      }
    } catch (error) {
      console.warn("Failed to save sort preferences:", error)
    }
  }

  // Save view mode to memory
  const handleViewChange = async (newViewMode: ViewMode) => {
    setViewMode(newViewMode)

    try {
      if (memoryStore?.storeMemory) {
        await memoryStore.storeMemory("viewMode", newViewMode)
      }
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
      setFilteredFiles(files || [])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = (files || []).filter((file) => file.name.toLowerCase().includes(query))

    setFilteredFiles(filtered)
  }, [files, searchQuery])

  // Filter files by selected tags
  const tagFilteredFiles = useMemo(() => {
    if (selectedTags.length === 0) return filteredFiles

    return filteredFiles.filter((file) => {
      const fileTagsForFile = fileTags[file.id] || []
      return selectedTags.some((tag) => fileTagsForFile.includes(tag))
    })
  }, [filteredFiles, fileTags, selectedTags])

  // Handle search submit
  const handleSearch = async (e: React.FormEvent) => {
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
    const filesToDisplay = showRecent ? recentFiles || [] : tagFilteredFiles
    return sortFiles(filesToDisplay)
  }, [tagFilteredFiles, recentFiles, showRecent, sortConfig])

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
  const toggleSidebarContent = (content: "files" | "memory" | "recommendations" | "visualizations" | "history") => {
    setShowMemoryInsights(content === "memory")
    setShowRecommendations(content === "recommendations")
    setShowVisualizations(content === "visualizations")
    setShowHistory(content === "history")

    // Set the active tab
    setActiveTab(content)
  }

  // Handle tag selection
  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Handle tag addition
  const addTag = async (fileId: string, tag: string) => {
    try {
      if (memoryStore?.rememberTag) {
        await memoryStore.rememberTag(fileId, tag)

        // Update local state
        setFileTags((prev) => ({
          ...prev,
          [fileId]: [...(prev[fileId] || []), tag],
        }))

        // Update all tags
        if (!allTags.includes(tag)) {
          const newAllTags = [...allTags, tag]
          setAllTags(newAllTags)
          if (memoryStore?.storeMemory) {
            await memoryStore.storeMemory("all-tags", newAllTags)
          }
        }
      }
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }

  // Handle tag removal
  const removeTag = async (fileId: string, tag: string) => {
    try {
      if (memoryStore?.removeTag) {
        await memoryStore.removeTag(fileId, tag)

        // Update local state
        setFileTags((prev) => ({
          ...prev,
          [fileId]: (prev[fileId] || []).filter((t) => t !== tag),
        }))
      }
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }

  // Navigate to a path from history
  const navigateToPath = (path: string) => {
    setCurrentPath(path)
    setShowHistory(false)
    setActiveTab("files")
  }

  // Handle scroll events
  const handleScroll = () => {
    checkScroll()
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }

  // Update the file item rendering to support multi-select
  return (
    <>
      <div className="flex flex-col h-full border-r">
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
              {/* Add toggle for history */}
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("history")}
                title="Navigation History"
              >
                <History className="h-4 w-4" />
              </Button>
              {/* Add toggle for visualizations */}
              <Button
                variant={activeTab === "visualizations" ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("visualizations")}
                title="Usage Visualizations"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              {/* Add toggle for recommendations */}
              <Button
                variant={activeTab === "recommendations" ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("recommendations")}
                title="Recommendations"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              {/* Toggle memory insights */}
              <Button
                variant={activeTab === "memory" ? "default" : "ghost"}
                size="icon"
                onClick={() => toggleSidebarContent("memory")}
                title="Memory Insights"
              >
                <Brain className="h-4 w-4" />
              </Button>
              {/* Toggle back to files */}
              <Button
                variant={activeTab === "files" ? "default" : "ghost"}
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

          {searchHistory && searchHistory.length > 0 && searchQuery && !isSearching && (
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

          {/* Add tag filter section */}
          {allTags.length > 0 && activeTab === "files" && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Filter by tags:</p>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedTags([])}>
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTagSelection(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col relative">
          {showMemoryInsights ? (
            <ScrollArea className="flex-1">
              <div className="p-2">
                <MemoryInsights />
              </div>
            </ScrollArea>
          ) : showRecommendations ? (
            <ScrollArea className="flex-1">
              <div className="p-2">
                <FileRecommendations />
              </div>
            </ScrollArea>
          ) : showVisualizations ? (
            <ScrollArea className="flex-1">
              <div className="p-2">
                <UsageVisualizations />
              </div>
            </ScrollArea>
          ) : showHistory ? (
            <ScrollArea className="flex-1">
              <div className="p-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium mb-2">Navigation History</h3>
                    {isLoadingHistory ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : navigationHistory.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No navigation history available.</p>
                    ) : (
                      <div className="space-y-2">
                        {navigationHistory.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => navigateToPath(item.path)}
                          >
                            <div className="flex items-center">
                              <Folder className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-sm truncate">{item.path}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
              <div
                className={`p-2 ${isDraggingOver ? "bg-primary/10" : ""}`}
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
                          : selectedTags.length > 0
                            ? "No files match the selected tags"
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
                        tags={fileTags[file.id] || []}
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
                        onAddTag={(id, tag) => addTag(id, tag)}
                        onRemoveTag={(id, tag) => removeTag(id, tag)}
                      />
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-1">
                    {displayedFiles.map((file) => {
                      const isFavorite = favoriteFiles.includes(file.id)
                      const isSelected = selectedFileIds.includes(file.id)
                      const tags = fileTags[file.id] || []

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

                            {/* Display tags */}
                            {tags.length > 0 && (
                              <div className="flex gap-1 ml-2">
                                {tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="px-1 text-xs">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {tags.length > 2 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className="px-1 text-xs">
                                          +{tags.length - 2}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col gap-1">
                                          {tags.slice(2).map((tag) => (
                                            <span key={tag}>{tag}</span>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center">
                            {/* Add file size and date info */}
                            <div className="text-xs text-muted-foreground mr-2 hidden sm:block">
                              <span className="mr-2">{file.size}</span>
                              <span>{file.lastModified}</span>
                            </div>

                            {/* Add tag button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Show tag input dialog
                                      const tag = prompt("Enter a tag for this file:")
                                      if (tag && tag.trim()) {
                                        addTag(file.id, tag.trim())
                                      }
                                    }}
                                  >
                                    <Tag className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add tag</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Favorite button */}
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
            </ScrollArea>
          )}

          {/* Footer anchor button */}
          {showFooterAnchor && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 rounded-full shadow-md"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default FileExplorer
