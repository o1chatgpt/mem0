"use client"

// Define the FileInfo interface
export interface FileInfo {
  id: string
  name: string
  type: string
  path: string
  size: string
  sizeInBytes: number
  lastModified: string
  content?: string
  url?: string
  accessCount?: number
}

// Define the FileService interface
export interface FileService {
  getFiles: () => Promise<FileInfo[]>
  getFileById: (id: string) => Promise<FileInfo | null>
  createFile: (file: Omit<FileInfo, "id"> | string, content?: string) => Promise<FileInfo | string>
  updateFile: (id: string, updates: Partial<FileInfo>) => Promise<FileInfo | null>
  deleteFile: (id: string) => Promise<boolean>
  searchFiles: (query: string) => Promise<FileInfo[]>
  uploadFile: (file: File) => Promise<FileInfo>
  downloadFile: (id: string) => Promise<void>
  getFilesByPath: (path: string) => Promise<FileInfo[]>
  listFiles: (path: string) => Promise<FileInfo[]>
  getFileContent: (id: string) => Promise<string>
  saveFileContent: (id: string, content: string) => Promise<void>
}

// Mock database for files
const initialFileDatabase: FileInfo[] = [
  {
    id: "1",
    name: "document.txt",
    type: "text",
    path: "/documents/document.txt",
    size: "12KB",
    sizeInBytes: 12 * 1024,
    lastModified: "2023-04-01",
    content: "This is the content of document.txt. It contains text that can be edited.",
  },
  {
    id: "2",
    name: "image.png",
    type: "image",
    path: "/images/image.png",
    size: "1.2MB",
    sizeInBytes: 1.2 * 1024 * 1024,
    lastModified: "2023-04-02",
    url: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "3",
    name: "spreadsheet.xlsx",
    type: "spreadsheet",
    path: "/documents/spreadsheet.xlsx",
    size: "45KB",
    sizeInBytes: 45 * 1024,
    lastModified: "2023-04-03",
    content: "[Spreadsheet content would be displayed here]",
  },
  {
    id: "4",
    name: "presentation.pptx",
    type: "presentation",
    path: "/presentations/presentation.pptx",
    size: "2.3MB",
    sizeInBytes: 2.3 * 1024 * 1024,
    lastModified: "2023-04-04",
    content: "[Presentation content would be displayed here]",
  },
  {
    id: "5",
    name: "code.js",
    type: "code",
    path: "/code/code.js",
    size: "5KB",
    sizeInBytes: 5 * 1024,
    lastModified: "2023-04-05",
    content: 'function helloWorld() {\n  console.log("Hello, world!");\n}\n\nhelloWorld();',
  },
  {
    id: "6",
    name: "report.pdf",
    type: "pdf",
    path: "/documents/report.pdf",
    size: "3.5MB",
    sizeInBytes: 3.5 * 1024 * 1024,
    lastModified: "2023-04-06",
    url: "/placeholder.svg?height=500&width=400",
  },
  {
    id: "7",
    name: "video.mp4",
    type: "video",
    path: "/videos/video.mp4",
    size: "15MB",
    sizeInBytes: 15 * 1024 * 1024,
    lastModified: "2023-04-07",
    url: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "8",
    name: "notes.md",
    type: "markdown",
    path: "/documents/notes.md",
    size: "8KB",
    sizeInBytes: 8 * 1024,
    lastModified: "2023-04-08",
    content:
      "# Notes\n\n## Important Points\n\n- First item\n- Second item\n- Third item\n\n## To-Do\n\n- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3",
  },
  {
    id: "9",
    name: "config.json",
    type: "json",
    path: "/code/config.json",
    size: "2KB",
    sizeInBytes: 2 * 1024,
    lastModified: "2023-04-09",
    content:
      '{\n  "name": "File Manager",\n  "version": "1.0.0",\n  "description": "A file manager with memory",\n  "author": "v0"\n}',
  },
  {
    id: "10",
    name: "styles.css",
    type: "css",
    path: "/code/styles.css",
    size: "3KB",
    sizeInBytes: 3 * 1024,
    lastModified: "2023-04-10",
    content:
      "body {\n  font-family: 'Arial', sans-serif;\n  margin: 0;\n  padding: 0;\n  background-color: #f5f5f5;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}",
  },
]

