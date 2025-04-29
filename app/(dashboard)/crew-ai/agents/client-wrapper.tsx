"use client"

import dynamic from "next/dynamic"
import AgentsPageServer from "./page.server"

// Dynamically import the client component with no SSR
const AgentsPageClient = dynamic(() => import("./page.client"), {
  ssr: false,
  loading: () => <AgentsPageServer />,
})

export default function AgentsClientWrapper() {
  return <AgentsPageClient />
}
