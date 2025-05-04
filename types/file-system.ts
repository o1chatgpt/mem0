// File system types for the WebContainer Manager

export type FileType = "file" | "directory"

export interface FileSystemItem {
  name: string
  type: FileType
  path: string // Full path including parent directories
  content?: string // Only for files
  children?: FileSystemItem[] // Only for directories
}

export interface FileSystemState {
  items: FileSystemItem[]
  currentPath: string
  selectedItem: string | null
}
