import * as ftp from "basic-ftp"
import { config } from "./config"
import type { FileInfo } from "./file-service"

export class FtpService {
  private client: ftp.Client
  private connected = false

  constructor() {
    this.client = new ftp.Client()
    this.client.ftp.verbose = false // Set to true for debugging
  }

  async connect(): Promise<boolean> {
    if (this.connected) return true

    try {
      await this.client.access({
        host: config.ftpHost,
        port: config.ftpPort,
        user: config.ftpUser,
        password: config.ftpPassword,
        secure: false, // Set to true if your FTP server supports FTPS
      })
      this.connected = true
      console.log("Connected to FTP server")
      return true
    } catch (error) {
      console.error("FTP connection error:", error)
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      this.client.close()
      this.connected = false
      console.log("Disconnected from FTP server")
    }
  }

  async listFiles(path = "/"): Promise<FileInfo[]> {
    try {
      if (!this.connected) await this.connect()

      const list = await this.client.list(path)

      return list.map((item) => {
        const isDirectory = item.type === ftp.FileType.Directory
        const sizeInBytes = item.size || 0

        return {
          id: `ftp-${path}-${item.name}`,
          name: item.name,
          type: isDirectory ? "directory" : this.getFileType(item.name),
          path: `${path}/${item.name}`.replace(/\/+/g, "/"),
          size: this.formatFileSize(sizeInBytes),
          sizeInBytes,
          lastModified: item.date ? item.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        }
      })
    } catch (error) {
      console.error(`Error listing files from FTP at ${path}:`, error)
      throw error
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      if (!this.connected) await this.connect()

      // Create a temporary file to download the content
      const tempBuffer = await this.client.downloadTo(Buffer.from([]), path)
      return tempBuffer.toString("utf-8")
    } catch (error) {
      console.error(`Error getting file content from FTP at ${path}:`, error)
      throw error
    }
  }

  async uploadFile(localFilePath: string, remotePath: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect()

      await this.client.uploadFrom(localFilePath, remotePath)
      return true
    } catch (error) {
      console.error(`Error uploading file to FTP at ${remotePath}:`, error)
      throw error
    }
  }

  async uploadBuffer(buffer: Buffer, remotePath: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect()

      await this.client.uploadFrom(buffer, remotePath)
      return true
    } catch (error) {
      console.error(`Error uploading buffer to FTP at ${remotePath}:`, error)
      throw error
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect()

      await this.client.remove(path)
      return true
    } catch (error) {
      console.error(`Error deleting file from FTP at ${path}:`, error)
      throw error
    }
  }

  async createDirectory(path: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect()

      await this.client.ensureDir(path)
      return true
    } catch (error) {
      console.error(`Error creating directory on FTP at ${path}:`, error)
      throw error
    }
  }

  async deleteDirectory(path: string): Promise<boolean> {
    try {
      if (!this.connected) await this.connect()

      await this.client.removeDir(path)
      return true
    } catch (error) {
      console.error(`Error deleting directory from FTP at ${path}:`, error)
      throw error
    }
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

// Create a singleton instance
export const ftpService = new FtpService()
