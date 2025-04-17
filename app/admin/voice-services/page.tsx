"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Check, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type VoiceService = {
  id: number
  service_type: string
  is_default: boolean
  api_key?: string
  is_active: boolean
}

export default function VoiceServicesPage() {
  const [services, setServices] = useState<VoiceService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch voice services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/admin/voice-services")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch voice services")
        }

        setServices(data.services || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const updateService = async (id: number, updates: Partial<VoiceService>) => {
    try {
      const response = await fetch(`/api/admin/voice-services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update voice service")
      }

      // Update local state
      setServices(services.map((service) => (service.id === id ? { ...service, ...updates } : service)))

      toast({
        title: "Service Updated",
        description: `${updates.service_type?.toUpperCase() || "Voice service"} has been updated successfully.`,
      })
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const setDefaultService = async (id: number) => {
    try {
      // First update all services to not be default
      const updatedServices = services.map((service) => ({
        ...service,
        is_default: service.id === id,
      }))

      setServices(updatedServices)

      // Then update the database
      await updateService(id, { is_default: true })

      toast({
        title: "Default Service Updated",
        description: `Default voice service has been updated.`,
      })
    } catch (err) {
      // Revert local state on error
      setServices(services)

      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const saveApiKey = async (id: number, apiKey: string) => {
    await updateService(id, { api_key: apiKey })
  }

  const toggleServiceActive = async (id: number, isActive: boolean) => {
    await updateService(id, { is_active: isActive })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            <p className="mt-2">Loading voice services...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Voice Services</h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Configure the voice services used by your AI family members. Set a default service and provide API keys for
            each.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="openai" className="space-y-4">
          <TabsList>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
            <TabsTrigger value="hume">HUME</TabsTrigger>
          </TabsList>

          {["openai", "elevenlabs", "hume"].map((serviceType) => {
            const service = services.find((s) => s.service_type === serviceType)

            if (!service) return null

            return (
              <TabsContent key={serviceType} value={serviceType} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{serviceType.toUpperCase()} Voice Service</CardTitle>
                    <CardDescription>
                      Configure {serviceType.toUpperCase()} voice synthesis for your AI family members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Service Status</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable this voice service</p>
                      </div>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={(checked) => toggleServiceActive(service.id, checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Default Service</Label>
                        <p className="text-sm text-muted-foreground">Make this the default voice service</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.is_default ? (
                          <span className="text-green-600 text-sm flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Default
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultService(service.id)}
                            disabled={!service.is_active}
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${serviceType}-api-key`}>API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`${serviceType}-api-key`}
                          type="password"
                          value={service.api_key || ""}
                          onChange={(e) => {
                            setServices(
                              services.map((s) => (s.id === service.id ? { ...s, api_key: e.target.value } : s)),
                            )
                          }}
                          placeholder={`Enter your ${serviceType.toUpperCase()} API key`}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => saveApiKey(service.id, service.api_key || "")}
                          disabled={!service.api_key}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      {serviceType === "openai" && "OpenAI's TTS provides high-quality voices with natural intonation."}
                      {serviceType === "elevenlabs" &&
                        "ElevenLabs offers the most realistic voices with excellent emotional range."}
                      {serviceType === "hume" && "HUME AI specializes in emotional expression in voice synthesis."}
                    </p>
                  </CardFooter>
                </Card>

                {serviceType === "openai" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>OpenAI Voice Mapping</CardTitle>
                      <CardDescription>How AI Family members map to OpenAI voices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Stan</p>
                            <p className="text-sm text-muted-foreground">Voice: Onyx</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Lyra</p>
                            <p className="text-sm text-muted-foreground">Voice: Shimmer</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Sophia</p>
                            <p className="text-sm text-muted-foreground">Voice: Nova</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Max</p>
                            <p className="text-sm text-muted-foreground">Voice: Echo</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {serviceType === "elevenlabs" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ElevenLabs Voice Mapping</CardTitle>
                      <CardDescription>How AI Family members map to ElevenLabs voices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Stan</p>
                            <p className="text-sm text-muted-foreground">Voice: Brian</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Lyra</p>
                            <p className="text-sm text-muted-foreground">Voice: Freya</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Sophia</p>
                            <p className="text-sm text-muted-foreground">Voice: Aria</p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">Max</p>
                            <p className="text-sm text-muted-foreground">Voice: Daniel</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </AdminLayout>
  )
}
