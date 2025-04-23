import { ApiKeyManager } from "@/components/api-key-manager"

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>
      <ApiKeyManager />
    </div>
  )
}
