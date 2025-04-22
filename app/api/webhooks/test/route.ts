import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import { emitWebhookEvent } from "@/lib/webhook-utils"

export async function POST(req: NextRequest) {
  try {
    const { webhookId, eventType, payload } = await req.json()

    if (!webhookId) {
      return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 })
    }

    if (!eventType) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 })
    }

    // Get the webhook from the database
    const supabase = createServerClient()
    const { data: webhook, error } = await supabase.from("fm_webhooks").select("*").eq("id", webhookId).single()

    if (error || !webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Check if the webhook is active
    if (!webhook.is_active) {
      return NextResponse.json({ error: "Webhook is inactive" }, { status: 400 })
    }

    // Check if the event is supported by this webhook
    if (!webhook.events.includes(eventType)) {
      return NextResponse.json({ error: "Event not supported by this webhook" }, { status: 400 })
    }

    // Create a test payload
    const testPayload = {
      ...payload,
      test: true,
      timestamp: new Date().toISOString(),
    }

    // Send the test webhook
    const result = await emitWebhookEvent(eventType, testPayload)

    // Return the result
    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully",
      result,
    })
  } catch (error) {
    console.error("Error testing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
