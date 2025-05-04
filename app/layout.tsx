import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DemoModeProvider } from "@/lib/demo-mode-context"
import { DemoModeIndicator } from "@/components/demo-mode-indicator"

export const metadata = {
  title: "File Manager with Mem0",
  description: "A file manager with memory capabilities",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DemoModeProvider>
            {children}
            <DemoModeIndicator />
          </DemoModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
