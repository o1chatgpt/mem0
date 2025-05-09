"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateExportEmailTemplate } from "@/lib/email-templates/export-template"
import { generateExportErrorEmailTemplate } from "@/lib/email-templates/export-error-template"
import { generateScheduleConfirmationTemplate } from "@/lib/email-templates/schedule-confirmation-template"

export function EmailTemplatePreview() {
  const [templateType, setTemplateType] = useState("export")
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf")

  // Sample data for templates
  const exportData = {
    scheduleName: "Weekly Memory Analytics",
    exportType: exportFormat,
    exportDate: new Date().toLocaleString(),
    totalMemories: 1250,
    categories: 8,
    aiMember: "Assistant",
    previewStats: `
      <p><strong>Top Categories:</strong></p>
      <ul>
        <li>Personal: 450 (36%)</li>
        <li>Work: 325 (26%)</li>
        <li>Learning: 200 (16%)</li>
      </ul>
      
      <p><strong>Recent Trends:</strong></p>
      <ul>
        <li>May 2023: 120 memories</li>
        <li>June 2023: 145 memories</li>
        <li>July 2023: 180 memories</li>
      </ul>
      
      <p><em>Full details available in the attached file.</em></p>
    `,
  }

  const errorData = {
    scheduleName: "Weekly Memory Analytics",
    errorDate: new Date().toLocaleString(),
    errorMessage: "Failed to generate export: Database connection error",
    nextAttempt: new Date(Date.now() + 86400000).toLocaleString(), // Tomorrow
  }

  const confirmationData = {
    scheduleName: "Weekly Memory Analytics",
    frequency: "weekly" as const,
    dayInfo: "Monday",
    timeInfo: "9:00 AM",
    format: exportFormat,
    firstExportDate: new Date(Date.now() + 86400000).toLocaleString(), // Tomorrow
    aiMember: "Assistant",
  }

  // Generate the selected template
  const getTemplateHtml = () => {
    switch (templateType) {
      case "export":
        return generateExportEmailTemplate({ ...exportData, exportType: exportFormat })
      case "error":
        return generateExportErrorEmailTemplate(errorData)
      case "confirmation":
        return generateScheduleConfirmationTemplate({ ...confirmationData, format: exportFormat })
      default:
        return ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Template Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <Tabs defaultValue="export" onValueChange={setTemplateType}>
                <TabsList className="w-full">
                  <TabsTrigger value="export" className="flex-1">
                    Export
                  </TabsTrigger>
                  <TabsTrigger value="error" className="flex-1">
                    Error
                  </TabsTrigger>
                  <TabsTrigger value="confirmation" className="flex-1">
                    Confirmation
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="w-1/2">
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}>
                <SelectTrigger>
                  <SelectValue placeholder="Export Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <iframe srcDoc={getTemplateHtml()} className="w-full h-[600px] border-0" title="Email Template Preview" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
