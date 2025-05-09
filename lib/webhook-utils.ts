import { createServerClient } from "@/lib/db"
import crypto from "crypto"

// Event types
export type WebhookEventType =
  | "file.created"
  | "file.updated"
  | "file.deleted"
  | "folder.created"
  | "folder.updated"
  | "folder.deleted"
  | "memory.created"
  | "memory.updated"
  | "memory.deleted"
  | "ai.conversation"

// Function to emit webhook events
export async function emitWebhookEvent(eventType: WebhookEventType, data: any) {
  try {
    const supabase = createServerClient()

    // Find all active webhooks that are subscribed to this event
    const { data: webhooks, error } = await supabase
      .from("fm_webhooks")
      .select("*")
      .eq("is_active", true)
      .contains("events", [eventType])

    if (error || !webhooks || webhooks.length === 0) {
      // No webhooks found or error occurred
      return
    }

    // Create the event payload
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const timestamp = new Date().toISOString()

    const payload = {
      id: eventId,
      event: eventType,
      timestamp,
      data,
    }

    // Send the webhook to all subscribed endpoints
    const deliveryPromises = webhooks.map(async (webhook) => {
      try {
        // Create the signature
        const signature = createSignature(JSON.stringify(payload), webhook.secret)

        // Send the webhook
        const startTime = Date.now()
        const response = await fetch(webhook.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-ID": webhook.id,
            "X-Event-ID": eventId,
          },
          body: JSON.stringify(payload),
        })
        const responseTime = Date.now() - startTime

        // Log the webhook event
        await supabase.from("fm_webhook_events").insert({
          id: eventId,
          webhook_id: webhook.id,
          event: eventType,
          payload,
          status: response.ok ? "success" : "failure",
          status_code: response.status,
          response_time: responseTime,
          timestamp,
        })

        // Update the webhook stats
        if (response.ok) {
          await supabase
            .from("fm_webhooks")
            .update({
              last_triggered: timestamp,
              success_count: supabase.rpc("increment_webhook_success_count", { webhook_id: webhook.id }),
            })
            .eq("id", webhook.id)
        } else {
          await supabase
            .from("fm_webhooks")
            .update({
              last_triggered: timestamp,
              failure_count: supabase.rpc("increment_webhook_failure_count", { webhook_id: webhook.id }),
            })
            .eq("id", webhook.id)
        }

        return {
          webhookId: webhook.id,
          success: response.ok,
          statusCode: response.status,
        }
      } catch (error) {
        console.error(`Error delivering webhook ${webhook.id}:`, error)

        // Log the webhook event failure
        await supabase.from("fm_webhook_events").insert({
          id: eventId,
          webhook_id: webhook.id,
          event: eventType,
          payload,
          status: "failure",
          status_code: 0, // Connection error
          timestamp,
        })

        // Update the webhook stats
        await supabase
          .from("fm_webhooks")
          .update({
            last_triggered: timestamp,
            failure_count: supabase.rpc("increment_webhook_failure_count", { webhook_id: webhook.id }),
          })
          .eq("id", webhook.id)

        return {
          webhookId: webhook.id,
          success: false,
          error: String(error),
        }
      }
    })

    // Wait for all webhooks to be delivered
    return Promise.all(deliveryPromises)
  } catch (error) {
    console.error("Error emitting webhook event:", error)
    return []
  }
}

// Create a signature for the webhook payload
function createSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret)
  return hmac.update(payload).digest("hex")
}
