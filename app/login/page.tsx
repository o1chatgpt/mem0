"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DemoLoginOptions } from "./demo-login-options"
import { DemoModeToggle } from "@/components/demo-mode-toggle"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const router = useRouter()

  // Effect to handle redirection after successful login
  useEffect(() => {
    if (loginSuccess) {
      // Add a small delay to ensure cookie is set before redirecting
      const redirectTimer = setTimeout(() => {
        router.push("/")
        // Force a hard refresh to ensure middleware picks up the new auth state
        window.location.href = "/"
      }, 500)

      return () => clearTimeout(redirectTimer)
    }
  }, [loginSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setLoginSuccess(false)

    try {
      console.log("Attempting login with:", { username, password })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // If JSON parsing fails, use the status text
          errorMessage = `${response.status}: ${response.statusText || errorMessage}`
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Parse JSON only if response is ok
      const data = await response.json()
      console.log("Login successful:", data)

      // Set login success state to trigger redirection
      setLoginSuccess(true)
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">File Manager with Mem0</CardTitle>
            <CardDescription className="text-center">Login to access your files and memory</CardDescription>
          </CardHeader>
          <CardContent>
            {loginSuccess ? (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>Login successful! Redirecting...</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <DemoModeToggle />
          </CardFooter>
        </Card>

        <DemoLoginOptions />
        <div className="mt-4 text-sm text-center text-muted-foreground">
          <p className="font-medium">Admin credentials:</p>
          <p>Username: admin</p>
          <p>Password: !July1872</p>
        </div>
      </div>
    </div>
  )
}
