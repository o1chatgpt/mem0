"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateIntegrationConfig } from "@/app/actions/integration"
import { GoogleDriveConfig } from "@/components/integration-configs/google-drive-config"
import { SlackConfig } from "@/components/integration-configs/slack-config"
import { GithubConfig } from "@/components/integration-configs/github-config"
import { Mem0Config } from "@/components/integration-configs/mem0-config"
import { GenericConfig } from "@/components/integration-configs/generic-config"

interface IntegrationConfigModalProps {
  isOpen: boolean
  onClose: () => void
  integration: any
  onConfigUpdate: () => void
}

export function IntegrationConfigModal({ isOpen, onClose, integration, onConfigUpdate }: IntegrationConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState(integration.config || {})

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateIntegrationConfig(integration.integration_id, config)
      toast({
        title: "Configuration updated",
        description: "Your integration settings have been saved successfully.",
      })
      onConfigUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast({
        title: "Update failed",
        description: "There was an error saving your configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render the appropriate configuration component based on the integration type
  const renderConfigComponent = () => {
    switch (integration.integration_id) {
      case "google-drive":
        return <GoogleDriveConfig config={config} setConfig={setConfig} />
      case "slack":
        return <SlackConfig config={config} setConfig={setConfig} />
      case "github":
        return <GithubConfig config={config} setConfig={setConfig} />
      case "mem0":
        return <Mem0Config config={config} setConfig={setConfig} />
      default:
        return <GenericConfig config={config} setConfig={setConfig} integration={integration} />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-gray-800 text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configure {integration.integrations?.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your integration settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderConfigComponent()}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
