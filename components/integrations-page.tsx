"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ArrowLeft, X, AlertCircle } from "lucide-react"
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react"
import { useTransition, useEffect, useState } from "react"
import { disconnectIntegrationAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { OAuthConnectButton } from "@/components/oauth-connect-button"
import { useSearchParams } from "next/navigation"
import type { Integration } from "@/lib/db"
import { connectIntegrationAction } from "@/app/actions"
import { isOAuthConfigured } from "@/lib/oauth-config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IntegrationsPageProps {
  integrations: Integration[]
  connectedIntegrations: Record<string, any>
  isLoggedIn: boolean
}

// List of integrations that use OAuth
const oauthIntegrations = ["github", "google", "slack"]

export default function IntegrationsPage({ integrations, connectedIntegrations, isLoggedIn }: IntegrationsPageProps) {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const [oauthStatus, setOauthStatus] = useState<Record<string, boolean>>({})

  // Check OAuth configuration status for each provider
  useEffect(() => {
    const status: Record<string, boolean> = {}
    oauthIntegrations.forEach((provider) => {
      status[provider] = isOAuthConfigured(provider as keyof typeof import("@/lib/oauth-config").oauthProviders)
    })
    setOauthStatus(status)
  }, [])

  // Check for success or error messages in the URL
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const provider = searchParams.get("provider")

    if (success === "connected" && provider) {
      toast({
        title: "Integration connected",
        description: `Your ${provider} account has been successfully connected.`,
      })
    } else if (error) {
      let errorMessage = "There was an error connecting the integration."

      switch (error) {
        case "auth_required":
          errorMessage = "You must be logged in to connect an integration."
          break
        case "state_expired":
          errorMessage = "The authentication session expired. Please try again."
          break
        case "token_exchange_failed":
          errorMessage = "Failed to authenticate with the provider. Please try again."
          break
        case "oauth_not_configured":
          errorMessage = "This OAuth integration is not properly configured. Please contact the administrator."
          break
      }

      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [searchParams])

  // Group integrations by category
  const categories = [...new Set(integrations.map((integration) => integration.category))]

  const handleDisconnect = (integrationId: string) => {
    startTransition(async () => {
      try {
        await disconnectIntegrationAction(integrationId)
        toast({
          title: "Integration disconnected",
          description: "The integration has been successfully disconnected from your account.",
        })
      } catch (error) {
        toast({
          title: "Disconnection failed",
          description: "There was an error disconnecting the integration. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const isConnected = (integrationId: string) => {
    return !!connectedIntegrations[integrationId]
  }

  const renderConnectButton = (integration: Integration) => {
    if (!isLoggedIn) {
      return (
        <Button
          className="w-full bg-secondary hover:bg-secondary/80 text-white"
          onClick={() => {
            toast({
              title: "Authentication required",
              description: "Please log in to connect integrations",
              variant: "destructive",
            })
          }}
        >
          Connect
        </Button>
      )
    }

    // Use OAuth flow for supported providers
    if (oauthIntegrations.includes(integration.id)) {
      // Check if OAuth is configured for this provider
      if (!oauthStatus[integration.id]) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white cursor-not-allowed" disabled={true}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Not Configured
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This integration is not properly configured. Please contact the administrator.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return (
        <OAuthConnectButton
          provider={integration.id}
          integrationId={integration.id}
          isConnected={isConnected(integration.id)}
          onDisconnect={() => handleDisconnect(integration.id)}
        />
      )
    }

    // Use regular connect/disconnect for other integrations
    if (isConnected(integration.id)) {
      return (
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          onClick={() => handleDisconnect(integration.id)}
          disabled={isPending}
        >
          <X className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      )
    }

    return (
      <Button
        className="w-full bg-secondary hover:bg-secondary/80 text-white"
        onClick={() => {
          startTransition(async () => {
            try {
              await connectIntegrationAction(integration.id)
              toast({
                title: "Integration connected",
                description: "The integration has been successfully connected to your account.",
              })
            } catch (error) {
              toast({
                title: "Connection failed",
                description: "There was an error connecting the integration. Please try again.",
                variant: "destructive",
              })
            }
          })
        }}
        disabled={isPending}
      >
        {isPending ? "Connecting..." : "Connect"}
      </Button>
    )
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
            <Link href="/#features" className="text-sm font-medium hover:text-primary text-gray-300">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-medium hover:text-primary text-gray-300">
              Pricing
            </Link>
            <Link href="/integrations" className="text-sm font-medium text-primary">
              Integrations
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-primary text-gray-300">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary hidden sm:block text-gray-300">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:text-primary hidden sm:block text-gray-300">
                Log in
              </Link>
            )}
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              {isLoggedIn ? <Link href="/dashboard">Dashboard</Link> : <Link href="/signup">Get Started</Link>}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Integrations Hero */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Link href="/" className="flex items-center text-primary mb-4 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">Powerful Integrations</h1>
                <p className="max-w-[700px] text-gray-300 md:text-xl/relaxed">
                  Connect StreamLine with your favorite tools and services to create a seamless workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Integrations */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl/tight text-white">Popular Integrations</h2>
              <p className="text-gray-300">Our most used integrations that help teams be more productive.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {integrations
                .filter((integration) => integration.is_popular)
                .map((integration) => (
                  <Card key={integration.id} className="bg-background border-gray-800 integration-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-center mb-4">
                        <Image
                          src={integration.logo_url || "/placeholder.svg?height=80&width=80"}
                          alt={integration.name}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                      </div>
                      <CardTitle className="text-white">{integration.name}</CardTitle>
                      <CardDescription className="text-gray-400">{integration.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">{integration.description}</p>
                    </CardContent>
                    <CardFooter>{renderConnectButton(integration)}</CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* All Integrations by Category */}
        <section className="w-full py-12 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start space-y-4 mb-8">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl/tight text-white">All Integrations</h2>
              <p className="text-gray-300">Browse all available integrations by category.</p>
            </div>

            {categories.map((category) => (
              <div key={category} className="mb-12">
                <h3 className="text-xl font-bold mb-6 text-white">{category}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {integrations
                    .filter((integration) => integration.category === category)
                    .map((integration) => (
                      <Card key={integration.id} className="bg-background border-gray-800 integration-card">
                        <CardHeader className="pb-2">
                          <div className="flex justify-center mb-4">
                            <Image
                              src={integration.logo_url || "/placeholder.svg?height=80&width=80"}
                              alt={integration.name}
                              width={80}
                              height={80}
                              className="rounded-lg"
                            />
                          </div>
                          <CardTitle className="text-white">{integration.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 text-sm">{integration.description}</p>
                        </CardContent>
                        <CardFooter>{renderConnectButton(integration)}</CardFooter>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Request */}
        <section className="w-full py-12 md:py-24 lg:py-32 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  Don't see what you need?
                </h2>
                <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed">
                  We're constantly adding new integrations. Let us know what you'd like to see next.
                </p>
              </div>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link href="/request-integration">Request an Integration</Link>
              </Button>
            </div>
          </div>
        </section>
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
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
