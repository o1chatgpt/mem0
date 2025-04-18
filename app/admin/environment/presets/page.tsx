import { EnvPresetManager } from "@/components/admin/env-preset-manager"

export default function EnvironmentPresetsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Environment Presets</h1>
      <p className="text-muted-foreground mb-8">
        Manage predefined sets of environment variables for different deployment scenarios. Select presets, combine
        them, and generate .env files for your specific needs.
      </p>

      <EnvPresetManager />
    </div>
  )
}
