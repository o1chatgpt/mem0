import type { Memory } from "@/lib/mem0"

export interface ExportProgress {
  total: number
  processed: number
  status: "idle" | "exporting" | "completed" | "error"
  error?: string
}

export interface ImportProgress {
  total: number
  processed: number
  successful: number
  failed: number
  status: "idle" | "validating" | "importing" | "completed" | "error"
  error?: string
  failedItems: Array<{ memory: any; error: string }>
}

export interface MemoryExportData {
  version: string
  exportDate: string
  memories: Memory[]
  metadata: {
    totalCount: number
    exportedBy: string
    appVersion: string
  }
}

export async function exportMemories(
  memories: Memory[],
  onProgress: (progress: ExportProgress) => void,
): Promise<string> {
  // Start with initial progress
  onProgress({
    total: memories.length,
    processed: 0,
    status: "exporting",
  })

  try {
    const exportData: MemoryExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      memories: [],
      metadata: {
        totalCount: memories.length,
        exportedBy: "File Manager App",
        appVersion: "1.0.0",
      },
    }

    // Process memories in batches to avoid UI freezing
    const batchSize = 50
    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, i + batchSize)
      exportData.memories.push(...batch)

      // Update progress
      onProgress({
        total: memories.length,
        processed: Math.min(i + batchSize, memories.length),
        status: "exporting",
      })

      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2)

    // Complete progress
    onProgress({
      total: memories.length,
      processed: memories.length,
      status: "completed",
    })

    return jsonString
  } catch (error) {
    onProgress({
      total: memories.length,
      processed: 0,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error during export",
    })
    throw error
  }
}

export async function validateImportData(
  jsonData: string,
  onProgress: (progress: ImportProgress) => void,
): Promise<MemoryExportData> {
  onProgress({
    total: 1,
    processed: 0,
    successful: 0,
    failed: 0,
    status: "validating",
    failedItems: [],
  })

  try {
    // Parse JSON
    const data = JSON.parse(jsonData)

    // Validate structure
    if (!data.version || !data.memories || !Array.isArray(data.memories)) {
      throw new Error("Invalid export file format")
    }

    onProgress({
      total: data.memories.length,
      processed: data.memories.length,
      successful: data.memories.length,
      failed: 0,
      status: "completed",
      failedItems: [],
    })

    return data
  } catch (error) {
    onProgress({
      total: 1,
      processed: 1,
      successful: 0,
      failed: 1,
      status: "error",
      error: error instanceof Error ? error.message : "Invalid JSON format",
      failedItems: [],
    })
    throw error
  }
}

export async function importMemories(
  data: MemoryExportData,
  createMemory: (memory: Memory) => Promise<boolean>,
  onProgress: (progress: ImportProgress) => void,
): Promise<ImportProgress> {
  const memories = data.memories
  const failedItems: Array<{ memory: any; error: string }> = []

  // Start with initial progress
  onProgress({
    total: memories.length,
    processed: 0,
    successful: 0,
    failed: 0,
    status: "importing",
    failedItems,
  })

  let successful = 0
  let failed = 0

  // Process memories in batches
  const batchSize = 10
  for (let i = 0; i < memories.length; i += batchSize) {
    const batch = memories.slice(i, Math.min(i + batchSize, memories.length))

    // Process each memory in the batch
    const results = await Promise.allSettled(batch.map((memory) => createMemory(memory)))

    // Count successes and failures
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        successful++
      } else {
        failed++
        failedItems.push({
          memory: batch[index],
          error:
            result.status === "rejected"
              ? result.reason?.toString() || "Import failed"
              : "Memory creation returned false",
        })
      }
    })

    // Update progress
    onProgress({
      total: memories.length,
      processed: i + batch.length,
      successful,
      failed,
      status: "importing",
      failedItems,
    })

    // Allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  // Complete progress
  const finalProgress = {
    total: memories.length,
    processed: memories.length,
    successful,
    failed,
    status: "completed" as const,
    failedItems,
  }

  onProgress(finalProgress)
  return finalProgress
}

export function generateExportFilename(): string {
  const date = new Date()
  const formattedDate = date.toISOString().split("T")[0]
  const formattedTime = date.toTimeString().split(" ")[0].replace(/:/g, "-")
  return `memories-export-${formattedDate}-${formattedTime}.json`
}

export function downloadExportFile(jsonData: string, filename: string): void {
  const blob = new Blob([jsonData], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
