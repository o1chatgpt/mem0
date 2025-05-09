import { FileExplorer } from "@/components/file-explorer"

export default function FilesPage() {
  // In a real app, this would come from authentication
  const userId = 1 // Using the admin user we created in the database

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground">Manage your files and documents</p>
        </div>
        <FileExplorer userId={userId} />
      </div>
    </div>
  )
}
