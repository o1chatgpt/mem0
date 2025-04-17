import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Check if the user is authenticated
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has("admin_session")

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
