import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SupabaseProvider } from "@/lib/supabase-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "File Manager with Mem0",
  description: "A file manager with AI family members powered by Mem0",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}


import './globals.css'