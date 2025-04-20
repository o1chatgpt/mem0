"use client"

import type { FileInfo } from "./file-service"

export interface SearchResult {
  file: FileInfo
  matches: {
    type: "name" | "content" | "path" | "tag"
    text: string
    context?: string
    position: number
  }[]
  score: number
}

export interface SearchOptions {
  includeContent: boolean
  caseSensitive: boolean
  fileTypes: string[] | null
  onlyFavorites: boolean
}

export class SearchService {
  private fileService: any
  private memoryStore: any

  constructor(fileService: any, memoryStore: any) {
    this.fileService = fileService
    this.memoryStore = memoryStore
  }

  async searchFiles(
    query: string,
    files: FileInfo[],
    favoriteFiles: string[],
    options: SearchOptions = {
      includeContent: true,
      caseSensitive: false,
      fileTypes: null,
      onlyFavorites: false,
    },
  ): Promise<SearchResult[]> {
    if (!query.trim()) {
      return []
    }

    // Record search in memory
    try {
      await this.memoryStore.addMemory(`Searched for: ${query}`)
    } catch (error) {
      console.warn("Failed to record search in memory:", error)
    }

    // Filter files based on options
    let filesToSearch = [...files]

    // Filter by favorites if needed
    if (options.onlyFavorites) {
      filesToSearch = filesToSearch.filter((file) => favoriteFiles.includes(file.id))
    }

    // Filter by file types if needed
    if (options.fileTypes && options.fileTypes.length > 0) {
      filesToSearch = filesToSearch.filter((file) => options.fileTypes!.includes(file.type))
    }

    // Prepare search query
    const searchQuery = options.caseSensitive ? query : query.toLowerCase()

    // Search results with scoring
    const results: SearchResult[] = []

    // Process each file
    for (const file of filesToSearch) {
      const matches: SearchResult["matches"] = []
      let score = 0

      // Search in file name
      const fileName = options.caseSensitive ? file.name : file.name.toLowerCase()
      if (fileName.includes(searchQuery)) {
        matches.push({
          type: "name",
          text: file.name,
          position: fileName.indexOf(searchQuery),
        })
        score += 10 // Higher score for name matches
      }

      // Search in file path
      const filePath = options.caseSensitive ? file.path : file.path.toLowerCase()
      if (filePath.includes(searchQuery)) {
        matches.push({
          type: "path",
          text: file.path,
          position: filePath.indexOf(searchQuery),
        })
        score += 5 // Medium score for path matches
      }

      // Search in file tags
      try {
        const tags = await this.memoryStore.getFileTags(file.id)
        for (const tag of tags) {
          const tagText = options.caseSensitive ? tag : tag.toLowerCase()
          if (tagText.includes(searchQuery)) {
            matches.push({
              type: "tag",
              text: tag,
              position: tagText.indexOf(searchQuery),
            })
            score += 8 // High score for tag matches
          }
        }
      } catch (error) {
        console.warn(`Failed to get tags for file ${file.id}:`, error)
      }

      // Search in file content if option is enabled
      if (options.includeContent && file.content) {
        const content = options.caseSensitive ? file.content : file.content.toLowerCase()

        // Find all occurrences of the search query in content
        let position = content.indexOf(searchQuery)
        while (position !== -1) {
          // Extract context around the match (up to 50 chars before and after)
          const contextStart = Math.max(0, position - 50)
          const contextEnd = Math.min(content.length, position + searchQuery.length + 50)
          const context = file.content.substring(contextStart, contextEnd)

          matches.push({
            type: "content",
            text: searchQuery,
            context,
            position,
          })

          score += 3 // Lower score for content matches, but they add up if multiple matches

          // Find next occurrence
          position = content.indexOf(searchQuery, position + 1)
        }
      }

      // Add to results if there are matches
      if (matches.length > 0) {
        results.push({
          file,
          matches,
          score,
        })
      }
    }

    // Sort results by score (highest first)
    return results.sort((a, b) => b.score - a.score)
  }

  // Helper function to highlight matched text in a string
  static highlightMatches(text: string, query: string, caseSensitive = false): string {
    if (!query.trim()) return text

    const searchQuery = caseSensitive ? query : query.toLowerCase()
    const textToSearch = caseSensitive ? text : text.toLowerCase()

    let result = text
    let offset = 0

    let position = textToSearch.indexOf(searchQuery)
    while (position !== -1) {
      const matchedText = text.substring(position + offset, position + offset + query.length)
      const highlighted = `<mark>${matchedText}</mark>`

      result = result.substring(0, position + offset) + highlighted + result.substring(position + offset + query.length)

      offset += highlighted.length - query.length
      position = textToSearch.indexOf(searchQuery, position + 1)
    }

    return result
  }
}
