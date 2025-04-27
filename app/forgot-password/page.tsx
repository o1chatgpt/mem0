import { ClientProvider } from "@/components/client-provider"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <ClientProvider>
      <ForgotPasswordForm />
    </ClientProvider>
  )
}
