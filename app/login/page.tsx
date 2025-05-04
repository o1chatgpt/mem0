"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { DemoLoginOptions } from "./demo-login-options"
import { DemoModeToggle } from "@/components/demo-mode-toggle"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setIsSuccess(false)

    try {
      console.log("Attempting login with:", { username })

      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          errorMessage = `${response.status}: ${response.statusText || errorMessage}`
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log("Login successful:", data)

      // Show success message
      setIsSuccess(true)
      setIsLoading(false)

      // Wait a moment to show the success message, then redirect
      setTimeout(() => {
        // Use window.location for a hard redirect
        window.location.href = "/"
      }, 2000)
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
      setIsLoading(false)
    }
  }

  // Simple login function for testing
  const handleSimpleLogin = async () => {
    try {
      const response = await fetch("/api/auth/bypass-login")
      if (response.ok) {
        window.location.href = "/"
      } else {
        setError("Simple login failed")
      }
    } catch (err) {
      console.error("Simple login error:", err)
      setError("An error occurred during simple login")
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
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Login successful! Redirecting to dashboard...</AlertDescription>
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

                <div className="pt-4 border-t">
                  <Button type="button" variant="outline" className="w-full" onClick={handleSimpleLogin}>
                    Quick Login (Debug)
                  </Button>
                </div>
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
