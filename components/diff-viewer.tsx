"use client"

import { useState } from "react"
import { generateDiff, generateLineDiff, getDiffStats } from "@/lib/diff-utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

interface DiffViewerProps {
  oldText: string
  newText: string
  oldLabel?: string
  newLabel?: string
  showStats?: boolean
  className?: string
}

export function DiffViewer({
  oldText,
  newText,
  oldLabel = "Original",
  newLabel = "Modified",
  showStats = true,
  className = "",
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"inline" | "split" | "unified">("inline")

  // Generate diffs
  const inlineDiff = generateDiff(oldText, newText)
  const { oldLines, newLines } = generateLineDiff(oldText, newText)
  const stats = getDiffStats(inlineDiff)

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-base">Diff Comparison</CardTitle>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="inline" className="text-xs px-2 py-1 h-6">
                  Inline
                </TabsTrigger>
                <TabsTrigger value="split" className="text-xs px-2 py-1 h-6">
                  Split
                </TabsTrigger>
                <TabsTrigger value="unified" className="text-xs px-2 py-1 h-6">
                  Unified
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {showStats && (
              <div className="flex items-center gap-1 text-xs">
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                  <Plus className="h-3 w-3 text-green-600" />
                  {stats.additions}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
                  <Minus className="h-3 w-3 text-red-600" />
                  {stats.deletions}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-4">
        {viewMode === "inline" && (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap border-t">
            {inlineDiff.map((segment, i) => (
              <span
                key={i}
                className={
                  segment.type === "insert"
                    ? "bg-green-100 text-green-800"
                    : segment.type === "delete"
                      ? "bg-red-100 text-red-800 line-through opacity-70"
                      : ""
                }
              >
                {segment.text}
              </span>
            ))}
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-2 border-t">
            <div className="p-4 font-mono text-sm whitespace-pre-wrap border-r">
              <div className="font-semibold text-xs mb-2 text-muted-foreground">{oldLabel}</div>
              {oldLines.map((line, i) => (
                <div key={i} className={`${line.type === "delete" ? "bg-red-100 text-red-800" : ""} py-1`}>
                  {line.text}
                </div>
              ))}
            </div>
            <div className="p-4 font-mono text-sm whitespace-pre-wrap">
              <div className="font-semibold text-xs mb-2 text-muted-foreground">{newLabel}</div>
              {newLines.map((line, i) => (
                <div key={i} className={`${line.type === "insert" ? "bg-green-100 text-green-800" : ""} py-1`}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "unified" && (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap border-t">
            {[...oldLines, ...newLines]
              .sort((a, b) => {
                // Try to order by the original line position
                const aIndex = oldLines.indexOf(a)
                const bIndex = oldLines.indexOf(b)
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                if (aIndex !== -1) return -1
                if (bIndex !== -1) return 1

                // If both are in newLines, sort by their position there
                return newLines.indexOf(a) - newLines.indexOf(b)
              })
              .filter((line, i, arr) => {
                // Remove duplicates (lines that appear in both old and new)
                if (line.type === "equal") {
                  return i === arr.findIndex((l) => l.text === line.text && l.type === "equal")
                }
                return true
              })
              .map((line, i) => (
                <div
                  key={i}
                  className={`${
                    line.type === "insert"
                      ? "bg-green-100 text-green-800 border-l-2 border-green-500 pl-2"
                      : line.type === "delete"
                        ? "bg-red-100 text-red-800 border-l-2 border-red-500 pl-2"
                        : ""
                  } py-1`}
                >
                  {line.type === "insert" && <Plus className="inline h-3 w-3 mr-1" />}
                  {line.type === "delete" && <Minus className="inline h-3 w-3 mr-1" />}
                  {line.text}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * A simpler inline diff component for smaller text comparisons
 */
export function InlineDiffViewer({
  oldText,
  newText,
  className = "",
}: {
  oldText: string
  newText: string
  className?: string
}) {
  const diff = generateDiff(oldText, newText)

  return (
    <div className={`font-mono text-sm whitespace-pre-wrap ${className}`}>
      {diff.map((segment, i) => (
        <span
          key={i}
          className={
            segment.type === "insert"
              ? "bg-green-100 text-green-800"
              : segment.type === "delete"
                ? "bg-red-100 text-red-800 line-through opacity-70"
                : ""
          }
        >
          {segment.text}
        </span>
      ))}
    </div>
  )
}

/**
 * A component to show character-level changes within a word
 */
export function WordDiffViewer({
  oldText,
  newText,
  className = "",
}: {
  oldText: string
  newText: string
  className?: string
}) {
  const diff = generateDiff(oldText, newText)

  return (
    <span className={`font-mono ${className}`}>
      {diff.map((segment, i) => (
        <span
          key={i}
          className={
            segment.type === "insert"
              ? "bg-green-100 text-green-800"
              : segment.type === "delete"
                ? "bg-red-100 text-red-800 line-through opacity-70"
                : ""
          }
        >
          {segment.text}
        </span>
      ))}
    </span>
  )
}
