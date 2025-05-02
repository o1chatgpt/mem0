// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

import type { FileData } from "./file-model"

const STORAGE_KEY = "file-manager-files"

// Function to save files to local storage
export function saveFiles(files: FileData[]): void {
  if (!isBrowser) return

  try {
    // Convert Date objects to strings for serialization
    const serializedFiles = files.map((file) => ({
      ...file,
      lastModified: file.lastModified.toISOString(),
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedFiles))
  } catch (error) {
    console.error("Error saving files to local storage:", error)
  }
}

// Function to load files from local storage
export function loadFiles(): FileData[] {
  if (!isBrowser) return []

  try {
    const storedFiles = localStorage.getItem(STORAGE_KEY)

    if (!storedFiles) return []

    // Convert string dates back to Date objects
    return JSON.parse(storedFiles).map((file: any) => ({
      ...file,
      lastModified: new Date(file.lastModified),
    }))
  } catch (error) {
    console.error("Error loading files from local storage:", error)
    return []
  }
}

// Function to clear all files from local storage
export function clearFiles(): void {
  if (!isBrowser) return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing files from local storage:", error)
  }
}
