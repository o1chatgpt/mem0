import * as ftp from "basic-ftp"
import { config } from "./config"
import type { FileInfo } from "./file-service"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export interface FtpServer {
  id: string
  name: string
  host: string
  port: number
  user: string
  password: string
  rootDir: string
  isConnected: boolean
}

export class EnhancedFtpService {
  private servers: FtpServer[] = []
  private activeConnections: Map<string, ftp.Client> = new Map()

  constructor() {
    // Initialize with the main FTP server from config
    this.servers.push({
      id: "main",
      name: "Main FTP Server",
      host: config.ftpHost,
      port: config.ftpPort,
      user: config.ftpUser,
      password: config.ftpPassword,
      rootDir: config.ftpRootDir,
      isConnected: false,
    })

    // Add Dusseldorf FTP server if configured
    if (process.env.DUSSELDORF_FTP_HOST) {
      this.servers.push({
        id: "dusseldorf",
        name: "Dusseldorf FTP Server",
        host: process.env.DUSSELDORF_FTP_HOST,
        port: Number(process.env.DUSSELDORF_FTP_PORT || "21"),
        user: process.env.DUSSELDORF_FTP_USER || "",
        password: process.env.DUSSELDORF_FTP_PASSWORD || "",
        rootDir: process.env.DUSSELDORF_FTP_ROOT_DIR || "/",
        isConnected: false,
      })
    }
  }

  async connect(serverId: string): Promise<boolean> {
    // Skip FTP connections on server-side
    if (!isBrowser) {
      console.log("Skipping FTP connection on server-side")
      return false
    }

    const server = this.servers.find((s) => s.id === serverId)
    if (!server) {
      throw new Error(`FTP server with ID ${serverId} not found`)
    }

    // Check if already connected
    if (this.activeConnections.has(serverId)) {
      return true
    }

    try {
      const client = new ftp.Client()
      client.ftp.verbose = false // Set to true for debugging

      await client.access({
        host: server.host,
        port: server.port,
        user: server.user,
        password: server.password,
        secure: false, // Set to true for FTPS
      })

      // Update server status
      server.isConnected = true

      // Store the connection
      this.activeConnections.set(serverId, client)

      console.log(`Connected to FTP server: ${server.name}`)
      return true
    } catch (error) {
      console.error(`FTP connection error for server ${server.name}:`, error)
      server.isConnected = false
      return false
    }
  }

  async disconnect(serverId: string): Promise<void> {
    // Skip FTP disconnections on server-side
    if (!isBrowser) {
      console.log("Skipping FTP disconnection on server-side")
      return
    }

    const client = this.activeConnections.get(serverId)
    if (client) {
      client.close()
      this.activeConnections.delete(serverId)

      // Update server status
      const server = this.servers.find((s) => s.id === serverId)
      if (server) {
        server.isConnected = false
      }

      console.log(`Disconnected from FTP server: ${serverId}`)
    }
  }

  async disconnectAll(): Promise<void> {
    // Skip FTP disconnections on server-side
    if (!isBrowser) {
      console.log("Skipping FTP disconnections on server-side")
      return
    }

    for (const serverId of this.activeConnections.keys()) {
      await this.disconnect(serverId)
    }
  }

  async listFiles(serverId: string, path = "/"): Promise<FileInfo[]> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP listFiles on server-side")
      return []
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    const server = this.servers.find((s) => s.id === serverId)
    if (!server) {
      throw new Error(`FTP server with ID ${serverId} not found`)
    }

    try {
      // Normalize path
      const normalizedPath = path.startsWith("/") ? path : `/${path}`
      const fullPath = `${server.rootDir}${normalizedPath}`.replace(/\/+/g, "/")

      const list = await client.list(fullPath)

      return list.map((item) => {
        const isDirectory = item.type === ftp.FileType.Directory
        const sizeInBytes = item.size || 0

        return {
          id: `ftp-${serverId}-${fullPath}-${item.name}`,
          name: item.name,
          type: isDirectory ? "directory" : this.getFileType(item.name),
          path: `${fullPath}/${item.name}`.replace(/\/+/g, "/"),
          size: this.formatFileSize(sizeInBytes),
          sizeInBytes,
          lastModified: item.date ? item.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          serverId: serverId,
          serverName: server.name,
        }
      })
    } catch (error) {
      console.error(`Error listing files from FTP server ${server.name} at ${path}:`, error)
      throw error
    }
  }

  async getFileContent(serverId: string, path: string): Promise<string> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP getFileContent on server-side")
      return ""
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      // Create a temporary buffer to download the content
      const tempBuffer = await client.downloadTo(Buffer.from([]), path)
      return tempBuffer.toString("utf-8")
    } catch (error) {
      console.error(`Error getting file content from FTP server ${serverId} at ${path}:`, error)
      throw error
    }
  }

  async uploadFile(serverId: string, localFilePath: string, remotePath: string): Promise<boolean> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP uploadFile on server-side")
      return false
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      await client.uploadFrom(localFilePath, remotePath)
      return true
    } catch (error) {
      console.error(`Error uploading file to FTP server ${serverId} at ${remotePath}:`, error)
      throw error
    }
  }

  async uploadBuffer(serverId: string, buffer: Buffer, remotePath: string): Promise<boolean> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP uploadBuffer on server-side")
      return false
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      await client.uploadFrom(buffer, remotePath)
      return true
    } catch (error) {
      console.error(`Error uploading buffer to FTP server ${serverId} at ${remotePath}:`, error)
      throw error
    }
  }

  async deleteFile(serverId: string, path: string): Promise<boolean> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP deleteFile on server-side")
      return false
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      await client.remove(path)
      return true
    } catch (error) {
      console.error(`Error deleting file from FTP server ${serverId} at ${path}:`, error)
      throw error
    }
  }

  async createDirectory(serverId: string, path: string): Promise<boolean> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP createDirectory on server-side")
      return false
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      await client.ensureDir(path)
      return true
    } catch (error) {
      console.error(`Error creating directory on FTP server ${serverId} at ${path}:`, error)
      throw error
    }
  }

  async deleteDirectory(serverId: string, path: string): Promise<boolean> {
    // Skip FTP operations on server-side
    if (!isBrowser) {
      console.log("Skipping FTP deleteDirectory on server-side")
      return false
    }

    // Ensure connection
    if (!this.activeConnections.has(serverId)) {
      await this.connect(serverId)
    }

    const client = this.activeConnections.get(serverId)
    if (!client) {
      throw new Error(`Not connected to FTP server: ${serverId}`)
    }

    try {
      await client.removeDir(path)
      return true
    } catch (error) {
      console.error(`Error deleting directory from FTP server ${serverId} at ${path}:`, error)
      throw error
    }
  }

  getServers(): FtpServer[] {
    return [...this.servers]
  }

  private getFileType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    if (["txt", "log", "md"].includes(extension)) return "text"
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) return "image"
    if (["mp4", "webm", "mov"].includes(extension)) return "video"
    if (["mp3", "wav", "ogg"].includes(extension)) return "audio"
    if (["pdf"].includes(extension)) return "pdf"
    if (["doc", "docx"].includes(extension)) return "document"
    if (["xls", "xlsx"].includes(extension)) return "spreadsheet"
    if (["ppt", "pptx"].includes(extension)) return "presentation"
    if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs", "go", "rb", "php"].includes(extension)) return "code"
    if (["json", "xml", "yaml", "yml"].includes(extension)) return extension
    if (["css", "scss", "less"].includes(extension)) return "css"
    if (["html", "htm"].includes(extension)) return "html"

    return "unknown"
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }
}

export const enhancedFtpService = new EnhancedFtpService()
