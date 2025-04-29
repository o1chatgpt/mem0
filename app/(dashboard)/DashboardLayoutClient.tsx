"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Mem0Provider } from "@/components/mem0-provider"
import { CrewAIProvider } from "@/components/crew-ai-provider"
import { PreferencesProvider } from "@/components/preferences-provider"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Add a simple error boundary component
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Wrap the PreferencesProvider in a try-catch block to prevent errors from breaking the entire app
export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary fallback={<div className="p-4">Error loading preferences. Using default settings.</div>}>
            <PreferencesProvider>
              <Mem0Provider>
                <CrewAIProvider>
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">{children}</main>
                  </div>
                </CrewAIProvider>
              </Mem0Provider>
            </PreferencesProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
