"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()

        if (data.authenticated) {
          // User is already authenticated, redirect to main page
          router.push("/")
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router])

  const handleBypassLogin = async () => {
    setLoading(true)

    try {
      // Call the bypass login endpoint
      const response = await fetch("/api/auth/bypass-login")
      const data = await response.json()

      if (data.success) {
        // Use router.push instead of window.location for a smoother transition
        router.push("/")
      } else {
        console.error("Login failed:", data.error)
        setLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoading(false)
    }
  }

  // Don't render anything until we've checked authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">File Manager with Mem0</CardTitle>
          <CardDescription className="text-center">Access your files and server</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full py-6 text-lg" onClick={handleBypassLogin} disabled={loading}>
            <LogIn className="h-5 w-5 mr-2" />
            {loading ? "Logging in..." : "Enter File Manager"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              If the login button doesn't work, use the direct entry link:
            </p>
            <Button asChild variant="outline">
              <Link href="/direct-entry">Direct Entry (No Authentication)</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
