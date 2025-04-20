"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Code,
  FileIcon,
  Search,
  Tag,
  FolderIcon,
  Star,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { SearchService, type SearchResult, type SearchOptions } from "@/lib/search-service"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

interface SearchResultsProps {
  query: string
  onSelectFile: (fileId: string) => void
  onClearSearch: () => void
}

export function SearchResults({ query, onSelectFile, onClearSearch }: SearchResultsProps) {
  const { files, fileService, memoryStore, favoriteFiles, addToSearchHistory } = useAppContext()

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeContent: true,
    caseSensitive: false,
    fileTypes: null,
    onlyFavorites: false,
  })

  // Initialize search service
  const searchService = new SearchService(fileService, memoryStore)

  // Perform search when query or options change
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const results = await searchService.searchFiles(query, files, favoriteFiles, searchOptions)
        setSearchResults(results)

        // Add to search history
        if (query.trim()) {
          addToSearchHistory(query)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, files, favoriteFiles, searchOptions, searchService, addToSearchHistory])

  // Filter results based on active tab
  const filteredResults = searchResults.filter((result) => {
    if (activeTab === "all") return true
    if (activeTab === "name") return result.matches.some((match) => match.type === "name")
    if (activeTab === "content") return result.matches.some((match) => match.type === "content")
    if (activeTab === "tags") return result.matches.some((match) => match.type === "tag")
    return true
  })

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "text":
        return <FileText className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      case "code":
        return <Code className="h-4 w-4 text-purple-500" />
      case "directory":
        return <FolderIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />
    }
  }

  // Get available file types from all files
  const availableFileTypes = Array.from(new Set(files.map((file) => file.type)))

  // Toggle file type filter
  const toggleFileTypeFilter = (fileType: string) => {
    setSearchOptions((prev) => {
      const currentTypes = prev.fileTypes || []

      if (currentTypes.includes(fileType)) {
        // Remove the file type
        const newTypes = currentTypes.filter((type) => type !== fileType)
        return {
          ...prev,
          fileTypes: newTypes.length > 0 ? newTypes : null,
        }
      } else {
        // Add the file type
        return {
          ...prev,
          fileTypes: [...currentTypes, fileType],
        }
      }
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSearchOptions({
      includeContent: true,
      caseSensitive: false,
      fileTypes: null,
      onlyFavorites: false,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!query.trim()) {
    return null
  }

  if (searchResults.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No files match your search query. Try different keywords or adjust your search filters.
            </p>
            <Button variant="outline" className="mt-4" onClick={onClearSearch}>
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Search Results ({searchResults.length})</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Search Options</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeContent"
                        checked={searchOptions.includeContent}
                        onCheckedChange={(checked) =>
                          setSearchOptions((prev) => ({ ...prev, includeContent: checked === true }))
                        }
                      />
                      <Label htmlFor="includeContent">Search in file contents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="caseSensitive"
                        checked={searchOptions.caseSensitive}
                        onCheckedChange={(checked) =>
                          setSearchOptions((prev) => ({ ...prev, caseSensitive: checked === true }))
                        }
                      />
                      <Label htmlFor="caseSensitive">Case sensitive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="onlyFavorites"
                        checked={searchOptions.onlyFavorites}
                        onCheckedChange={(checked) =>
                          setSearchOptions((prev) => ({ ...prev, onlyFavorites: checked === true }))
                        }
                      />
                      <Label htmlFor="onlyFavorites">Only favorites</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">File Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableFileTypes.map((fileType) => (
                      <Badge
                        key={fileType}
                        variant={searchOptions.fileTypes?.includes(fileType) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFileTypeFilter(fileType)}
                      >
                        {getFileIcon(fileType)}
                        <span className="ml-1">{fileType}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="name">File Names</TabsTrigger>
          <TabsTrigger value="content">File Contents</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.file.id}
                result={result}
                query={query}
                onSelect={() => onSelectFile(result.file.id)}
                isFavorite={favoriteFiles.includes(result.file.id)}
                searchOptions={searchOptions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="name" className="mt-4">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.file.id}
                result={result}
                query={query}
                onSelect={() => onSelectFile(result.file.id)}
                isFavorite={favoriteFiles.includes(result.file.id)}
                searchOptions={searchOptions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.file.id}
                result={result}
                query={query}
                onSelect={() => onSelectFile(result.file.id)}
                isFavorite={favoriteFiles.includes(result.file.id)}
                searchOptions={searchOptions}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.file.id}
                result={result}
                query={query}
                onSelect={() => onSelectFile(result.file.id)}
                isFavorite={favoriteFiles.includes(result.file.id)}
                searchOptions={searchOptions}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface SearchResultCardProps {
  result: SearchResult
  query: string
  onSelect: () => void
  isFavorite: boolean
  searchOptions: SearchOptions
}

function SearchResultCard({ result, query, onSelect, isFavorite, searchOptions }: SearchResultCardProps) {
  const { file, matches } = result

  // Group matches by type
  const nameMatches = matches.filter((match) => match.type === "name")
  const contentMatches = matches.filter((match) => match.type === "content")
  const pathMatches = matches.filter((match) => match.type === "path")
  const tagMatches = matches.filter((match) => match.type === "tag")

  // Get file icon based on file type
  const getFileIcon = () => {
    switch (file.type) {
      case "text":
        return <FileText className="h-5 w-5" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "presentation":
        return <FileIcon className="h-5 w-5 text-orange-500" />
      case "code":
        return <Code className="h-5 w-5 text-purple-500" />
      case "pdf":
        return <FileIcon className="h-5 w-5 text-red-500" />
      case "video":
        return <FileIcon className="h-5 w-5 text-pink-500" />
      case "audio":
        return <FileIcon className="h-5 w-5 text-yellow-500" />
      case "markdown":
        return <FileText className="h-5 w-5 text-teal-500" />
      case "directory":
        return <FolderIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getFileIcon()}
              <div>
                <div
                  className="font-medium"
                  dangerouslySetInnerHTML={{
                    __html:
                      nameMatches.length > 0
                        ? SearchService.highlightMatches(file.name, query, searchOptions.caseSensitive)
                        : file.name,
                  }}
                />
                <div
                  className="text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      pathMatches.length > 0
                        ? SearchService.highlightMatches(file.path, query, searchOptions.caseSensitive)
                        : file.path,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
              <Badge variant="outline">{file.type}</Badge>
            </div>
          </div>

          {tagMatches.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Tag className="h-3 w-3 mr-1" />
                <span>Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {tagMatches.map((match, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                    dangerouslySetInnerHTML={{
                      __html: SearchService.highlightMatches(match.text, query, searchOptions.caseSensitive),
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {contentMatches.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <Search className="h-3 w-3 mr-1" />
                <span>
                  Found in content ({contentMatches.length} {contentMatches.length === 1 ? "match" : "matches"})
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {contentMatches.slice(0, 3).map((match, index) => (
                  <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: match.context
                          ? SearchService.highlightMatches(match.context, query, searchOptions.caseSensitive)
                          : SearchService.highlightMatches(match.text, query, searchOptions.caseSensitive),
                      }}
                    />
                  </div>
                ))}
                {contentMatches.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    + {contentMatches.length - 3} more matches
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
