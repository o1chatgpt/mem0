import { generateBaseEmailTemplate } from "./base-template"

export type ExportData = {
  scheduleName: string
  exportType: "pdf" | "csv"
  exportDate: string
  totalMemories: number
  categories: number
  aiMember?: string
  previewStats?: string
}

export function generateExportEmailTemplate(data: ExportData, recipientName?: string) {
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,"

  const fileTypeInfo =
    data.exportType === "pdf"
      ? "PDF document with detailed visualizations and analysis"
      : "CSV file with raw data that you can import into your preferred analysis tool"

  const aiMemberInfo = data.aiMember
    ? `<p>This export contains memory data for AI family member: <strong>${data.aiMember}</strong>.</p>`
    : "<p>This export contains memory data for all AI family members.</p>"

  const previewStatsSection = data.previewStats
    ? `
      <div class="info-box">
        <h3>Preview of Export Data</h3>
        ${data.previewStats}
      </div>
    `
    : ""

  const content = `
    <h2>Your Scheduled Memory Export</h2>
    <p>${greeting}</p>
    <p>Your scheduled export <strong>"${data.scheduleName}"</strong> is ready. We've attached a ${fileTypeInfo} to this email.</p>
    
    ${aiMemberInfo}
    
    <div class="info-box">
      <h3>Export Summary</h3>
      <p>Export Date: ${data.exportDate}</p>
      <p>Total Memories: ${data.totalMemories}</p>
      <p>Categories: ${data.categories}</p>
      <p>Format: ${data.exportType.toUpperCase()}</p>
    </div>
    
    ${previewStatsSection}
    
    <div class="divider"></div>
    
    <p>To modify your export schedule or create new ones, visit the Memory Analytics section in your File Manager dashboard.</p>
    
    <div class="text-center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://filemanager.app"}/memory-analytics" class="button">View Memory Analytics</a>
    </div>
    
    <p>Thank you for using File Manager for your memory management needs.</p>
  `

  return generateBaseEmailTemplate({
    title: `Your ${data.scheduleName} Export is Ready`,
    preheaderText: `Your scheduled memory export "${data.scheduleName}" is ready for download.`,
    content,
  })
}
