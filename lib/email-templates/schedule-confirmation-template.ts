import { generateBaseEmailTemplate } from "./base-template"

export type ScheduleConfirmationData = {
  scheduleName: string
  frequency: "daily" | "weekly" | "monthly"
  dayInfo: string
  timeInfo: string
  format: "pdf" | "csv"
  firstExportDate: string
  aiMember?: string
}

export function generateScheduleConfirmationTemplate(data: ScheduleConfirmationData, recipientName?: string) {
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,"

  const frequencyText = {
    daily: "every day",
    weekly: `every ${data.dayInfo}`,
    monthly: `on the ${data.dayInfo} of each month`,
  }[data.frequency]

  const aiMemberInfo = data.aiMember
    ? `<p>This schedule will export memory data for AI family member: <strong>${data.aiMember}</strong>.</p>`
    : "<p>This schedule will export memory data for all AI family members.</p>"

  const content = `
    <h2>Export Schedule Confirmation</h2>
    <p>${greeting}</p>
    <p>Your new export schedule <strong>"${data.scheduleName}"</strong> has been created successfully.</p>
    
    ${aiMemberInfo}
    
    <div class="info-box">
      <h3>Schedule Details</h3>
      <p>Frequency: ${data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1)} (${frequencyText})</p>
      <p>Time: ${data.timeInfo}</p>
      <p>Format: ${data.format.toUpperCase()}</p>
      <p>First Export: ${data.firstExportDate}</p>
    </div>
    
    <div class="divider"></div>
    
    <p>You'll receive an email with your export file according to this schedule. You can modify or cancel this schedule at any time from the Memory Analytics section in your File Manager dashboard.</p>
    
    <div class="text-center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://filemanager.app"}/memory-analytics" class="button">Manage Export Schedules</a>
    </div>
    
    <p>Thank you for using File Manager for your memory management needs.</p>
  `

  return generateBaseEmailTemplate({
    title: `Export Schedule Created: ${data.scheduleName}`,
    preheaderText: `Your new export schedule "${data.scheduleName}" has been created successfully.`,
    content,
  })
}
