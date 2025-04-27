"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Only show the header content after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="border-b border-gray-800 bg-[hsl(222_47%_11%)]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              WebContainer Manager
            </Link>
          </div>
          <div className="flex items-center space-x-4">{/* Loading placeholder */}</div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-gray-800 bg-[hsl(222_47%_11%)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            WebContainer Manager
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <nav className="hidden md:flex items-center space-x-4 mr-4">
                <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/projects" className="text-sm text-gray-300 hover:text-white">
                  Projects
                </Link>
                <Link href="/templates" className="text-sm text-gray-300 hover:text-white">
                  Templates
                </Link>
                <Link href="/docs" className="text-sm text-gray-300 hover:text-white">
                  Documentation
                </Link>
              </nav>
              <UserNav />
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center space-x-4 mr-4">
                <Link href="/features" className="text-sm text-gray-300 hover:text-white">
                  Features
                </Link>
                <Link href="/pricing" className="text-sm text-gray-300 hover:text-white">
                  Pricing
                </Link>
                <Link href="/docs" className="text-sm text-gray-300 hover:text-white">
                  Documentation
                </Link>
              </nav>
              <Link href="/login">
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
