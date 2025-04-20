"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxTags?: number
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
  suggestions?: string[]
}

export function TagInput({
  tags,
  setTags,
  placeholder = "Add tag...",
  className,
  maxTags = 10,
  onTagAdd,
  onTagRemove,
  suggestions = [],
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const newTags = [...tags, trimmedTag]
      setTags(newTags)
      onTagAdd?.(trimmedTag)
      setInputValue("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    onTagRemove?.(tag)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(suggestion.toLowerCase()),
  )

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border border-input bg-secondary p-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-gray-700 text-white">
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="h-7 flex-1 min-w-[120px] border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={tags.length < maxTags ? placeholder : ""}
          disabled={tags.length >= maxTags}
          {...props}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-700 bg-secondary shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="cursor-pointer px-3 py-2 hover:bg-gray-700 text-white"
                onClick={() => {
                  addTag(suggestion)
                  inputRef.current?.focus()
                }}
              >
                <div className="flex items-center">
                  <Plus className="mr-2 h-3 w-3 text-gray-400" />
                  {suggestion}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
