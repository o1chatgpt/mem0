"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Use a simple loading component instead of importing from page.server
function LoadingComponent() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Agents</h1>
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-gray-500">Loading agents...</p>
      </div>
    </div>
  )
}

// Dynamically import the client component with no SSR
const AgentsPageClient = dynamic(() => import("./page.client"), {
  ssr: false,
  loading: () => <LoadingComponent />,
})

export default function AgentsClientWrapper() {
  const [isClient, setIsClient] = useState(false)

  // Ensure we're in the client before rendering the dynamic component
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingComponent />
  }

  return <AgentsPageClient />
}
