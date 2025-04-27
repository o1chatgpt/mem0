"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"

export function ClientProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
