"use client"

import type { FileInfo } from "@/lib/file-service"
import { Folder, File, Star, StarOff, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface FileGridItemProps {
  file: FileInfo
  isSelected: boolean
  isFavorite: boolean
  onSelect: (id: string, exclusive: boolean) => void
  onToggleFavorite: (id: string) => void
  onDoubleClick: () => void
}

export function FileGridItem({
  file,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onDoubleClick,
}: FileGridItemProps) {
  // Check if file is an image
  const isImage = file.type === "file" && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          onSelect(file.id, false)
        } else {
          onSelect(file.id, true)
        }
      }}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(file.id, false)
        }}
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground/70" />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-7 w-7 opacity-70 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(file.id)
        }}
      >
        {isFavorite ? <Star className="h-4 w-4 text-yellow-400" /> : <StarOff className="h-4 w-4 text-gray-400" />}
      </Button>

      <div className="h-32 flex items-center justify-center bg-muted/30">
        {isImage ? (
          <div className="w-full h-full relative">
            <Image
              src={file.url || `/api/proxy?path=${encodeURIComponent(file.path)}`}
              alt={file.name}
              fill
              className="object-cover"
            />
          </div>
        ) : file.type === "directory" ? (
          <Folder className="h-16 w-16 text-blue-500" />
        ) : (
          <File className="h-16 w-16 text-gray-500" />
        )}
      </div>

      <CardContent className="p-3">
        <div className="truncate text-sm font-medium">{file.name}</div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">{file.size}</span>
          <span className="text-xs text-muted-foreground">{file.lastModified}</span>
        </div>
      </CardContent>
    </Card>
  )
}
