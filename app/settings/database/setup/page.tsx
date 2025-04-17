import { DatabaseSetup } from "@/components/database-setup"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Initialize Database</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Use this tool to create all the necessary tables in your PostgreSQL database. This is required for the
            application to function properly.
          </p>
          <DatabaseSetup />
        </div>
      </div>
    </div>
  )
}
