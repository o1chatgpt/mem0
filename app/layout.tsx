import type React from "react"
import { Mem0Provider } from "@/contexts/mem0-context"
import "./globals.css"
import type { Metadata } from "next"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

export const metadata: Metadata = {
  title: "AI Family Manager",
  description: "Manage your AI family members with memory capabilities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="flex-none relative z-50 py-4 border-b">
          <div className="container flex items-center justify-between">
            <Link href="/" className="mr-4 flex items-center space-x-2">
              <span className="font-bold">AI Family</span>
            </Link>
            <ModeToggle />
          </div>
        </header>
        <Mem0Provider>{children}</Mem0Provider>
      </body>
    </html>
  )
}


import './globals.css'