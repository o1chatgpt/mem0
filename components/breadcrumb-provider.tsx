"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { generateBreadcrumbs } from "@/lib/breadcrumb-utils"
import type { BreadcrumbItem } from "@/components/breadcrumb"

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
})

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const pathname = usePathname()

  useEffect(() => {
    // Generate breadcrumbs based on the current path
    const generatedBreadcrumbs = generateBreadcrumbs(pathname)
    setBreadcrumbs(generatedBreadcrumbs)
  }, [pathname])

  return <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider")
  }
  return context
}
