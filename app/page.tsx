import { Suspense } from "react"
import { HomeContent } from "@/components/home-content"
import { ClientProvider } from "@/components/client-provider"

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientProvider>
        <HomeContent />
      </ClientProvider>
    </Suspense>
  )
}
