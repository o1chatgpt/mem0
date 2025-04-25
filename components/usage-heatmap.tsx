"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateHeatmapData, type HeatmapData } from "@/lib/visualization-utils"
import { Clock } from "lucide-react"

export function UsageHeatmap() {
  const { files, memoryStore } = useAppContext()
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)

  useEffect(() => {
    const loadHeatmapData = async () => {
      setIsLoading(true)
      try {
        // Get memories from memory store
        const memories = memoryStore.getMemories()

        // Process memories for heatmap
        const heatmap = generateHeatmapData(memories, files)
        setHeatmapData(heatmap)
      } catch (error) {
        console.error("Error loading heatmap data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHeatmapData()
  }, [files, memoryStore])

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Get color for heatmap cell
  const getCellColor = (value: number) => {
    if (value === 0) return "bg-muted/30"
    if (value < 3) return "bg-primary/20"
    if (value < 6) return "bg-primary/40"
    if (value < 10) return "bg-primary/60"
    return "bg-primary/80"
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex">
              <div className="w-10"></div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="text-xs text-center text-muted-foreground">
                    {hour % 3 === 0 ? hour : ""}
                  </div>
                ))}
              </div>
            </div>

            {dayNames.map((day, dayIndex) => (
              <div key={day} className="flex">
                <div className="w-10 flex items-center">
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cell = heatmapData.find((d) => d.day === dayIndex && d.hour === hour)
                    const value = cell?.value || 0

                    return (
                      <div
                        key={hour}
                        className={`h-4 ${getCellColor(value)} rounded-sm cursor-pointer transition-colors hover:opacity-80`}
                        onClick={() => setSelectedCell(cell || null)}
                        title={`${day} ${hour}:00 - ${value} interactions`}
                      ></div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-2 px-10">
              <div className="text-xs text-muted-foreground">Less</div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-muted/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/60 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/80 rounded-sm"></div>
              </div>
              <div className="text-xs text-muted-foreground">More</div>
            </div>

            {selectedCell && selectedCell.value > 0 && (
              <div className="border rounded-md p-3 mt-4">
                <h3 className="text-sm font-medium mb-2">
                  {dayNames[selectedCell.day]} at {selectedCell.hour}:00
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedCell.value} file {selectedCell.value === 1 ? "interaction" : "interactions"}
                </p>

                {selectedCell.files.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium mb-1">Files accessed:</div>
                    <div className="space-y-1">
                      {selectedCell.files.map((fileId) => {
                        const file = files.find((f) => f.id === fileId)
                        return file ? (
                          <div key={fileId} className="truncate">
                            {file.name}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
