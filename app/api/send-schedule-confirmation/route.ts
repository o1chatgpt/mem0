import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import {
  generateScheduleConfirmationTemplate,
  type ScheduleConfirmationData,
} from "@/lib/email-templates/schedule-confirmation-template"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.email || !data.scheduleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create email template
    const confirmationData: ScheduleConfirmationData = {
      scheduleName: data.scheduleName,
      frequency: data.frequency,
      dayInfo: data.dayInfo,
      timeInfo: data.timeInfo,
      format: data.format,
      firstExportDate: data.firstExportDate,
      aiMember: data.aiMember,
    }

    const emailHtml = generateScheduleConfirmationTemplate(confirmationData)

    // Send email
    await sendEmail(data.email, `Export Schedule Created: ${data.scheduleName}`, emailHtml)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
  }
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
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

  // Send mail
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"File Manager" <noreply@filemanager.com>',
    to,
    subject,
    html: htmlContent,
  })

  console.log("Confirmation email sent: %s", info.messageId)

  // If using Ethereal, log the URL
  if (testAccount) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  }

  return info
}
