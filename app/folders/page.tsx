import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FolderIcon, FolderPlusIcon } from "lucide-react"
import Link from "next/link"

// Sample data
const folders = [
  { id: "1", name: "Documents", files: 15, created: "2023-05-10" },
  { id: "2", name: "Images", files: 42, created: "2023-05-12" },
  { id: "3", name: "Projects", files: 7, created: "2023-05-15" },
  { id: "4", name: "Backups", files: 3, created: "2023-05-20" },
  { id: "5", name: "Shared", files: 28, created: "2023-05-25" },
]

export default function FoldersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Folders</h1>
        </div>
        <Button>
          <FolderPlusIcon className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Files</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {folders.map((folder) => (
                  <tr key={folder.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FolderIcon className="mr-2 h-5 w-5 text-yellow-500" />
                        {folder.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{folder.files} files</td>
                    <td className="py-3 px-4">{folder.created}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                      <Button variant="ghost" size="sm">
                        Rename
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
