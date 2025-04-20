"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, LogIn, Key, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginUser, bypassLogin } from "@/app/actions/auth-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await loginUser(username, password)

      if (result.success) {
        router.push("/")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleBypassLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await bypassLogin()

      if (result.success) {
        router.push(result.redirectUrl || "/")
      } else {
        setError(result.error || "Bypass login failed")
      }
    } catch (error) {
      console.error("Bypass login error:", error)
      setError("An unexpected error occurred")
    } finally {
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
          <CardDescription className="text-center">Sign in to access your files and server</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleBypassLogin} disabled={loading}>
            <LogIn className="h-4 w-4 mr-2" />
            Quick Demo Access
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link href="/help" className="underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
