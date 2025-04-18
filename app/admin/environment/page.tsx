import { EnvStatusChecker } from "@/components/admin/env-status-checker"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default function EnvironmentPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Environment Configuration</h1>
        <Button asChild>
          <Link href="/admin/environment/presets">
            <Settings className="h-4 w-4 mr-2" />
            Manage Presets
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground mb-8">
        This page allows you to check the status of your environment variables and ensure your application is properly
        configured.
      </p>

      <div className="grid gap-6">
        <EnvStatusChecker />
      </div>
    </div>
  )
}
