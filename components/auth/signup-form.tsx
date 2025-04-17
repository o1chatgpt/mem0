"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiConnection } from "../api-connection-manager"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Key } from "lucide-react"

interface SignUpFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

export function SignUpForm({ onSuccess, onLoginClick }: SignUpFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const { validateApiKey, setApiKey: setGlobalApiKey } = useApiConnection()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate the API key
      const isValid = await validateApiKey(apiKey)

      if (!isValid) {
        setError("Invalid API key. Please check and try again.")
        setIsLoading(false)
        return
      }

      // In a real app, you would create a user in the database
      // For now, we'll just store in localStorage
      if (!email.includes("@")) {
        setError("Please enter a valid email address.")
        setIsLoading(false)
        return
      }

      if (name.length < 2) {
        setError("Please enter a valid name.")
        setIsLoading(false)
        return
      }

      // Set the API key globally
      setGlobalApiKey(apiKey)

      // Store user info in localStorage
      localStorage.setItem("user_name", name)
      localStorage.setItem("user_email", email)
      localStorage.setItem("user_role", "user") // Default role for new users
      localStorage.setItem("is_logged_in", "true")
      localStorage.setItem("openai_api_key", apiKey)

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("An error occurred during sign up. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Sign up to access the AI Family Toolkit</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Your API key is used for authentication and to access OpenAI services
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onLoginClick}>
            Log In
          </Button>
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Key className="h-3 w-3 mr-1" />
          Your API key is stored locally and never shared
        </div>
      </CardFooter>
    </Card>
  )
}
