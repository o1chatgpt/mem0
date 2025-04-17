import { DatabaseConnectionTester } from "@/components/database-connection-tester"
import { DatabaseConnectionSettings } from "@/components/database-connection-settings"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DatabaseSettingsPage() {
  const handleSaveSettings = (settings: { [key: string]: string }) => {
    // In a real app, you would save these settings to environment variables or a database
    console.log("Saving settings:", settings)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Settings</h1>

      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <DatabaseConnectionTester />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
          <DatabaseConnectionSettings onSave={handleSaveSettings} />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Note: For security reasons, the password is not displayed.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Create all required tables in your PostgreSQL database.
          </p>
          <Link href="/settings/database/setup">
            <Button>Setup Database</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
