import WebhookManager from "@/components/webhooks/webhook-manager"

export const metadata = {
  title: "Webhook Manager",
  description: "Create and manage webhooks to receive data from external services",
}

export default function WebhooksPage() {
  return (
    <div className="container mx-auto py-6">
      <WebhookManager />
    </div>
  )
}
