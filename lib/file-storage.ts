import type { FileData } from "./file-model"

const STORAGE_KEY = "code-editor-files"

export function saveFiles(files: FileData[]): void {
  try {
    // Convert Date objects to strings for storage
    const filesForStorage = files.map((file) => ({
      ...file,
      lastModified: file.lastModified.toISOString(),
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filesForStorage))
  } catch (error) {
    console.error("Error saving files to local storage:", error)
  }
}

export function loadFiles(): FileData[] {
  try {
    const filesString = localStorage.getItem(STORAGE_KEY)
    if (!filesString) return []

    // Convert string dates back to Date objects
    const files = JSON.parse(filesString)
    return files.map((file: any) => ({
      ...file,
      lastModified: new Date(file.lastModified),
    }))
  } catch (error) {
    console.error("Error loading files from local storage:", error)
    return []
  }
}

export function clearFiles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing files from local storage:", error)
  }
}
