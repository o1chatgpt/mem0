import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Get the webhook ID from the URL
    const url = new URL(req.url)
    const webhookId = url.pathname.split("/").pop()

    if (!webhookId) {
      return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 })
    }

    // Get the signature from the headers
    const signature = req.headers.get("x-webhook-signature")

    if (!signature) {
      return NextResponse.json({ error: "Webhook signature is missing" }, { status: 401 })
    }

    // Get the request body
    const body = await req.json()

    // Get the webhook from the database
    const supabase = createServerClient()
    const { data: webhook, error } = await supabase.from("fm_webhooks").select("*").eq("id", webhookId).single()

    if (error || !webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Verify the signature
    const isValid = verifySignature(JSON.stringify(body), signature, webhook.secret)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Check if the webhook is active
    if (!webhook.is_active) {
      return NextResponse.json({ error: "Webhook is inactive" }, { status: 400 })
    }

    // Check if the event is supported by this webhook
    const event = body.event

    if (!webhook.events.includes(event)) {
      return NextResponse.json({ error: "Event not supported by this webhook" }, { status: 400 })
    }

    // Process the webhook event
    await processWebhookEvent(webhook.id, event, body)

    // Return a success response
    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Verify the webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

// Process the webhook event
async function processWebhookEvent(webhookId: string, event: string, payload: any) {
  const supabase = createServerClient()

  // Log the webhook event
  await supabase.from("fm_webhook_events").insert({
    webhook_id: webhookId,
    event,
    payload,
    status: "success",
    status_code: 200,
  })

  // Update the webhook last triggered timestamp
  await supabase
    .from("fm_webhooks")
    .update({
      last_triggered: new Date().toISOString(),
      success_count: supabase.rpc("increment_webhook_success_count", { webhook_id: webhookId }),
    })
    .eq("id", webhookId)

  // Process the event based on its type
  switch (event) {
    case "file.created":
    case "file.updated":
    case "file.deleted":
      // Process file events
      break
    case "folder.created":
    case "folder.updated":
    case "folder.deleted":
      // Process folder events
      break
    case "memory.created":
    case "memory.updated":
    case "memory.deleted":
      // Process memory events
      break
    case "ai.conversation":
      // Process AI conversation events
      break
    default:
      // Unknown event type
      break
  }
}
