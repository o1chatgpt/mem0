import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MemoryProvider } from "@/components/memory-context-provider"
import { BreadcrumbProvider } from "@/components/breadcrumb-provider"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Toaster } from "@/components/ui/toaster"

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
          <BreadcrumbProvider>
            <MemoryProvider>
              <div className="flex min-h-screen">
                <div className="hidden md:block w-64">
                  <Sidebar isCollapsed={false} />
                </div>
                <div className="flex-1 overflow-auto">
                  <PageHeader />
                  <main className="container px-4 py-6">{children}</main>
                </div>
              </div>
              <Toaster />
            </MemoryProvider>
          </BreadcrumbProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
