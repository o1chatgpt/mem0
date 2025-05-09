"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Memory } from "@/lib/mem0"
import { MemoryExportDialog } from "./memory-export-dialog"
import { MemoryImportDialog } from "./memory-import-dialog"
import { Download, Upload } from "lucide-react"

interface MemoryExportImportManagerProps {
  memories: Memory[]
  onImportMemory: (memory: Memory) => Promise<boolean>
}

export function MemoryExportImportManager({ memories, onImportMemory }: MemoryExportImportManagerProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportDialogOpen(true)}
          disabled={memories.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Memories
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import Memories
        </Button>
      </div>

      <MemoryExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        memories={memories}
      />

      <MemoryImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={onImportMemory}
      />
    </>
  )
}
