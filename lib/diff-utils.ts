// Diff match patch library for text comparison
import { diff_match_patch } from "diff-match-patch"

export type DiffType = "insert" | "delete" | "equal"

export interface DiffSegment {
  type: DiffType
  text: string
}

/**
 * Generate a diff between two text strings
 */
export function generateDiff(oldText: string, newText: string): DiffSegment[] {
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(oldText, newText)

  // Optimize the diff for human readability
  dmp.diff_cleanupSemantic(diffs)

  // Convert to our format
  return diffs.map(([type, text]) => ({
    type: type === -1 ? "delete" : type === 1 ? "insert" : "equal",
    text,
  }))
}

/**
 * Generate a line-by-line diff between two text strings
 */
export function generateLineDiff(
  oldText: string,
  newText: string,
): {
  oldLines: { text: string; type: DiffType }[]
  newLines: { text: string; type: DiffType }[]
} {
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(oldText, newText)

  // Optimize the diff for human readability
  dmp.diff_cleanupSemantic(diffs)

  // Split into lines
  const oldLines: { text: string; type: DiffType }[] = []
  const newLines: { text: string; type: DiffType }[] = []

  let oldBuffer = ""
  let newBuffer = ""

  for (const [type, text] of diffs) {
    const lines = text.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isLastLine = i === lines.length - 1

      if (type === -1 || type === 0) {
        // Add to old text
        oldBuffer += line
        if (!isLastLine) {
          oldLines.push({ text: oldBuffer, type: type === -1 ? "delete" : "equal" })
          oldBuffer = ""
        }
      }

      if (type === 1 || type === 0) {
        // Add to new text
        newBuffer += line
        if (!isLastLine) {
          newLines.push({ text: newBuffer, type: type === 1 ? "insert" : "equal" })
          newBuffer = ""
        }
      }
    }
  }

  // Add any remaining buffers
  if (oldBuffer) {
    oldLines.push({ text: oldBuffer, type: oldBuffer === newBuffer ? "equal" : "delete" })
  }

  if (newBuffer && newBuffer !== oldBuffer) {
    newLines.push({ text: newBuffer, type: "insert" })
  }

  return { oldLines, newLines }
}

/**
 * Generate a character-level diff for inline display
 */
export function generateInlineDiff(oldText: string, newText: string): DiffSegment[] {
  return generateDiff(oldText, newText)
}

/**
 * Calculate statistics about the diff
 */
export function getDiffStats(diff: DiffSegment[]): {
  additions: number
  deletions: number
  unchanged: number
} {
  return diff.reduce(
    (stats, segment) => {
      if (segment.type === "insert") {
        stats.additions += segment.text.length
      } else if (segment.type === "delete") {
        stats.deletions += segment.text.length
      } else {
        stats.unchanged += segment.text.length
      }
      return stats
    },
    { additions: 0, deletions: 0, unchanged: 0 },
  )
}
