import { createClientComponentClient } from "@/lib/db"
import { emitWebhookEvent, type WebhookEventType } from "@/lib/webhook-utils"
import type { Database } from "@/types/database"

// Client-side webhook service
export const webhookService = {
  // Get all webhooks for the current user
  async getWebhooks() {
    const supabase = createClientComponentClient<Database>()
    const { data: webhooks, error } = await supabase
      .from("fm_webhooks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching webhooks:", error)
      throw error
    }

    return webhooks || []
  },

  // Get a webhook by ID
  async getWebhook(id: string) {
    const supabase = createClientComponentClient<Database>()
    const { data: webhook, error } = await supabase.from("fm_webhooks").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching webhook:", error)
      throw error
    }

    return webhook
  },

  // Create a new webhook
  async createWebhook(webhook: {
    name: string
    endpoint: string
    description?: string
    events: string[]
    secret: string
    is_active?: boolean
  }) {
    const supabase = createClientComponentClient<Database>()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("fm_webhooks")
      .insert({
        id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        name: webhook.name,
        endpoint: webhook.endpoint,
        description: webhook.description || null,
        events: webhook.events,
        secret: webhook.secret,
        is_active: webhook.is_active !== undefined ? webhook.is_active : true,
        user_id: Number.parseInt(user.id),
      })
      .select()

    if (error) {
      console.error("Error creating webhook:", error)
      throw error
    }

    return data[0]
  },

  // Update a webhook
  async updateWebhook(
    id: string,
    updates: {
      name?: string
      endpoint?: string
      description?: string | null
      events?: string[]
      is_active?: boolean
    },
  ) {
    const supabase = createClientComponentClient<Database>()
    const { data, error } = await supabase.from("fm_webhooks").update(updates).eq("id", id).select()

    if (error) {
      console.error("Error updating webhook:", error)
      throw error
    }

    return data[0]
  },

  // Delete a webhook
  async deleteWebhook(id: string) {
    const supabase = createClientComponentClient<Database>()
    const { error } = await supabase.from("fm_webhooks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting webhook:", error)
      throw error
    }

    return true
  },

  // Regenerate webhook secret
  async regenerateSecret(id: string) {
    const secret = generateWebhookSecret()
    const supabase = createClientComponentClient<Database>()
    const { data, error } = await supabase.from("fm_webhooks").update({ secret }).eq("id", id).select()

    if (error) {
      console.error("Error regenerating webhook secret:", error)
      throw error
    }

    return data[0]
  },

  // Get webhook events
  async getWebhookEvents(webhookId?: string, limit = 50) {
    const supabase = createClientComponentClient<Database>()
    let query = supabase.from("fm_webhook_events").select("*").order("timestamp", { ascending: false }).limit(limit)

    if (webhookId) {
      query = query.eq("webhook_id", webhookId)
    }

    const { data: events, error } = await query

    if (error) {
      console.error("Error fetching webhook events:", error)
      throw error
    }

    return events || []
  },

  // Test a webhook
  async testWebhook(webhookId: string, eventType: WebhookEventType, payload: any) {
    try {
      const result = await fetch(`/api/webhooks/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookId,
          eventType,
          payload,
        }),
      })

      if (!result.ok) {
        const errorData = await result.json()
        throw new Error(errorData.error || "Failed to test webhook")
      }

      return await result.json()
    } catch (error) {
      console.error("Error testing webhook:", error)
      throw error
    }
  },
}

// Generate a webhook secret
export function generateWebhookSecret() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = "whsec_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Server-side webhook functions
export async function triggerWebhook(eventType: WebhookEventType, data: any) {
  return await emitWebhookEvent(eventType, data)
}
