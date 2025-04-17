"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2, X, AlertCircle } from "lucide-react"
import { initiateOAuthFlow } from "@/app/actions/oauth"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OAuthConnectButtonProps {
  provider: string
  integrationId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function OAuthConnectButton({ provider, integrationId, isConnected, onDisconnect }: OAuthConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [configError, setConfigError] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Call the server action to get the OAuth URL
      const result = await initiateOAuthFlow(provider, integrationId)

      if (result.error) {
        if (result.code === "oauth_not_configured") {
          setConfigError(true)
          toast({
            title: "OAuth Not Configured",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Connection failed",
            description: result.error,
            variant: "destructive",
          })
        }
        throw new Error(result.error)
      }

      if (result.url) {
        // Redirect to the OAuth provider on the client side
        window.location.href = result.url
      } else {
        throw new Error("No authorization URL returned")
      }
    } catch (error) {
      console.error("OAuth connection error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await onDisconnect()
    } catch (error) {
      console.error("OAuth disconnection error:", error)
      toast({
        title: "Disconnection failed",
        description: "There was an error disconnecting the service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleDisconnect} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
        Disconnect
      </Button>
    )
  }

  if (configError) {
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
    <Button
      className="w-full bg-secondary hover:bg-secondary/80 text-white"
      onClick={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
      Connect with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  )
}
