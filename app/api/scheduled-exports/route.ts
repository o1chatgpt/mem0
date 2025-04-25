import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import { prepareAnalyticsDataForExport } from "@/lib/export-utils"
import { getMemoryStats } from "@/lib/mem0"
import nodemailer from "nodemailer"

// This endpoint will be called by a cron job to process scheduled exports
export async function POST(request: Request) {
  try {
    const { authorization } = await request.headers

    // Simple API key check - in production, use a more secure method
    if (authorization !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get all active schedules that are due
    const now = new Date()
    const { data: schedules, error } = await supabase
      .from("fm_export_schedules")
      .select("*")
      .eq("is_active", true)
      .lte("next_scheduled", now.toISOString())

    if (error) {
      console.error("Error fetching schedules:", error)
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ message: "No schedules to process" })
    }

    // Process each schedule
    const results = await Promise.allSettled(
      schedules.map(async (schedule) => {
        try {
          // Get memory stats for the user/AI member
          const stats = await getMemoryStats(schedule.user_id, schedule.ai_member_id || undefined)

          // Prepare data for export
          const analyticsData = prepareAnalyticsDataForExport(stats)

          // Generate filename
          const date = new Date().toISOString().split("T")[0]
          const aiMemberSuffix = schedule.ai_member_id ? `-ai-${schedule.ai_member_id}` : ""
          const fileName = `memory-analytics-${date}${aiMemberSuffix}`

          // Generate export file
          let fileContent: Buffer
          let fileType: string
          let fileExtension: string

          if (schedule.format === "csv") {
            // For CSV, we need to convert the exportAsCSV function to return the content instead of triggering a download
            const csvContent = generateCSVContent(analyticsData)
            fileContent = Buffer.from(csvContent)
            fileType = "text/csv"
            fileExtension = "csv"
          } else {
            // For PDF, we need to modify the exportAsPDF function to return the PDF buffer
            fileContent = await generatePDFBuffer(analyticsData)
            fileType = "application/pdf"
            fileExtension = "pdf"
          }

          // Send email with attachment
          await sendExportEmail(
            schedule.email,
            `Memory Analytics Export - ${schedule.name}`,
            `Your scheduled memory analytics export is attached. This report was generated on ${new Date().toLocaleString()}.`,
            fileContent,
            `${fileName}.${fileExtension}`,
            fileType,
          )

          // Calculate next scheduled time
          const nextScheduled = calculateNextScheduledTime(schedule)

          // Update schedule with last_sent and next_scheduled
          await supabase
            .from("fm_export_schedules")
            .update({
              last_sent: now.toISOString(),
              next_scheduled: nextScheduled.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", schedule.id)

          return { success: true, scheduleId: schedule.id }
        } catch (error) {
          console.error(`Error processing schedule ${schedule.id}:`, error)
          return { success: false, scheduleId: schedule.id, error }
        }
      }),
    )

    return NextResponse.json({
      processed: schedules.length,
      results,
    })
  } catch (error) {
    console.error("Error in scheduled exports API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to calculate the next scheduled time
function calculateNextScheduledTime(schedule: any) {
  const now = new Date()
  const nextDate = new Date()

  // Set time
  nextDate.setHours(schedule.hour)
  nextDate.setMinutes(schedule.minute)
  nextDate.setSeconds(0)
  nextDate.setMilliseconds(0)

  // Adjust date based on frequency
  if (schedule.frequency === "daily") {
    // Schedule for tomorrow
    nextDate.setDate(nextDate.getDate() + 1)
  } else if (schedule.frequency === "weekly") {
    // Calculate days to add to get to the next occurrence
    const dayOfWeek = schedule.day_of_week
    const currentDay = nextDate.getDay()

    // Add 7 days to get to next week's occurrence
    let daysToAdd = 7 + dayOfWeek - currentDay
    if (daysToAdd > 7) daysToAdd -= 7

    nextDate.setDate(nextDate.getDate() + daysToAdd)
  } else if (schedule.frequency === "monthly") {
    const dayOfMonth = schedule.day_of_month

    // Move to next month
    nextDate.setMonth(nextDate.getMonth() + 1)

    // Try to set the day
    nextDate.setDate(dayOfMonth)

    // Handle case where the day doesn't exist in the month
    if (nextDate.getDate() !== dayOfMonth) {
      // Set to the last day of the month
      nextDate.setDate(0)
    }
  }

  return nextDate
}

// Helper function to generate CSV content
function generateCSVContent(data: any) {
  let csvContent = ""

  // Add summary section
  csvContent += "MEMORY ANALYTICS SUMMARY\n"
  csvContent += `Total Memories,${data.totalMemories}\n`
  csvContent += `Categories Used,${data.categoriesUsed}\n`
  csvContent += `Memory Span,${data.memorySpan}\n`
  csvContent += `Uncategorized Memories,${data.uncategorizedCount}\n`
  csvContent += `Oldest Memory,${data.oldestDate || "N/A"}\n`
  csvContent += `Newest Memory,${data.newestDate || "N/A"}\n\n`

  // Add category distribution
  csvContent += "CATEGORY DISTRIBUTION\n"
  csvContent += "Category,Count,Percentage\n"
  data.categoryDistribution.forEach((category: any) => {
    csvContent += `${category.name},${category.count},${category.percentage}%\n`
  })
  csvContent += "\n"

  // Add monthly distribution
  csvContent += "MONTHLY DISTRIBUTION\n"
  csvContent += "Month,Count\n"
  data.monthlyDistribution.forEach((month: any) => {
    csvContent += `${month.month},${month.count}\n`
  })

  return csvContent
}

// Helper function to generate PDF buffer
async function generatePDFBuffer(data: any) {
  // This is a placeholder - in a real implementation, you would use jspdf
  // to generate the PDF and return it as a buffer
  // For now, we'll just return a simple buffer
  return Buffer.from("PDF content would go here")
}

// Helper function to send email with attachment
async function sendExportEmail(
  to: string,
  subject: string,
  text: string,
  attachment: Buffer,
  filename: string,
  contentType: string,
) {
  // Create a test account if no SMTP credentials are provided
  let testAccount
  if (!process.env.SMTP_HOST) {
    testAccount = await nodemailer.createTestAccount()
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || testAccount?.smtp.host || "smtp.ethereal.email",
    port: Number.parseInt(process.env.SMTP_PORT || testAccount?.smtp.port.toString() || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || testAccount?.user || "",
      pass: process.env.SMTP_PASS || testAccount?.pass || "",
    },
  })

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"File Manager" <noreply@filemanager.com>',
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content: attachment,
        contentType,
      },
    ],
  })

  console.log("Message sent: %s", info.messageId)

  // If using Ethereal, log the URL
  if (testAccount) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  }

  return info
}
