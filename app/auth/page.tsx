"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApiConnection } from "@/components/api-connection-manager"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const { validateApiKey, setApiKey } = useApiConnection()
  const [key, setKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)
    setError("")

    try {
      const isValid = await validateApiKey(key)

      if (isValid) {
        // Set the API key in the context
        setApiKey(key)

        // Store authentication status
        localStorage.setItem("is_authenticated", "true")
        localStorage.setItem("api_key", key)

        // Show success message briefly
        setSuccess(true)

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setError("Invalid API key. Please try again.")
      }
    } catch (err) {
      setError("Error validating API key. Please try again.")
      console.error(err)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI Family Admin</CardTitle>
          <CardDescription>Enter your API key to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isValidating || success}>
                {isValidating ? "Validating..." : success ? "Success!" : "Login"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="flex items-center gap-2 mt-4 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 mt-4 text-green-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Login successful! Redirecting...</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-gray-500">Don&apos;t have an API key? Contact your administrator.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
