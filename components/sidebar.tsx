"use client"

import { Clock, Star, Settings, HelpCircle, Search, Trash2, Brain } from "lucide-react"
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
import { useState } from "react"

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

  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false)

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

  // Ensure all arrays are defined before accessing their properties
  const safeRecentFiles = recentFiles || []
  const safeFrequentFiles = frequentFiles || []
  const safeSuggestedFiles = suggestedFiles || []
  const safeFavoriteFiles = favoriteFiles || []
  const safeRecentSearches = recentSearches || []

  return (
    <div className="w-64 border-r bg-muted/10 p-4 flex flex-col h-full">
      <h2 className="font-semibold mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-primary" />
        Smart File Manager
      </h2>

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
                This will clear all your memory data including recent files, favorites, and search history. This action
                cannot be undone.
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
    </div>
  )
}
