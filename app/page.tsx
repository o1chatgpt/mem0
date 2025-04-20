import { FileManager } from "@/components/file-manager/file-manager"
import { Mem0Provider } from "@/components/mem0/mem0-provider"

export default function HomePage() {
  return (
    <Mem0Provider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">AI Family Toolkit</h1>
          <FileManager />
        </div>
      </div>
    </Mem0Provider>
  )
}
