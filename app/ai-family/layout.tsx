import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Family",
  description: "Your intelligent AI assistant family for various tasks",
}

export default function AIFamilyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
