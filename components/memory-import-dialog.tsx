"use client"

import { useState, useRef, type ChangeEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MemoryImportProgress } from "./memory-export-import-progress"
import {
  type ImportProgress,
  validateImportData,
  importMemories,
  type MemoryExportData,
} from "@/lib/memory-export-import"
import type { Memory } from "@/lib/mem0"
import { Upload, FileText, X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MemoryImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (memory: Memory) => Promise<boolean>
}

export function MemoryImportDialog({ isOpen, onClose, onImport }: MemoryImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    status: "idle",
    failedItems: [],
  })
  const [validatedData, setValidatedData] = useState<MemoryExportData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        status: "idle",
        failedItems: [],
      })
      setValidatedData(null)
    }
  }

  const handleValidate = async () => {
    if (!file) return

    try {
      const fileContent = await file.text()
      const data = await validateImportData(fileContent, setProgress)
      setValidatedData(data)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  const handleImport = async () => {
    if (!validatedData) return

    try {
      await importMemories(validatedData, onImport, setProgress)
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  const resetImport = () => {
    setFile(null)
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      status: "idle",
      failedItems: [],
    })
    setValidatedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetImport()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Memories</DialogTitle>
          <DialogDescription>Import memories from a previously exported JSON file.</DialogDescription>
        </DialogHeader>

        {progress.status === "idle" && !validatedData ? (
          <>
            <div className="py-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="memory-import-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JSON file only</p>
                  </div>
                  <input
                    id="memory-import-file"
                    type="file"
                    className="hidden"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>

              {file && (
                <div className="mt-4 flex items-center p-2 bg-blue-50 rounded-md">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700 truncate flex-1">{file.name}</span>
                  <span className="text-xs text-blue-500 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleValidate} disabled={!file}>
                Validate File
              </Button>
            </DialogFooter>
          </>
        ) : validatedData && progress.status !== "importing" && progress.status !== "completed" ? (
          <>
            <div className="py-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <FileText className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  File validated successfully. Found {validatedData.memories.length} memories to import.
                </AlertDescription>
              </Alert>

              {validatedData.metadata && (
                <div className="mt-4 text-sm">
                  <p>
                    <span className="font-medium">Export date:</span>{" "}
                    {new Date(validatedData.exportDate).toLocaleString()}
                  </p>
                  {validatedData.metadata.appVersion && (
                    <p>
                      <span className="font-medium">App version:</span> {validatedData.metadata.appVersion}
                    </p>
                  )}
                </div>
              )}

              {validatedData.memories.length > 100 && (
                <Alert variant="warning" className="mt-4 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    You are about to import {validatedData.memories.length} memories. This might take some time.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetImport}>
                Back
              </Button>
              <Button onClick={handleImport}>Import {validatedData.memories.length} Memories</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <MemoryImportProgress progress={progress} />
            </div>

            <DialogFooter>
              {progress.status === "completed" ? (
                <>
                  <Button variant="outline" onClick={resetImport}>
                    Import Another File
                  </Button>
                  <Button onClick={handleClose}>Close</Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleClose} disabled={progress.status === "importing"}>
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
