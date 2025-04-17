"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting login with:", { email })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Login response:", { data, error })

      if (error) {
        throw error
      }

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Use window.location for a full page refresh to ensure auth state is updated
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // For testing - let's add a direct navigation button
  const goToDashboard = () => {
    window.location.href = "/dashboard"
  }

  return (
    <Card className="mx-auto w-full max-w-md bg-background border-gray-800">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-6">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">Login to StreamLine</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-secondary border-gray-700 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-secondary border-gray-700 text-white"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          {/* Temporary direct navigation button for testing */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 border-gray-700 text-white"
            onClick={goToDashboard}
          >
            Go to Dashboard Directly
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-gray-400">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-secondary/80">
          Continue with Google
        </Button>
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
