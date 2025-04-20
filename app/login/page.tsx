import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32 bg-background">
        <LoginForm />
      </main>
    </div>
  )
}
