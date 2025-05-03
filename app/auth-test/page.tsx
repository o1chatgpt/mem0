"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthTestPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        setAuthInfo(data)
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading authentication information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Authentication Status</h2>
              <p>{authInfo?.authenticated ? "✅ You are authenticated" : "❌ You are not authenticated"}</p>
            </div>

            {authInfo?.authenticated && (
              <div>
                <h2 className="text-lg font-semibold">User Information</h2>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                  {JSON.stringify(authInfo.user, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex space-x-4">
              <Button onClick={() => router.push("/")}>Go to Home</Button>
              {authInfo?.authenticated && (
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
