import type React from "react"
import DashboardLayoutClient from "./DashboardLayoutClient"

export const metadata = {
  title: "File Manager",
  description: "A file management system with AI capabilities",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient children={children} />
}
