"use client"

import { Clock, Star, Settings, HelpCircle, Search, Trash2, Brain, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/lib/app-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"
import { MemoryStats } from "@/components/memory-stats"
import { MemoryRecommendations } from "@/components/memory-recommendations"
import { cn } from "@/lib/utils"

// Import the storage utility functions at the top of the file
import { getStorageItem, setStorageItem, isStorageAvailable } from "@/lib/storage-utils"

// Constants for localStorage keys and default values
const STORAGE_KEY_WIDTH = "sidebar-width"
const STORAGE_KEY_COLLAPSED = "sidebar-collapsed"
const DEFAULT_WIDTH = 256
const MIN_WIDTH = 180
const MAX_WIDTH = 400
const COLLAPSED_WIDTH = 64

export function Sidebar() {
  // Destructure with default empty arrays to prevent undefined errors
  const {
    recentFiles = [],
    frequentFiles = [],
    suggestedFiles = [],
    favoriteFiles = [],
    recentSearches = [],
    setSelectedFileId,
    setSearchQuery,
    memoryStore,
  } = useAppContext()

  // Initialize state with values from localStorage or defaults
  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const lastSavedWidth = useRef(DEFAULT_WIDTH)

  // Load saved preferences from localStorage on initial render
  useEffect(() => {
    if (!isStorageAvailable()) return

    // Load sidebar width
    const savedWidth = getStorageItem(STORAGE_KEY_WIDTH, DEFAULT_WIDTH)
    if (savedWidth >= MIN_WIDTH && savedWidth <= MAX_WIDTH) {
      setSidebarWidth(savedWidth)
      lastSavedWidth.current = savedWidth
    }

    // Load collapsed state
    const savedCollapsed = getStorageItem(STORAGE_KEY_COLLAPSED, false)
    setIsCollapsed(savedCollapsed)
  }, [])

  // Save sidebar width to localStorage when it changes
  useEffect(() => {
    if (!isStorageAvailable()) return

    // Only save if width has changed significantly (to reduce localStorage writes)
    if (Math.abs(sidebarWidth - lastSavedWidth.current) > 5) {
      setStorageItem(STORAGE_KEY_WIDTH, sidebarWidth)
      lastSavedWidth.current = sidebarWidth
    }
  }, [sidebarWidth])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    if (isStorageAvailable()) {
      setStorageItem(STORAGE_KEY_COLLAPSED, isCollapsed)
    }
  }, [isCollapsed])

  const handleClearMemory = async () => {
    try {
      if (memoryStore) {
        await memoryStore.clearMemory?.() // Optional chaining in case method doesn't exist
      }
      setIsMemoryDialogOpen(false)
      window.location.reload() // Reload to reset all state
    } catch (error) {
      console.error("Error clearing memory:", error)
    }
  }

  // Handle resize functionality
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isResizing.current = true
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return

      // Calculate new width based on mouse position
      const newWidth = e.clientX

      // Set min and max constraints
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      if (isResizing.current && isStorageAvailable()) {
        // Save the final width to localStorage
        setStorageItem(STORAGE_KEY_WIDTH, sidebarWidth)
        lastSavedWidth.current = sidebarWidth
      }

      isResizing.current = false
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    const resizeHandle = resizeRef.current
    if (resizeHandle) {
      resizeHandle.addEventListener("mousedown", handleMouseDown)
    }

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener("mousedown", handleMouseDown)
      }
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [sidebarWidth])

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Ensure all arrays are defined before accessing their properties
  const safeRecentFiles = recentFiles || []
  const safeFrequentFiles = frequentFiles || []
  const safeSuggestedFiles = suggestedFiles || []
  const safeFavoriteFiles = favoriteFiles || []
  const safeRecentSearches = recentSearches || []

  return (
    <div className="relative flex h-full">
      <div
        ref={sidebarRef}
        className={cn(
          "border-r bg-muted/10 flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-16" : "overflow-y-auto",
        )}
        style={{ width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${sidebarWidth}px` }}
      >
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn("font-semibold flex items-center", isCollapsed && "justify-center")}>
              <Brain className="h-5 w-5 mr-2 text-primary" />
              {!isCollapsed && "Smart File Manager"}
            </h2>
          </div>

          {!isCollapsed && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Favorites
                </h3>
                <div className="space-y-1">
                  {safeFavoriteFiles.length > 0 ? (
                    safeFavoriteFiles.map((file) => (
                      <Button
                        key={file.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-1.5"
                        onClick={() => setSelectedFileId(file.id)}
                      >
                        <span className="truncate">{file.name}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No favorite files</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Files
                </h3>
                <div className="space-y-1">
                  {safeRecentFiles.length > 0 ? (
                    safeRecentFiles.map((file) => (
                      <Button
                        key={file.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-1.5"
                        onClick={() => setSelectedFileId(file.id)}
                      >
                        <span className="truncate">{file.name}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No recent files</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Star className="h-4 w-4 mr-2" />
                  Frequent Files
                </h3>
                <div className="space-y-1">
                  {safeFrequentFiles.length > 0 ? (
                    safeFrequentFiles.map((file) => (
                      <Button
                        key={file.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-1.5"
                        onClick={() => setSelectedFileId(file.id)}
                      >
                        <span className="truncate">{file.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{file.accessCount}×</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No frequent files</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  Suggested Files
                </h3>
                <div className="space-y-1">
                  {safeSuggestedFiles.length > 0 ? (
                    safeSuggestedFiles.map((file) => (
                      <Button
                        key={file.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-1.5"
                        onClick={() => setSelectedFileId(file.id)}
                      >
                        <span className="truncate">{file.name}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No suggestions yet</p>
                  )}
                </div>
              </div>

              <MemoryRecommendations />

              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Search className="h-4 w-4 mr-2" />
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {safeRecentSearches.length > 0 ? (
                    safeRecentSearches.map((query, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-1.5"
                        onClick={() => setSearchQuery?.(query)}
                      >
                        <span className="truncate">{query}</span>
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No recent searches</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  Memory Stats
                </h3>
                <MemoryStats />
              </div>

              <div className="mt-auto space-y-2">
                <Dialog open={isMemoryDialogOpen} onOpenChange={setIsMemoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Memory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Memory</DialogTitle>
                      <DialogDescription>
                        This will clear all your memory data including recent files, favorites, and search history. This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsMemoryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearMemory}>
                        Clear Memory
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
              </div>
            </>
          )}

          {isCollapsed && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Star className="h-5 w-5 text-yellow-400" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Clock className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Brain className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/30 active:bg-primary/50 transition-colors",
          isCollapsed ? "left-16" : "left-auto",
        )}
        style={{ left: isCollapsed ? undefined : `${sidebarWidth}px` }}
        title="Drag to resize sidebar"
      ></div>

      {/* Collapse/Expand button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-4 rounded-full bg-muted/20 hover:bg-muted/30 z-10",
          isCollapsed ? "left-12 -translate-x-1/2" : "left-auto",
        )}
        style={{ left: isCollapsed ? undefined : `${sidebarWidth}px` }}
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  )
}
