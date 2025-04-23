"use client"

import type { FileInfo } from "./file-service"

export interface ShareOptions {
  expiresAt?: Date
  password?: string
  allowDownload: boolean
  allowEdit: boolean
}

export interface SharedFile {
  id: string
  fileId: string
  shareId: string
  createdAt: Date
  expiresAt?: Date
  password?: string
  allowDownload: boolean
  allowEdit: boolean
  accessCount: number
  lastAccessedAt?: Date
}

// In-memory storage for shared files
const sharedFilesStorage: Record<string, SharedFile> = {}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class ShareService {
  // Generate a unique share ID
  private generateShareId(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const length = 10
    let result = ""

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return result
  }

  // Create a share link for a file
  async shareFile(file: FileInfo, options: ShareOptions): Promise<SharedFile> {
    const shareId = this.generateShareId()
    const id = `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const sharedFile: SharedFile = {
      id,
      fileId: file.id,
      shareId,
      createdAt: new Date(),
      expiresAt: options.expiresAt,
      password: options.password,
      allowDownload: options.allowDownload,
      allowEdit: options.allowEdit,
      accessCount: 0,
    }

    // Store in memory
    sharedFilesStorage[shareId] = sharedFile

    return sharedFile
  }

  // Get a shared file by its share ID
  async getSharedFile(shareId: string): Promise<SharedFile | null> {
    const sharedFile = sharedFilesStorage[shareId]

    if (!sharedFile) {
      return null
    }

    // Check if the share has expired
    if (sharedFile.expiresAt && new Date() > sharedFile.expiresAt) {
      delete sharedFilesStorage[shareId]
      return null
    }

    return sharedFile
  }

  // Update a shared file's access count and last accessed time
  async recordAccess(shareId: string): Promise<void> {
    const sharedFile = sharedFilesStorage[shareId]

    if (sharedFile) {
      sharedFile.accessCount += 1
      sharedFile.lastAccessedAt = new Date()
    }
  }

  // Revoke a share
  async revokeShare(shareId: string): Promise<boolean> {
    if (sharedFilesStorage[shareId]) {
      delete sharedFilesStorage[shareId]
      return true
    }
    return false
  }

  // Get all shares for a specific file
  async getSharesForFile(fileId: string): Promise<SharedFile[]> {
    return Object.values(sharedFilesStorage).filter((share) => share.fileId === fileId)
  }

  // Get all shares created by the current user
  async getAllShares(): Promise<SharedFile[]> {
    return Object.values(sharedFilesStorage)
  }

  // Validate a password for a password-protected share
  async validateSharePassword(shareId: string, password: string): Promise<boolean> {
    const sharedFile = sharedFilesStorage[shareId]

    if (!sharedFile || !sharedFile.password) {
      return false
    }

    return sharedFile.password === password
  }

  // Get the share URL for a shared file
  getShareUrl(shareId: string): string {
    // In a real app, this would use the actual domain
    if (!isBrowser) return `/shared/${shareId}`
    return `${window.location.origin}/shared/${shareId}`
  }
}

// Create a singleton instance
export const shareService = new ShareService()
