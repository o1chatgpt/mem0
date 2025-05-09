import { generateBaseEmailTemplate } from "./base-template"

export type ExportErrorData = {
  scheduleName: string
  errorDate: string
  errorMessage: string
  nextAttempt?: string
}

export function generateExportErrorEmailTemplate(data: ExportErrorData, recipientName?: string) {
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,"

  const nextAttemptInfo = data.nextAttempt
    ? `<p>We'll automatically try again on <strong>${data.nextAttempt}</strong>.</p>`
    : "<p>Please check your export schedule settings and try again manually.</p>"

  const content = `
    <h2>Export Schedule Error</h2>
    <p>${greeting}</p>
    <p>We encountered an issue while trying to generate your scheduled export <strong>"${data.scheduleName}"</strong>.</p>
    
    <div class="info-box" style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding-left: 20px;">
      <h3>Error Details</h3>
      <p>Date: ${data.errorDate}</p>
      <p>Error: ${data.errorMessage}</p>
      ${nextAttemptInfo}
    </div>
    
    <div class="divider"></div>
    
    <p>You can review and modify your export schedules in the Memory Analytics section of your File Manager dashboard.</p>
    
    <div class="text-center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://filemanager.app"}/memory-analytics" class="button">Manage Export Schedules</a>
    </div>
    
    <p>If you continue to experience issues, please contact our support team.</p>
  `

  return generateBaseEmailTemplate({
    title: `Export Schedule Error: ${data.scheduleName}`,
    preheaderText: `We encountered an issue with your scheduled export "${data.scheduleName}".`,
    content,
  })
}
