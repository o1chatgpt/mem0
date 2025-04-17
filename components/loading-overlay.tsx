"use client"

import { useAppContext } from "@/lib/app-context"

export function LoadingOverlay() {
  const { loading } = useAppContext()

  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm">Loading...</p>
      </div>
    </div>
  )
}
