import { ClientProvider } from "@/components/client-provider"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <ClientProvider>
      <RegisterForm />
    </ClientProvider>
  )
}
