import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const formatFileSize = formatBytes

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function getFileTypeFromExtension(extension: string): string {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"]
  const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "md"]
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"]
  const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac"]
  const codeExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "html",
    "css",
    "json",
    "py",
    "java",
    "c",
    "cpp",
    "cs",
    "go",
    "rb",
    "php",
  ]

  const ext = extension.toLowerCase()

  if (imageExtensions.includes(ext)) return "image"
  if (documentExtensions.includes(ext)) return "document"
  if (videoExtensions.includes(ext)) return "video"
  if (audioExtensions.includes(ext)) return "audio"
  if (codeExtensions.includes(ext)) return "code"

  return "other"
}
