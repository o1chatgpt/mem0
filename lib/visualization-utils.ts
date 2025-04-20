import type { FileInfo } from "./file-service"

export interface TimelineEntry {
  date: string
  count: number
  files: {
    id: string
    name: string
    type: string
    count: number
  }[]
}

export interface FileUsageData {
  id: string
  name: string
  type: string
  values: {
    date: string
    count: number
  }[]
  total: number
}

export interface HeatmapData {
  day: number
  hour: number
  value: number
  files: string[]
}

export interface TagUsageData {
  name: string
  count: number
  files: {
    id: string
    name: string
  }[]
}

export function processMemoryForTimeline(
  memories: { text: string; timestamp: string }[],
  files: FileInfo[],
): TimelineEntry[] {
  // Create a map of file IDs to file info
  const fileMap = new Map<string, FileInfo>()
  files.forEach((file) => fileMap.set(file.id, file))

  // Group memories by date
  const dateGroups = new Map<string, Map<string, number>>()

  // Process each memory
  memories.forEach((memory) => {
    const date = new Date(memory.timestamp).toISOString().split("T")[0]
    const fileMatches = memory.text.match(/file(?::|s:)?\s+([a-zA-Z0-9-]+)/gi)

    if (!dateGroups.has(date)) {
      dateGroups.set(date, new Map<string, number>())
    }

    const dateGroup = dateGroups.get(date)!

    if (fileMatches) {
      fileMatches.forEach((match) => {
        const fileId = match.split(/\s+/)[1]
        if (fileMap.has(fileId)) {
          dateGroup.set(fileId, (dateGroup.get(fileId) || 0) + 1)
        }
      })
    }
  })

  // Convert to timeline entries
  const timeline: TimelineEntry[] = []

  dateGroups.forEach((fileUsage, date) => {
    const files: TimelineEntry["files"] = []
    let totalCount = 0

    fileUsage.forEach((count, fileId) => {
      const file = fileMap.get(fileId)
      if (file) {
        files.push({
          id: fileId,
          name: file.name,
          type: file.type,
          count,
        })
        totalCount += count
      }
    })

    timeline.push({
      date,
      count: totalCount,
      files: files.sort((a, b) => b.count - a.count),
    })
  })

  // Sort by date
  return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function processFileUsageOverTime(
  memories: { text: string; timestamp: string }[],
  files: FileInfo[],
  days = 30,
): FileUsageData[] {
  // Create a map of file IDs to file info
  const fileMap = new Map<string, FileInfo>()
  files.forEach((file) => fileMap.set(file.id, file))

  // Create a map to track file usage by date
  const fileUsage = new Map<string, Map<string, number>>()

  // Initialize with all files
  files.forEach((file) => {
    fileUsage.set(file.id, new Map<string, number>())
  })

  // Process each memory
  memories.forEach((memory) => {
    const date = new Date(memory.timestamp).toISOString().split("T")[0]
    const fileMatches = memory.text.match(/file(?::|s:)?\s+([a-zA-Z0-9-]+)/gi)

    if (fileMatches) {
      fileMatches.forEach((match) => {
        const fileId = match.split(/\s+/)[1]
        if (fileMap.has(fileId)) {
          const fileDates = fileUsage.get(fileId)!
          fileDates.set(date, (fileDates.get(date) || 0) + 1)
        }
      })
    }
  })

  // Generate date range for the last N days
  const today = new Date()
  const dateRange: string[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dateRange.push(date.toISOString().split("T")[0])
  }

  // Convert to file usage data
  const result: FileUsageData[] = []

  fileUsage.forEach((dates, fileId) => {
    const file = fileMap.get(fileId)
    if (file) {
      let total = 0
      const values = dateRange.map((date) => {
        const count = dates.get(date) || 0
        total += count
        return { date, count }
      })

      if (total > 0) {
        result.push({
          id: fileId,
          name: file.name,
          type: file.type,
          values,
          total,
        })
      }
    }
  })

  // Sort by total usage
  return result.sort((a, b) => b.total - a.total)
}

export function generateHeatmapData(memories: { text: string; timestamp: string }[], files: FileInfo[]): HeatmapData[] {
  // Create a map of file IDs to file info
  const fileMap = new Map<string, FileInfo>()
  files.forEach((file) => fileMap.set(file.id, file))

  // Initialize heatmap data (7 days × 24 hours)
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

  // Process each memory
  memories.forEach((memory) => {
    const date = new Date(memory.timestamp)
    const day = date.getDay() // 0-6 (Sunday-Saturday)
    const hour = date.getHours() // 0-23

    const fileMatches = memory.text.match(/file(?::|s:)?\s+([a-zA-Z0-9-]+)/gi)

    if (fileMatches) {
      const index = day * 24 + hour
      const entry = heatmap[index]

      fileMatches.forEach((match) => {
        const fileId = match.split(/\s+/)[1]
        if (fileMap.has(fileId)) {
          entry.value += 1
          if (!entry.files.includes(fileId)) {
            entry.files.push(fileId)
          }
        }
      })
    }
  })

  return heatmap
}

export function processTagUsage(
  files: FileInfo[],
  getFileTags: (fileId: string) => Promise<string[]>,
): Promise<TagUsageData[]> {
  return new Promise(async (resolve) => {
    const tagUsage = new Map<string, { count: number; files: Set<string> }>()

    // Process each file
    for (const file of files) {
      try {
        const tags = await getFileTags(file.id)

        // Update tag usage
        for (const tag of tags) {
          if (!tagUsage.has(tag)) {
            tagUsage.set(tag, { count: 0, files: new Set() })
          }

          const usage = tagUsage.get(tag)!
          usage.count += 1
          usage.files.add(file.id)
        }
      } catch (error) {
        console.error(`Error getting tags for file ${file.id}:`, error)
      }
    }

    // Convert to tag usage data
    const result: TagUsageData[] = []

    tagUsage.forEach((usage, tag) => {
      result.push({
        name: tag,
        count: usage.count,
        files: Array.from(usage.files).map((fileId) => {
          const file = files.find((f) => f.id === fileId)
          return {
            id: fileId,
            name: file?.name || "Unknown file",
          }
        }),
      })
    })

    // Sort by count
    resolve(result.sort((a, b) => b.count - a.count))
  })
}
