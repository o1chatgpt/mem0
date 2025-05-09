import { EmailTemplatePreview } from "@/components/email-template-preview"

export default function EmailTemplatesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Email Templates</h1>
      <p className="text-gray-600 mb-8">
        Preview and test email templates used for scheduled exports and notifications.
      </p>

      <EmailTemplatePreview />
    </div>
  )
}
