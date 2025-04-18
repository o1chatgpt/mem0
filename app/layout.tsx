import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { EnvValidationProvider } from "@/components/env-validation-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "File Manager",
  description: "A modern file management system with AI capabilities",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <EnvValidationProvider>
            <main className="min-h-screen bg-background">{children}</main>
          </EnvValidationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
