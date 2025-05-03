"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Loader2 } from "lucide-react"
import { reportGenerator, type ReportOptions } from "@/lib/report-generator"
import type { BenchmarkResult } from "@/lib/benchmark-service"

interface ReportGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  benchmarkResult: BenchmarkResult | null
  comparisonResults?: BenchmarkResult[]
}

export function ReportGeneratorDialog({
  open,
  onOpenChange,
  benchmarkResult,
  comparisonResults = [],
}: ReportGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    title: benchmarkResult ? `Benchmark Report: ${benchmarkResult.name}` : "Benchmark Report",
    includeEnvironmentInfo: true,
    includeOperationDetails: true,
    includeCharts: true,
    includeComparison: comparisonResults.length > 0,
    comparisonResults,
    notes: "",
    colorTheme: "default",
  })
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [reportFilename, setReportFilename] = useState<string | null>(null)

  // Update title when benchmark result changes
  if (benchmarkResult && reportOptions.title !== `Benchmark Report: ${benchmarkResult.name}`) {
    setReportOptions((prev) => ({
      ...prev,
      title: `Benchmark Report: ${benchmarkResult.name}`,
    }))
  }

  // Generate the report
  const generateReport = async () => {
    if (!benchmarkResult) return

    setIsGenerating(true)
    setReportUrl(null)
    setReportFilename(null)

    try {
      const result = await reportGenerator.generateReport(benchmarkResult, {
        ...reportOptions,
        comparisonResults: reportOptions.includeComparison ? comparisonResults : [],
      })

      if (result.success && result.dataUrl && result.filename) {
        setReportUrl(result.dataUrl)
        setReportFilename(result.filename)
      } else {
        console.error("Error generating report:", result.message)
        alert(`Error generating report: ${result.message}`)
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert(`Error generating report: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Download the report
  const downloadReport = () => {
    if (!reportUrl || !reportFilename) return

    const link = document.createElement("a")
    link.href = reportUrl
    link.download = reportFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </DialogTitle>
          <DialogDescription>Create a detailed report from your benchmark results.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {reportUrl ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your report has been generated successfully!</p>
                <p className="text-xs text-muted-foreground">Click the button below to download it.</p>
              </div>
              <Button onClick={downloadReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" onClick={() => setReportUrl(null)} className="w-full">
                Generate Another Report
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  value={reportOptions.title}
                  onChange={(e) => setReportOptions({ ...reportOptions, title: e.target.value })}
                  placeholder="Enter report title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-theme">Color Theme</Label>
                <Select
                  value={reportOptions.colorTheme}
                  onValueChange={(value) => setReportOptions({ ...reportOptions, colorTheme: value as any })}
                >
                  <SelectTrigger id="color-theme">
                    <SelectValue placeholder="Select a color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Report Content</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-environment"
                      checked={reportOptions.includeEnvironmentInfo}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, includeEnvironmentInfo: !!checked })
                      }
                    />
                    <Label htmlFor="include-environment" className="text-sm font-normal cursor-pointer">
                      Include Environment Information
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-operations"
                      checked={reportOptions.includeOperationDetails}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, includeOperationDetails: !!checked })
                      }
                    />
                    <Label htmlFor="include-operations" className="text-sm font-normal cursor-pointer">
                      Include Operation Details
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={reportOptions.includeCharts}
                      onCheckedChange={(checked) => setReportOptions({ ...reportOptions, includeCharts: !!checked })}
                    />
                    <Label htmlFor="include-charts" className="text-sm font-normal cursor-pointer">
                      Include Performance Charts
                    </Label>
                  </div>
                  {comparisonResults.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-comparison"
                        checked={reportOptions.includeComparison}
                        onCheckedChange={(checked) =>
                          setReportOptions({ ...reportOptions, includeComparison: !!checked })
                        }
                      />
                      <Label htmlFor="include-comparison" className="text-sm font-normal cursor-pointer">
                        Include Comparison with Selected Results
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={reportOptions.notes}
                  onChange={(e) => setReportOptions({ ...reportOptions, notes: e.target.value })}
                  placeholder="Add any additional notes or context for the report"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!reportUrl && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
