"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow, Calendar, FileType } from "lucide-react"

export type SortField = "name" | "lastModified" | "sizeInBytes" | "type"
export type SortDirection = "asc" | "desc"

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface SortMenuProps {
  currentSort: SortConfig
  onSortChange: (sortConfig: SortConfig) => void
}

export function SortMenu({ currentSort, onSortChange }: SortMenuProps) {
  const handleSortClick = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === currentSort.field) {
      onSortChange({
        field,
        direction: currentSort.direction === "asc" ? "desc" : "asc",
      })
    } else {
      // If clicking a different field, set to default direction for that field
      const defaultDirection: Record<SortField, SortDirection> = {
        name: "asc",
        lastModified: "desc",
        sizeInBytes: "desc",
        type: "asc",
      }

      onSortChange({
        field,
        direction: defaultDirection[field],
      })
    }
  }

  // Helper function to get the icon for a sort field
  const getSortIcon = (field: SortField) => {
    if (currentSort.field !== field) {
      // Default icons for fields that aren't selected
      switch (field) {
        case "name":
          return <ArrowDownAZ className="h-4 w-4" />
        case "lastModified":
          return <Calendar className="h-4 w-4" />
        case "sizeInBytes":
          return <ArrowDownWideNarrow className="h-4 w-4" />
        case "type":
          return <FileType className="h-4 w-4" />
      }
    }

    // Icons for the currently selected field
    switch (field) {
      case "name":
        return currentSort.direction === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
      case "lastModified":
        return <Calendar className="h-4 w-4" />
      case "sizeInBytes":
        return currentSort.direction === "asc" ? (
          <ArrowUpWideNarrow className="h-4 w-4" />
        ) : (
          <ArrowDownWideNarrow className="h-4 w-4" />
        )
      case "type":
        return <FileType className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Sort files">
          {getSortIcon(currentSort.field)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSortClick("name")}>
          <div className="flex items-center">
            {getSortIcon("name")}
            <span className="ml-2">Name</span>
          </div>
          {currentSort.field === "name" && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({currentSort.direction === "asc" ? "A-Z" : "Z-A"})
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortClick("lastModified")}>
          <div className="flex items-center">
            {getSortIcon("lastModified")}
            <span className="ml-2">Date Modified</span>
          </div>
          {currentSort.field === "lastModified" && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({currentSort.direction === "asc" ? "Oldest" : "Newest"})
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortClick("sizeInBytes")}>
          <div className="flex items-center">
            {getSortIcon("sizeInBytes")}
            <span className="ml-2">Size</span>
          </div>
          {currentSort.field === "sizeInBytes" && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({currentSort.direction === "asc" ? "Smallest" : "Largest"})
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortClick("type")}>
          <div className="flex items-center">
            {getSortIcon("type")}
            <span className="ml-2">Type</span>
          </div>
          {currentSort.field === "type" && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({currentSort.direction === "asc" ? "A-Z" : "Z-A"})
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
