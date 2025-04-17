"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Zap, User, Settings, LogOut, Grid, PlusCircle, X, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { disconnectIntegrationAction } from "@/app/actions"
import { connectIntegrationAction } from "@/app/actions"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthConnectionDetails } from "@/components/oauth-connection-details"
import { IntegrationConfigModal } from "@/components/integration-config-modal"

// Add the import statements for Mem0 components at the top of the file
import { Mem0Memories } from "./mem0-memories"
import { Mem0Chat } from "./mem0-chat"
import { Mem0Categories } from "./mem0-categories"

interface DashboardProps {
  user: any
  userIntegrations: any[]
}

// List of integrations that use OAuth
const oauthIntegrations = ["github", "google", "slack"]

export function Dashboard({ user, userIntegrations }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("all")
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)

  // Extract unique categories from integrations
  const categories = [...new Set(userIntegrations.map((ui: any) => ui.integrations.category))]

  // Filter integrations based on active filter
  const filteredIntegrations = userIntegrations.filter((ui: any) => {
    if (activeFilter === "all") return true
    if (activeFilter === "active") return ui.is_active
    if (activeFilter === "inactive") return !ui.is_active
    return ui.integrations.category === activeFilter
  })

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      await disconnectIntegrationAction(integrationId)
      toast({
        title: "Integration disconnected",
        description: "The integration has been successfully disconnected.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while disconnecting the integration.",
        variant: "destructive",
      })
    }
  }

  // Update the handleConnect function to handle reactivation
  const handleConnect = async (integrationId: string) => {
    try {
      await connectIntegrationAction(integrationId)
      toast({
        title: "Integration connected",
        description: "The integration has been successfully connected.",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while connecting the integration.",
        variant: "destructive",
      })
    }
  }

  // Check if an integration uses OAuth
  const isOAuthIntegration = (integrationId: string) => {
    return oauthIntegrations.includes(integrationId)
  }

  const openConfigModal = (integration: any) => {
    setSelectedIntegration(integration)
    setConfigModalOpen(true)
  }

  const handleConfigUpdate = () => {
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-white">StreamLine</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary text-gray-300">
              Home
            </Link>
            <Link href="/integrations" className="text-sm font-medium hover:text-primary text-gray-300">
              Integrations
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
              className="text-gray-300 hover:text-white hover:bg-secondary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user.user_metadata?.full_name || user.email}</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/integrations">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Integration
                </Link>
              </Button>
            </div>

            <Tabs defaultValue="integrations" className="w-full">
              <TabsList className="bg-secondary">
                <TabsTrigger value="integrations" className="data-[state=active]:bg-primary">
                  <Grid className="h-4 w-4 mr-2" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="integrations" className="mt-6">
                <div className="grid gap-6">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-white">Your Connected Integrations</h2>
                    <p className="text-gray-400">Manage your connected integrations and services.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-gray-700 ${activeFilter === "all" ? "bg-primary text-white" : "text-gray-300"}`}
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-gray-700 ${activeFilter === "active" ? "bg-primary text-white" : "text-gray-300"}`}
                      onClick={() => setActiveFilter("active")}
                    >
                      Active
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-gray-700 ${activeFilter === "inactive" ? "bg-primary text-white" : "text-gray-300"}`}
                      onClick={() => setActiveFilter("inactive")}
                    >
                      Inactive
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        className={`border-gray-700 ${activeFilter === category ? "bg-primary text-white" : "text-gray-300"}`}
                        onClick={() => setActiveFilter(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {filteredIntegrations.length === 0 ? (
                    <Card className="bg-secondary border-gray-800">
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-300 mb-4">
                          {userIntegrations.length === 0
                            ? "You don't have any connected integrations yet."
                            : "No integrations match your current filter."}
                        </p>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                          <Link href="/integrations">Browse Integrations</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredIntegrations.map((ui: any) => (
                        <Card
                          key={ui.id}
                          className={`${ui.is_active ? "bg-background" : "bg-gray-900/50"} border-gray-800 transition-all`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={ui.integrations.logo_url || "/placeholder.svg?height=40&width=40"}
                                  alt={ui.integrations.name}
                                  width={40}
                                  height={40}
                                  className="rounded-md"
                                />
                                <div>
                                  <CardTitle className="text-white text-lg">{ui.integrations.name}</CardTitle>
                                  <CardDescription className="text-gray-400">
                                    {ui.integrations.category}
                                  </CardDescription>
                                </div>
                              </div>
                              {ui.is_active ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-white hover:bg-red-900/20"
                                  onClick={() => handleDisconnect(ui.integration_id)}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Disconnect</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-white hover:bg-green-900/20"
                                  onClick={() => handleConnect(ui.integration_id)}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  <span className="sr-only">Reconnect</span>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm">{ui.integrations.description}</p>
                            {!ui.is_active && (
                              <div className="mt-2 text-xs text-gray-400">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                                  Inactive
                                </span>
                              </div>
                            )}
                            {ui.config && Object.keys(ui.config).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-800">
                                <p className="text-xs font-medium text-gray-400 mb-2">Configuration</p>
                                <div className="space-y-1">
                                  {Object.entries(ui.config)
                                    .filter(
                                      ([key]) =>
                                        !["access_token", "refresh_token", "expires_at", "provider_user_data"].includes(
                                          key,
                                        ),
                                    )
                                    .slice(0, 3) // Show only first 3 config items
                                    .map(([key, value]: [string, any]) => (
                                      <div key={key} className="flex justify-between text-xs">
                                        <span className="text-gray-400 capitalize">{key.replace(/_/g, " ")}:</span>
                                        <span className="text-gray-300">
                                          {Array.isArray(value)
                                            ? value.slice(0, 2).join(", ") + (value.length > 2 ? "..." : "")
                                            : typeof value === "object"
                                              ? "Object"
                                              : String(value).length > 20
                                                ? String(value).substring(0, 20) + "..."
                                                : String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  {Object.keys(ui.config).filter(
                                    (key) =>
                                      !["access_token", "refresh_token", "expires_at", "provider_user_data"].includes(
                                        key,
                                      ),
                                  ).length > 3 && (
                                    <div
                                      className="text-xs text-primary cursor-pointer hover:underline"
                                      onClick={() => openConfigModal(ui)}
                                    >
                                      Show more...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Display OAuth details for OAuth integrations */}
                            {ui.is_active && isOAuthIntegration(ui.integration_id) && ui.config?.access_token && (
                              <OAuthConnectionDetails integration={ui} />
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-gray-700 text-white hover:bg-secondary"
                              onClick={() => openConfigModal(ui)}
                              disabled={!ui.is_active}
                            >
                              <Cog className="mr-2 h-4 w-4" />
                              Configure
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                  {userIntegrations.some((ui: any) => ui.integration_id === "mem0" && ui.is_active) && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-white mb-4">Mem0 AI Memory</h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        <Mem0Memories
                          integration={userIntegrations.find((ui: any) => ui.integration_id === "mem0" && ui.is_active)}
                        />
                        <Mem0Chat
                          integration={userIntegrations.find((ui: any) => ui.integration_id === "mem0" && ui.is_active)}
                        />
                      </div>
                      <div className="mt-6">
                        <Mem0Categories
                          integration={userIntegrations.find((ui: any) => ui.integration_id === "mem0" && ui.is_active)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card className="bg-background border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">Update your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        defaultValue={user.user_metadata?.full_name || ""}
                        className="bg-secondary border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        defaultValue={user.email}
                        disabled
                        className="bg-secondary border-gray-700 text-white opacity-70"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="bg-background border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Account Settings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-gray-400 text-sm">Receive email notifications about account activity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-primary hover:bg-primary/90">Save Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-white">StreamLine</span>
          </div>
          <p className="text-center text-sm text-gray-400 md:text-left">
            &copy; {new Date().getFullYear()} StreamLine, Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <IntegrationConfigModal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          integration={selectedIntegration}
          onConfigUpdate={handleConfigUpdate}
        />
      )}
    </div>
  )
}
