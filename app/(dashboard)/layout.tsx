import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Mem0Provider } from "@/components/mem0-provider"
import { CrewAIProvider } from "@/components/crew-ai-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Mem0Provider>
      <CrewAIProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </CrewAIProvider>
    </Mem0Provider>
  )
}
