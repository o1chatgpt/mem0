"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  apiKey?: string
  icon: React.ReactNode
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "openai",
      name: "OpenAI",
      description: "Connect to OpenAI for AI-powered features.",
      connected: true,
      apiKey: "sk-...aBcD",
      icon: <OpenAIIcon className="h-8 w-8" />,
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Database and authentication integration.",
      connected: true,
      apiKey: "eyJh...XYZ",
      icon: <SupabaseIcon className="h-8 w-8" />,
    },
    {
      id: "mem0",
      name: "Mem0",
      description: "Memory system integration for AI features.",
      connected: true,
      apiKey: "mem0_...1234",
      icon: <Mem0Icon className="h-8 w-8" />,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Connect to your GitHub repositories.",
      connected: false,
      icon: <GitHubIcon className="h-8 w-8" />,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Receive notifications in your Slack workspace.",
      connected: false,
      icon: <SlackIcon className="h-8 w-8" />,
    },
  ])

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  function toggleIntegration(id: string) {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration,
      ),
    )

    const integration = integrations.find((i) => i.id === id)
    if (integration) {
      toast({
        title: integration.connected ? `Disconnected from ${integration.name}` : `Connected to ${integration.name}`,
        description: integration.connected
          ? `Successfully disconnected from ${integration.name}.`
          : `Successfully connected to ${integration.name}.`,
      })
    }
  }

  function updateApiKey(id: string, apiKey: string) {
    setIntegrations(
      integrations.map((integration) => (integration.id === id ? { ...integration, apiKey } : integration)),
    )
  }

  function handleDisconnect(id: string) {
    toggleIntegration(id)
    setSelectedIntegration(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                {integration.icon}
                <Badge variant={integration.connected ? "default" : "outline"}>
                  {integration.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <CardTitle className="mt-2">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {integration.connected && integration.apiKey && (
                <div className="mb-4">
                  <Label htmlFor={`${integration.id}-api-key`}>API Key</Label>
                  <div className="flex mt-1">
                    <Input
                      id={`${integration.id}-api-key`}
                      type="password"
                      value={integration.apiKey}
                      onChange={(e) => updateApiKey(integration.id, e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none"
                      onClick={() => {
                        navigator.clipboard.writeText(integration.apiKey || "")
                        toast({
                          title: "API Key Copied",
                          description: "The API key has been copied to your clipboard.",
                        })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              {integration.connected ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Manage</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Manage {integration.name} Integration</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are currently connected to {integration.name}. You can disconnect or update your settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="manage-api-key">API Key</Label>
                      <div className="flex mt-1">
                        <Input
                          id="manage-api-key"
                          type="password"
                          value={integration.apiKey || ""}
                          onChange={(e) => updateApiKey(integration.id, e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button
                          variant="outline"
                          className="rounded-l-none"
                          onClick={() => {
                            navigator.clipboard.writeText(integration.apiKey || "")
                            toast({
                              title: "API Key Copied",
                              description: "The API key has been copied to your clipboard.",
                            })
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button onClick={() => toggleIntegration(integration.id)}>Connect</Button>
              )}
              <div className="flex items-center space-x-2">
                <Label htmlFor={`${integration.id}-toggle`} className="text-sm">
                  {integration.connected ? "Enabled" : "Disabled"}
                </Label>
                <Switch
                  id={`${integration.id}-toggle`}
                  checked={integration.connected}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Integration</CardTitle>
          <CardDescription>Connect to additional services to enhance your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2">
              <GoogleIcon className="h-8 w-8" />
              <span>Google Drive</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2">
              <DropboxIcon className="h-8 w-8" />
              <span>Dropbox</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2">
              <OneDriveIcon className="h-8 w-8" />
              <span>OneDrive</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Icon components
function OpenAIIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.051 6.051 0 0 0 8.7569-2.9001 5.9894 5.9894 0 0 0 3.9977-2.9 6.0557 6.0557 0 0 0-.7328-7.0966 5.9894 5.9894 0 0 0 0-1.3812zM13.2599 22.4304a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9415a4.4992 4.4992 0 0 1-6.1408-1.6365zm-1.6366-10.208a4.4992 4.4992 0 0 1 2.3506-1.8608l-.142.0805L1.69 9.0441a.7759.7759 0 0 0-.3879.6813v6.7369l-2.0201-1.1685a.0757.0757 0 0 1-.038-.0567V9.7394a4.504 4.504 0 0 1 2.4728-3.642zm16.5963 3.8558L13.7177 8.54 16.4499 6.9l5.8144 3.354a.0757.0757 0 0 1 .0332.0567l-.038 5.5826a4.4944 4.4944 0 0 1-6.8259 3.0137l-.1419-.0805 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813zm1.6699-2.8075a.0615.0615 0 0 1-.0426.0567l-5.8144 3.354-2.0201-1.1685v-2.3324a.0662.0662 0 0 1 .0284-.0615l4.8372-2.7867a4.4992 4.4992 0 0 1 6.6369 1.6365 4.4944 4.4944 0 0 1-.6254 3.0137zM7.9287 10.8702l-2.02-1.1638a.0662.0662 0 0 1-.0284-.0615V4.0877a4.4992 4.4992 0 0 1 7.3605-3.4545l.142.0805-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813zm10.0883 1.2255L15.0528 10.34V5.9252a.0804.0804 0 0 1 .0332-.0615l4.8421-2.7867a4.4992 4.4992 0 0 1 4.2283 7.6744l-.142-.0805-4.7783-2.7582a.7759.7759 0 0 0-.7854 0zm-3.4687 2.0024l2.02-1.1638a.071.071 0 0 1 .0664 0l4.8421 2.7867a4.4992 4.4992 0 0 1-4.2283 7.6744l-.142-.0805 4.7783-2.7582a.7759.7759 0 0 0 .3927-.6813zm-4.1063-7.6744l-2.02 1.1685a.0757.0757 0 0 1-.0664 0L3.6655 4.8689a4.4992 4.4992 0 0 1 4.2283-7.6744l.142.0805L3.258 0.0612a.7759.7759 0 0 0-.3927.6813zm-.0993 1.4455v2.3324a.0804.0804 0 0 1-.0332.0615L5.4282 12.566a4.4992 4.4992 0 0 1-4.2283-7.6744l.142.0805 4.7783 2.7582a.7948.7948 0 0 0 .7854 0z"
        fill="currentColor"
      />
    </svg>
  )
}

function SupabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.5821 5.05866C21.2598 4.65092 20.7057 4.56476 20.2879 4.86436L12.3463 10.4523C12.1226 10.6152 11.8774 10.6152 11.6537 10.4523L3.71205 4.86436C3.29426 4.56476 2.74022 4.65092 2.4179 5.05866C2.09559 5.4664 2.18647 6.04889 2.60426 6.34849L10.5459 11.9364C11.4407 12.5881 12.5593 12.5881 13.4541 11.9364L21.3957 6.34849C21.8135 6.04889 21.9044 5.4664 21.5821 5.05866Z"
        fill="currentColor"
      />
      <path
        d="M11.6537 13.5477C11.8774 13.3848 12.1226 13.3848 12.3463 13.5477L20.2879 19.1356C20.7057 19.4352 21.2598 19.3491 21.5821 18.9413C21.9044 18.5336 21.8135 17.9511 21.3957 17.6515L13.4541 12.0636C12.5593 11.4119 11.4407 11.4119 10.5459 12.0636L2.60426 17.6515C2.18647 17.9511 2.09559 18.5336 2.4179 18.9413C2.74022 19.3491 3.29426 19.4352 3.71205 19.1356L11.6537 13.5477Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Mem0Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
        fill="currentColor"
      />
      <path
        d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
        fill="currentColor"
      />
      <path d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z" fill="currentColor" />
    </svg>
  )
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.521 21.278 9.521 21.017C9.521 20.783 9.512 20.067 9.508 19.192C6.726 19.826 6.139 17.949 6.139 17.949C5.685 16.836 5.029 16.533 5.029 16.533C4.121 15.924 5.098 15.937 5.098 15.937C6.101 16.01 6.629 16.95 6.629 16.95C7.521 18.48 8.97 18.001 9.54 17.748C9.631 17.088 9.889 16.61 10.175 16.349C7.955 16.089 5.62 15.276 5.62 11.454C5.62 10.301 6.01 9.362 6.649 8.631C6.546 8.381 6.203 7.431 6.747 6.076C6.747 6.076 7.587 5.812 9.497 7.083C10.295 6.865 11.15 6.756 12 6.753C12.85 6.756 13.705 6.865 14.503 7.083C16.413 5.812 17.253 6.076 17.253 6.076C17.797 7.431 17.454 8.381 17.351 8.631C17.99 9.362 18.38 10.301 18.38 11.454C18.38 15.286 16.045 16.089 13.825 16.349C14.171 16.662 14.497 17.276 14.497 18.221C14.497 19.555 14.487 20.692 14.487 21.017C14.487 21.278 14.669 21.581 15.169 21.489C19.143 20.166 22.008 16.418 22.008 12C22.008 6.477 17.531 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SlackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.5 10C13.67 10 13 9.33 13 8.5V3.5C13 2.67 13.67 2 14.5 2C15.33 2 16 2.67 16 3.5V8.5C16 9.33 15.33 10 14.5 10Z"
        fill="currentColor"
      />
      <path
        d="M20.5 10H19V8.5C19 7.67 19.67 7 20.5 7C21.33 7 22 7.67 22 8.5C22 9.33 21.33 10 20.5 10Z"
        fill="currentColor"
      />
      <path
        d="M9.5 14C10.33 14 11 14.67 11 15.5V20.5C11 21.33 10.33 22 9.5 22C8.67 22 8 21.33 8 20.5V15.5C8 14.67 8.67 14 9.5 14Z"
        fill="currentColor"
      />
      <path
        d="M3.5 14H5V15.5C5 16.33 4.33 17 3.5 17C2.67 17 2 16.33 2 15.5C2 14.67 2.67 14 3.5 14Z"
        fill="currentColor"
      />
      <path
        d="M14 9.5C14 10.33 13.33 11 12.5 11H7.5C6.67 11 6 10.33 6 9.5C6 8.67 6.67 8 7.5 8H12.5C13.33 8 14 8.67 14 9.5Z"
        fill="currentColor"
      />
      <path d="M7.5 5H9V3.5C9 2.67 8.33 2 7.5 2C6.67 2 6 2.67 6 3.5C6 4.33 6.67 5 7.5 5Z" fill="currentColor" />
      <path
        d="M10 14.5C10 13.67 10.67 13 11.5 13H16.5C17.33 13 18 13.67 18 14.5C18 15.33 17.33 16 16.5 16H11.5C10.67 16 10 15.33 10 14.5Z"
        fill="currentColor"
      />
      <path
        d="M16.5 19H15V20.5C15 21.33 15.67 22 16.5 22C17.33 22 18 21.33 18 20.5C18 19.67 17.33 19 16.5 19Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.0001 4.37669C13.4273 4.37669 14.6665 4.93198 15.6147 5.80698L18.641 2.78062C16.9156 1.16907 14.6147 0.121582 12.0001 0.121582C8.0547 0.121582 4.64379 2.41089 2.90198 5.73335L6.34379 8.37335C7.19379 6.07335 9.39379 4.37669 12.0001 4.37669Z"
        fill="currentColor"
      />
      <path
        d="M4.3776 12.0004C4.3776 11.1686 4.5594 10.3731 4.8776 9.64941L1.4358 7.00941C0.5358 8.50941 0.0358 10.1913 0.0358 12.0004C0.0358 13.8095 0.5358 15.4913 1.4358 16.9913L4.8776 14.3513C4.5594 13.6277 4.3776 12.8322 4.3776 12.0004Z"
        fill="currentColor"
      />
      <path
        d="M12.0001 19.6241C9.39379 19.6241 7.19379 17.9274 6.34379 15.6274L2.90198 18.2674C4.64379 21.5898 8.0547 23.8792 12.0001 23.8792C14.5092 23.8792 16.7819 22.9065 18.5092 21.3792L15.2365 18.8428C14.3456 19.3428 13.2365 19.6241 12.0001 19.6241Z"
        fill="currentColor"
      />
      <path
        d="M23.8949 12.0004C23.8949 11.2959 23.804 10.6277 23.6586 9.99588H12.0004V14.2504H18.604C18.304 15.5959 17.5222 16.6868 16.4313 17.4322L19.704 19.9686C21.904 17.9504 23.8949 15.2322 23.8949 12.0004Z"
        fill="currentColor"
      />
    </svg>
  )
}

function DropboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14.5L6 10.5L12 6.5L18 10.5L12 14.5Z" fill="currentColor" />
      <path d="M6 3.5L12 7.5L18 3.5L12 -0.5L6 3.5Z" fill="currentColor" />
      <path d="M12 14.5L6 18.5L12 22.5L18 18.5L12 14.5Z" fill="currentColor" />
    </svg>
  )
}

function OneDriveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.0833 10.9999C19.8611 10.9999 19.6389 11.0277 19.4167 11.0833C18.9722 9.30553 17.3333 7.99992 15.4167 7.99992C14.5833 7.99992 13.8056 8.24992 13.1389 8.69436C12.3056 7.08325 10.6667 5.99992 8.75 5.99992C6.06944 5.99992 3.88889 8.16658 3.88889 10.8333C3.88889 10.9721 3.88889 11.1388 3.91667 11.2777C2.19444 11.8055 1 13.4166 1 15.2777C1 17.5833 2.86111 19.4721 5.16667 19.4721H20.0833C21.6944 19.4721 23 18.1666 23 16.5555C23 14.9444 21.6944 10.9999 20.0833 10.9999Z"
        fill="currentColor"
      />
    </svg>
  )
}
