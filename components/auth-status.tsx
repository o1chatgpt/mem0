"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export function AuthStatus() {
  const [mounted, setMounted] = useState(false)
  const auth = useAuth()

  // Only show the auth status after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <span className="flex items-center">Loading...</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {auth?.user ? (
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard" className="flex items-center">
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login" className="flex items-center">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-800">
            <Link href="/register" className="flex items-center">
              Create Account
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
