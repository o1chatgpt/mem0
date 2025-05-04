export interface FileItem {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  size?: number
  modified?: string
  created?: string
  extension?: string
  isSelected?: boolean
  isShared?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
}

export interface ServerConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  password?: string
  rootDir?: string
  type: "ftp" | "sftp" | "webdav"
  isConnected?: boolean
}

export interface Template {
  id: string
  name: string
  description?: string
  content: string
  type: string
  tags?: string[]
  created: string
  modified?: string
}

export interface SearchResult {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  matchContext?: string
  relevance?: number
}

export interface MemoryInsight {
  id: string
  title: string
  description: string
  relatedFiles: string[]
  confidence: number
  created: string
}

export interface ShareLink {
  id: string
  fileId: string
  filePath: string
  fileName: string
  created: string
  expires?: string
  accessCount: number
  password?: string
  isPublic: boolean
}

export interface SortOption {
  field: "name" | "size" | "modified" | "type"
  direction: "asc" | "desc"
}

export interface ViewMode {
  type: "grid" | "list" | "details"
}

export interface AppContextType {
  currentPath: string
  setCurrentPath: (path: string) => void
  selectedFiles: FileItem[]
  setSelectedFiles: (files: FileItem[]) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  refreshFiles: () => Promise<void>
  user: User | null
  setUser: (user: User | null) => void
}
