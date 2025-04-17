"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Key, LogIn } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoginFormProps {
  onClose: () => void
  onLogin: (userData: { name: string; email: string; role: string }) => void
  onSignup: () => void
}

export function LoginForm({ onClose, onLogin, onSignup }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [activeTab, setActiveTab] = useState<"credentials" | "api">("credentials")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would validate credentials with a backend
      if (activeTab === "credentials" && email && password) {
        // Simulate successful login
        onLogin({
          name: email.split("@")[0],
          email,
          role: email.includes("admin") ? "admin" : "user",
        })
      } else if (activeTab === "api" && apiKey) {
        // Simulate API key validation
        if (apiKey.startsWith("sk-")) {
          onLogin({
            name: "API User",
            email: "api@example.com",
            role: "user",
          })
        } else {
          setError("Invalid API key format")
        }
      } else {
        setError("Please fill in all required fields")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <LogIn className="h-5 w-5" /> Log In
            </CardTitle>
            <CardDescription>Access your AI Family Toolkit account</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "credentials" | "api")}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="credentials">Email & Password</TabsTrigger>
              <TabsTrigger value="api">API Key</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="api">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" /> OpenAI API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    required
                  />
                  <p className="text-xs text-gray-500">Your API key is stored locally and never sent to our servers</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Validating..." : "Connect with API Key"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center w-full">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={onSignup}>
              Sign up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
