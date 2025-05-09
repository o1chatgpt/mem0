"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Memory } from "@/lib/mem0"
import { MemoryExportProgress } from "./memory-export-import-progress"
import {
  type ExportProgress,
  exportMemories,
  generateExportFilename,
  downloadExportFile,
} from "@/lib/memory-export-import"
import { Download, X } from "lucide-react"

interface MemoryExportDialogProps {
  isOpen: boolean
  onClose: () => void
  memories: Memory[]
}

export function MemoryExportDialog({ isOpen, onClose, memories }: MemoryExportDialogProps) {
  const [selectedMemories, setSelectedMemories] = useState<Memory[]>([])
  const [selectAll, setSelectAll] = useState(true)
  const [progress, setProgress] = useState<ExportProgress>({
    total: 0,
    processed: 0,
    status: "idle",
  })
  const [exportData, setExportData] = useState<string | null>(null)

  // Initialize selected memories when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMemories(memories)
      setSelectAll(true)
      setProgress({
        total: 0,
        processed: 0,
        status: "idle",
      })
      setExportData(null)
    }
  }, [isOpen, memories])

  // Handle select all toggle
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedMemories(memories)
    } else {
      setSelectedMemories([])
    }
  }

  // Handle individual memory selection
  const handleMemorySelection = (memory: Memory, checked: boolean) => {
    if (checked) {
      setSelectedMemories((prev) => [...prev, memory])
    } else {
      setSelectedMemories((prev) => prev.filter((m) => m.id !== memory.id))
    }
  }

  // Start export process
  const handleExport = async () => {
    try {
      const jsonData = await exportMemories(selectedMemories, setProgress)
      setExportData(jsonData)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  // Download the exported data
  const handleDownload = () => {
    if (exportData) {
      const filename = generateExportFilename()
      downloadExportFile(exportData, filename)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Memories</DialogTitle>
          <DialogDescription>Select the memories you want to export and download as a JSON file.</DialogDescription>
        </DialogHeader>

        {progress.status === "idle" ? (
          <>
            <div className="py-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAllChange} />
                <Label htmlFor="select-all">Select all memories ({memories.length})</Label>
              </div>

              {!selectAll && memories.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {memories.map((memory) => (
                    <div key={memory.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`memory-${memory.id}`}
                        checked={selectedMemories.some((m) => m.id === memory.id)}
                        onCheckedChange={(checked) => handleMemorySelection(memory, !!checked)}
                      />
                      <Label htmlFor={`memory-${memory.id}`} className="text-sm truncate">
                        {memory.content?.substring(0, 50) || memory.id}
                        {memory.content && memory.content.length > 50 ? "..." : ""}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={selectedMemories.length === 0}>
                Export {selectedMemories.length} memories
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <MemoryExportProgress progress={progress} />
            </div>

            <DialogFooter>
              {progress.status === "completed" ? (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={onClose} disabled={progress.status === "exporting"}>
                  Cancel
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
