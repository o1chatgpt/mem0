import { ClientProvider } from "@/components/client-provider"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <ClientProvider>
      <ResetPasswordForm />
    </ClientProvider>
  )
}