// Create a concrete implementation of FileService
export class FileServiceImpl implements FileService {
  private fileDatabase: FileInfo[] = [...initialFileDatabase]

  async getFiles(): Promise<FileInfo[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...this.fileDatabase]
  }

  async getFileById(id: string): Promise<FileInfo | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.fileDatabase.find((file) => file.id === id) || null
  }

  // Add this function to determine file type from extension
  getFileTypeFromExtension(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    if (["html", "htm"].includes(extension)) return "html"
    if (["css"].includes(extension)) return "css"
    if (["js"].includes(extension)) return "javascript"
    if (["jsx"].includes(extension)) return "jsx"
    if (["ts"].includes(extension)) return "typescript"
    if (["tsx"].includes(extension)) return "tsx"
    if (["md", "markdown"].includes(extension)) return "markdown"
    if (["json"].includes(extension)) return "json"
    if (["txt"].includes(extension)) return "text"
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) return "image"
    if (["mp4", "webm", "mov"].includes(extension)) return "video"
    if (["mp3", "wav", "ogg"].includes(extension)) return "audio"
    if (["pdf"].includes(extension)) return "pdf"
    if (["doc", "docx"].includes(extension)) return "document"
    if (["xls", "xlsx"].includes(extension)) return "spreadsheet"
    if (["ppt", "pptx"].includes(extension)) return "presentation"

    return "unknown"
  }

  // Update the createFile method in FileServiceImpl to use this function
  async createFile(fileOrPath: Omit<FileInfo, "id"> | string, content?: string): Promise<FileInfo | string> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (typeof fileOrPath === "string") {
      // Handle the case where the first argument is a path string
      const path = fileOrPath
      const name = path.split("/").pop() || "new-file.txt"
      const fileType = this.getFileTypeFromExtension(name)

      const newFile: FileInfo = {
        id: String(Date.now()),
        name,
        type: fileType,
        path,
        size: "0KB",
        sizeInBytes: 0,
        lastModified: new Date().toISOString().split("T")[0],
        content: content || "",
      }

      this.fileDatabase = [...this.fileDatabase, newFile]
      return newFile.id
    } else {
      // Handle the case where the first argument is a file object
      const file = fileOrPath
      const newFile: FileInfo = {
        ...file,
        id: String(Date.now()),
      }

      this.fileDatabase = [...this.fileDatabase, newFile]
      return newFile
    }
  }

  async updateFile(id: string, updates: Partial<FileInfo>): Promise<FileInfo | null> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const index = this.fileDatabase.findIndex((file) => file.id === id)
    if (index === -1) return null

    const updatedFile = { ...this.fileDatabase[index], ...updates }
    this.fileDatabase = [...this.fileDatabase.slice(0, index), updatedFile, ...this.fileDatabase.slice(index + 1)]
    return updatedFile
  }

  async deleteFile(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const initialLength = this.fileDatabase.length
    this.fileDatabase = this.fileDatabase.filter((file) => file.id !== id)
    return this.fileDatabase.length < initialLength
  }

  async searchFiles(query: string): Promise<FileInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (!query) return []

    const lowerQuery = query.toLowerCase()
    return this.fileDatabase.filter(
      (file) =>
        file.name.toLowerCase().includes(lowerQuery) ||
        file.path.toLowerCase().includes(lowerQuery) ||
        (file.content && file.content.toLowerCase().includes(lowerQuery)),
    )
  }

  async uploadFile(file: File): Promise<FileInfo> {
    // Simulate a longer delay for upload
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Determine file type
    const extension = file.name.split(".").pop()?.toLowerCase() || ""
    let type = "unknown"

    if (["txt", "md", "markdown"].includes(extension))
      type = extension === "md" || extension === "markdown" ? "markdown" : "text"
    else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) type = "image"
    else if (["mp4", "webm", "mov"].includes(extension)) type = "video"
    else if (["mp3", "wav", "ogg"].includes(extension)) type = "audio"
    else if (["pdf"].includes(extension)) type = "pdf"
    else if (["doc", "docx"].includes(extension)) type = "document"
    else if (["xls", "xlsx"].includes(extension)) type = "spreadsheet"
    else if (["ppt", "pptx"].includes(extension)) type = "presentation"
    else if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs", "go", "rb", "php"].includes(extension))
      type = "code"
    else if (["json", "xml", "yaml", "yml"].includes(extension)) type = extension
    else if (["css", "scss", "less"].includes(extension)) type = "css"
    else if (["html", "htm"].includes(extension)) type = "html"

    // Determine path based on type
    let path = "/other/"
    if (["text", "markdown", "document", "pdf", "spreadsheet", "presentation"].includes(type)) path = "/documents/"
    else if (["image"].includes(type)) path = "/images/"
    else if (["video"].includes(type)) path = "/videos/"
    else if (["audio"].includes(type)) path = "/audio/"
    else if (["code", "json", "xml", "yaml", "yml", "css", "html"].includes(type)) path = "/code/"

    // Create file object
    const newFile: FileInfo = {
      id: String(Date.now()),
      name: file.name,
      type,
      path: path + file.name,
      size: formatFileSize(file.size),
      sizeInBytes: file.size,
      lastModified: new Date().toISOString().split("T")[0],
      url: type === "image" ? URL.createObjectURL(file) : undefined,
    }

    // For text-based files, read the content
    if (["text", "markdown", "code", "json", "xml", "yaml", "yml", "css", "html"].includes(type)) {
      try {
        const content = await file.text()
        newFile.content = content
      } catch (error) {
        console.error("Error reading file content:", error)
      }
    }

    this.fileDatabase = [...this.fileDatabase, newFile]
    return newFile
  }

  async downloadFile(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const file = this.fileDatabase.find((file) => file.id === id)
    if (!file) throw new Error("File not found")

    // Create a blob and download it
    let blob: Blob
    let mimeType = "application/octet-stream"

    if (file.content) {
      // For text-based files
      if (file.type === "text") mimeType = "text/plain"
      else if (file.type === "markdown") mimeType = "text/markdown"
      else if (file.type === "json") mimeType = "application/json"
      else if (file.type === "html") mimeType = "text/html"
      else if (file.type === "css") mimeType = "text/css"
      else if (file.type === "code") {
        if (file.name.endsWith(".js")) mimeType = "text/javascript"
        else if (file.name.endsWith(".py")) mimeType = "text/x-python"
        else mimeType = "text/plain"
      }

      blob = new Blob([file.content], { type: mimeType })
    } else if (file.url) {
      // For files with URLs (like images), fetch the content
      const response = await fetch(file.url)
      blob = await response.blob()
    } else {
      // Fallback for other files
      blob = new Blob(["File content not available"], { type: "text/plain" })
    }

    // Create download link and trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async getFilesByPath(path: string): Promise<FileInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.fileDatabase.filter((file) => file.path.startsWith(path))
  }

  async listFiles(path: string): Promise<FileInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.fileDatabase.filter((file) => {
      const filePath = file.path.substring(0, file.path.lastIndexOf("/"))
      return filePath === path || (path === "/" && file.path.split("/").length <= 2)
    })
  }

  async getFileContent(id: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const file = this.fileDatabase.find((file) => file.id === id)
    if (!file) throw new Error("File not found")
    return file.content || ""
  }

  async saveFileContent(id: string, content: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = this.fileDatabase.findIndex((file) => file.id === id)
    if (index === -1) throw new Error("File not found")

    const updatedFile = { ...this.fileDatabase[index], content }
    this.fileDatabase = [...this.fileDatabase.slice(0, index), updatedFile, ...this.fileDatabase.slice(index + 1)]
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
}
