"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
          <p className="mb-8 text-lg text-muted-foreground">We're sorry, but an unexpected error occurred.</p>
          {error.digest && <p className="mb-4 text-sm text-muted-foreground">Error digest: {error.digest}</p>}
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  )
}
