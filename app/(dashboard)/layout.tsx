import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-64">
        <Sidebar isCollapsed={false} />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
