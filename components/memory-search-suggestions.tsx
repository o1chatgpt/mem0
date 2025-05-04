"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/lib/app-context"

interface MemorySearchSuggestionsProps {
  onSelectSuggestion: (query: string) => void
  currentQuery: string
}

export function MemorySearchSuggestions({ onSelectSuggestion, currentQuery }: MemorySearchSuggestionsProps) {
  const { memoryStore } = useAppContext()
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!currentQuery || currentQuery.length < 2) {
        setSuggestions([])
        return
      }

      try {
        // Get search history
        const searchHistory = (await memoryStore.retrieveMemory<string[]>("searchHistory")) || []

        // Filter search history based on current query
        const filteredHistory = searchHistory
          .filter((query) => query.toLowerCase().includes(currentQuery.toLowerCase()))
          .slice(0, 3)

        // Get semantic search suggestions
        const semanticMemories = await memoryStore.searchMemories(currentQuery, 5)

        // Extract potential search terms from memories
        const semanticSuggestions = semanticMemories
          .map((memory) => {
            // Extract key phrases that might be good search terms
            const words = memory.memory.split(/\s+/)
            return words
              .filter((word) => word.length > 3 && !word.startsWith("file:") && !word.startsWith("file_id:"))
              .slice(0, 2)
              .join(" ")
          })
          .filter(
            (suggestion) =>
              suggestion &&
              suggestion.length > 3 &&
              !filteredHistory.includes(suggestion) &&
              suggestion.toLowerCase() !== currentQuery.toLowerCase() &&
              suggestion.toLowerCase() !== currentQuery.toLowerCase(),
          )

        // Combine and deduplicate suggestions
        const allSuggestions = [...new Set([...filteredHistory, ...semanticSuggestions])].slice(0, 5)

        setSuggestions(allSuggestions)
      } catch (error) {
        console.error("Error loading search suggestions:", error)
        setSuggestions([])
      }
    }

    loadSuggestions()
  }, [currentQuery, memoryStore])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-md mt-1 p-1">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm h-auto py-1.5"
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
