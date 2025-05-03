"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useAppContext } from "@/lib/app-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, File, Search, Star, StarOff, RefreshCw, Clock } from "lucide-react"
import { MemoryStatus } from "@/components/memory-status"
import { MemorySearchSuggestions } from "@/components/memory-search-suggestions"

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
    <div className="w-1/3 flex flex-col border-r border-gray-700 overflow-hidden bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <form onSubmit={handleSearch} className="flex space-x-2 mb-4 relative">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button type="submit" size="icon" className="bg-gray-800 hover:bg-gray-700">
            <Search className="h-4 w-4" />
          </Button>
          <MemorySearchSuggestions
            onSelectSuggestion={(query) => {
              setSearchQuery(query)
              // Immediately submit the search form
              const event = new Event("submit", { cancelable: true })
              document.querySelector("form")?.dispatchEvent(event)
            }}
            currentQuery={searchQuery}
          />
        </form>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateUp}
              disabled={currentPath === "/"}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              ..
            </Button>
            <span className="text-sm font-mono truncate text-gray-300">{currentPath}</span>
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowRecent(!showRecent)}
              title={showRecent ? "Show current directory" : "Show recent files"}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Clock className={`h-4 w-4 ${showRecent ? "text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshFiles}
              disabled={isLoading}
              title="Refresh"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <MemoryStatus />

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        {searchHistory.length > 0 && searchQuery && (
          <div className="mb-2">
            <p className="text-xs text-gray-400 mb-1">Recent searches:</p>
            <div className="flex flex-wrap gap-1">
              {searchHistory.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  onClick={() => setSearchQuery(query)}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-gray-900">
        {displayedFiles.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center text-gray-400">
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
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-800 ${
                    selectedFileId === file.id ? "bg-gray-800" : ""
                  }`}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {file.type === "directory" ? (
                      <Folder className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate text-gray-200">{file.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
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
