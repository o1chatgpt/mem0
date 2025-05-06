import type { FileInfo } from "./file-service"

// Define types for timeline data
export interface TimelineEntry {
  date: string
  count: number
  files: Array<{
    id: string
    name: string
    type: string
    count: number
  }>
}

// Define types for heatmap data
export interface HeatmapData {
  day: number
  hour: number
  value: number
  files: string[]
}

// Define types for file usage data
export interface FileUsageData {
  id: string
  name: string
  total: number
  values: Array<{
    date: string
    count: number
  }>
}

// Define types for tag usage data
export interface TagUsageData {
  name: string
  count: number
  files: Array<{
    id: string
    name: string
  }>
}

// Process memory data for timeline visualization
export function processMemoryForTimeline(
  memories: Array<{ text: string; timestamp: string }>,
  files: FileInfo[],
): TimelineEntry[] {
  // Group memories by date
  const dateMap = new Map<string, Map<string, number>>()

  memories.forEach((memory) => {
    // Extract date (YYYY-MM-DD)
    const date = new Date(memory.timestamp).toISOString().split("T")[0]

    // Initialize date entry if it doesn't exist
    if (!dateMap.has(date)) {
      dateMap.set(date, new Map<string, number>())
    }

    // Try to extract file ID from memory text
    const fileIdMatch = memory.text.match(/file with ID ([a-zA-Z0-9-]+)/) || memory.text.match(/file ([a-zA-Z0-9-]+)/)
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1]
      const dateEntry = dateMap.get(date)!
      dateEntry.set(fileId, (dateEntry.get(fileId) || 0) + 1)
    }
  })

  // Convert map to array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, fileMap]) => {
      // Get file details and counts
      const fileEntries = Array.from(fileMap.entries())
        .map(([fileId, count]) => {
          const file = files.find((f) => f.id === fileId)
          if (!file) return null
          return {
            id: fileId,
            name: file.name,
            type: file.type,
            count,
          }
        })
        .filter(Boolean) as Array<{
        id: string
        name: string
        type: string
        count: number
      }>

      return {
        date,
        count: fileEntries.reduce((sum, entry) => sum + entry.count, 0),
        files: fileEntries,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Generate heatmap data from memory
export function generateHeatmapData(
  memories: Array<{ text: string; timestamp: string }>,
  files: FileInfo[],
): HeatmapData[] {
  // Initialize heatmap data (7 days x 24 hours)
  const heatmap: HeatmapData[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap.push({
        day,
        hour,
        value: 0,
        files: [],
      })
    }
  }

  // Process memories
  memories.forEach((memory) => {
    const date = new Date(memory.timestamp)
    const day = date.getDay() // 0-6 (Sunday-Saturday)
    const hour = date.getHours() // 0-23

    // Find the corresponding heatmap cell
    const cell = heatmap.find((c) => c.day === day && c.hour === hour)
    if (cell) {
      cell.value++

      // Try to extract file ID from memory text
      const fileIdMatch = memory.text.match(/file with ID ([a-zA-Z0-9-]+)/) || memory.text.match(/file ([a-zA-Z0-9-]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1]
        if (!cell.files.includes(fileId)) {
          cell.files.push(fileId)
        }
      }
    }
  })

  return heatmap
}

// Process file usage over time
export function processFileUsageOverTime(
  memories: Array<{ text: string; timestamp: string }>,
  files: FileInfo[],
  days: number,
): FileUsageData[] {
  // Create a map of file IDs to usage counts
  const fileUsageMap = new Map<string, Map<string, number>>()

  // Generate date range (last N days)
  const dateRange: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dateRange.push(date.toISOString().split("T")[0])
  }

  // Initialize file usage map with all dates
  files.forEach((file) => {
    if (!fileUsageMap.has(file.id)) {
      const dateMap = new Map<string, number>()
      dateRange.forEach((date) => dateMap.set(date, 0))
      fileUsageMap.set(file.id, dateMap)
    }
  })

  // Process memories
  memories.forEach((memory) => {
    // Extract date (YYYY-MM-DD)
    const date = new Date(memory.timestamp).toISOString().split("T")[0]
    if (!dateRange.includes(date)) return // Skip if outside date range

    // Try to extract file ID from memory text
    const fileIdMatch = memory.text.match(/file with ID ([a-zA-Z0-9-]+)/) || memory.text.match(/file ([a-zA-Z0-9-]+)/)
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1]
      if (fileUsageMap.has(fileId)) {
        const dateMap = fileUsageMap.get(fileId)!
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      }
    }
  })

  // Convert map to array and calculate totals
  const fileUsageData: FileUsageData[] = []
  fileUsageMap.forEach((dateMap, fileId) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    const total = Array.from(dateMap.values()).reduce((sum, count) => sum + count, 0)
    if (total === 0) return // Skip files with no usage

    fileUsageData.push({
      id: fileId,
      name: file.name,
      total,
      values: dateRange.map((date) => ({
        date,
        count: dateMap.get(date) || 0,
      })),
    })
  })

  // Sort by total usage (descending)
  return fileUsageData.sort((a, b) => b.total - a.total)
}

// Process tag usage data
export async function processTagUsage(
  files: FileInfo[],
  getFileTags: (fileId: string) => Promise<string[]>,
): Promise<TagUsageData[]> {
  // Create a map of tags to files
  const tagMap = new Map<string, Set<string>>()

  // Process files and their tags
  for (const file of files) {
    try {
      const tags = await getFileTags(file.id)
      tags.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, new Set<string>())
        }
        tagMap.get(tag)!.add(file.id)
      })
    } catch (error) {
      console.error(`Error getting tags for file ${file.id}:`, error)
    }
  }

  // Convert map to array
  const tagUsageData: TagUsageData[] = Array.from(tagMap.entries()).map(([tag, fileIds]) => ({
    name: tag,
    count: fileIds.size,
    files: Array.from(fileIds).map((fileId) => {
      const file = files.find((f) => f.id === fileId)
      return {
        id: fileId,
        name: file ? file.name : "Unknown file",
      }
    }),
  }))

  // Sort by count (descending)
  return tagUsageData.sort((a, b) => b.count - a.count)
}
