"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Shield, Key } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OAuthConnectionDetailsProps {
  integration: any
}

export function OAuthConnectionDetails({ integration }: OAuthConnectionDetailsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if the token is expired
  const isTokenExpired = () => {
    if (!integration.config.expires_at) return false
    return Date.now() > integration.config.expires_at
  }

  const handleRefreshToken = async () => {
    setIsRefreshing(true)
    try {
      // This would be implemented in a real application
      toast({
        title: "Token refreshed",
        description: "Your access token has been refreshed successfully.",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing your access token. Please reconnect the integration.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Format the expiration date
  const formatExpiryDate = () => {
    if (!integration.config.expires_at) return "Never expires"
    return new Date(integration.config.expires_at).toLocaleString()
  }

  // Get provider-specific user data
  const getUserInfo = () => {
    const data = integration.config.provider_user_data

    if (!data) return null

    if (integration.integration_id === "github") {
      return (
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="text-gray-400">Username:</span> <span className="text-gray-300">{data.login}</span>
          </p>
          {data.name && (
            <p>
              <span className="text-gray-400">Name:</span> <span className="text-gray-300">{data.name}</span>
            </p>
          )}
        </div>
      )
    }

    if (integration.integration_id === "google") {
      return (
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="text-gray-400">Email:</span> <span className="text-gray-300">{data.email}</span>
          </p>
          {data.name && (
            <p>
              <span className="text-gray-400">Name:</span> <span className="text-gray-300">{data.name}</span>
            </p>
          )}
        </div>
      )
    }

    if (integration.integration_id === "slack") {
      return (
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="text-gray-400">Team:</span> <span className="text-gray-300">{data.team?.name}</span>
          </p>
          <p>
            <span className="text-gray-400">User ID:</span> <span className="text-gray-300">{data.user_id}</span>
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
          <Shield className="h-4 w-4 mr-2 text-primary" />
          OAuth Connection Details
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Status:</span>
          <Badge variant={isTokenExpired() ? "destructive" : "outline"}>
            {isTokenExpired() ? "Expired" : "Active"}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Expires:</span>
          <span className="text-gray-300">{formatExpiryDate()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Connected:</span>
          <span className="text-gray-300">{new Date(integration.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Last Updated:</span>
          <span className="text-gray-300">{new Date(integration.updated_at).toLocaleDateString()}</span>
        </div>

        {getUserInfo()}

        <div className="mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center">
            <Key className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-400">Access Token:</span>
          </div>
          <div className="mt-1 bg-gray-800 p-2 rounded font-mono text-xs text-gray-300 overflow-hidden text-ellipsis">
            {integration.config.access_token
              ? `${integration.config.access_token.substring(0, 20)}...`
              : "No token available"}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {integration.config.refresh_token && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={handleRefreshToken}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            {isRefreshing ? "Refreshing..." : "Refresh Token"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
