import dynamic from "next/dynamic"

// Import the client wrapper with no SSR
const AgentsClientWrapper = dynamic(() => import("./client-wrapper"), {
  ssr: true,
})

export default function AgentsPage() {
  return <AgentsClientWrapper />
}
