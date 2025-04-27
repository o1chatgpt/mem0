import { ClientProvider } from "@/components/client-provider"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <ClientProvider>
      <LoginForm />
    </ClientProvider>
  )
}
