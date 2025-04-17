"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useAppContext } from "@/lib/app-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, File, Search, Star, StarOff, RefreshCw, Clock } from "lucide-react"
import { MemoryStatus } from "@/components/memory-status"

export function FileExplorer() {
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
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [showRecent, setShowRecent] = useState(false)
  const [filteredFiles, setFilteredFiles] = useState(files)

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
    }
  }

  // Navigate to parent directory
  const navigateUp = () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/")
    setCurrentPath(parentPath || "/")
  }

  // Get files to display based on current mode
  const displayedFiles = useMemo(() => {
    if (showRecent) {
      return recentFiles
    }
    return filteredFiles
  }, [filteredFiles, recentFiles, showRecent])

  return (
    <div className="w-1/3 flex flex-col border-r overflow-hidden">
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
          </div>
        </div>

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
              {showRecent
                ? "No recent files"
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
                    {file.type === "directory" ? (
                      <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
