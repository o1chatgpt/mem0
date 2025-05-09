import type React from "react"
export default function MemoryAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>{children}</div>
}
