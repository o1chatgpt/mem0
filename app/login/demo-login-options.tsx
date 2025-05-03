"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemoMode } from "@/lib/demo-mode-context"
import { useRouter } from "next/navigation"
import { Shield, Eye, Edit, Database, Globe, Brain, User } from "lucide-react"

export function DemoLoginOptions() {
  const { isDemoMode, setDemoRole } = useDemoMode()
  const router = useRouter()

  if (!isDemoMode) {
    return null
  }

  const demoUsers = [
    {
      role: "admin",
      title: "Administrator",
      description: "Full access to all features",
      icon: <Shield className="h-5 w-5 text-red-500" />,
    },
    {
      role: "editor",
      title: "Editor",
      description: "Can edit content but not system settings",
      icon: <Edit className="h-5 w-5 text-blue-500" />,
    },
    {
      role: "viewer",
      title: "Viewer",
      description: "Read-only access to content",
      icon: <Eye className="h-5 w-5 text-green-500" />,
    },
    {
      role: "server-admin",
      title: "Server Admin",
      description: "Manages server infrastructure",
      icon: <Database className="h-5 w-5 text-purple-500" />,
    },
    {
      role: "website-admin",
      title: "Website Admin",
      description: "Manages websites and web content",
      icon: <Globe className="h-5 w-5 text-orange-500" />,
    },
    {
      role: "ai-admin",
      title: "AI Admin",
      description: "Manages AI features and memory",
      icon: <Brain className="h-5 w-5 text-indigo-500" />,
    },
  ]

  const handleDemoLogin = async (role: string) => {
    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        setDemoRole(role)
        router.push("/")
      } else {
        console.error("Demo login failed")
      }
    } catch (error) {
      console.error("Error during demo login:", error)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">Demo User Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoUsers.map((user) => (
          <Card key={user.role} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {user.icon}
                <CardTitle className="text-lg">{user.title}</CardTitle>
              </div>
              <CardDescription>{user.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={() => handleDemoLogin(user.role)}>
                <User className="h-4 w-4 mr-2" />
                Login as {user.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
