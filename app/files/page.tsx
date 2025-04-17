import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileIcon, FileTextIcon, ImageIcon, UploadIcon } from "lucide-react"
import Link from "next/link"

// Sample data
const files = [
  { id: "1", name: "Project Proposal.docx", type: "document", size: "245 KB", modified: "2023-06-15" },
  { id: "2", name: "Budget.xlsx", type: "spreadsheet", size: "128 KB", modified: "2023-06-14" },
  { id: "3", name: "Presentation.pptx", type: "presentation", size: "3.2 MB", modified: "2023-06-10" },
  { id: "4", name: "Logo.png", type: "image", size: "1.8 MB", modified: "2023-06-05" },
  { id: "5", name: "Meeting Notes.pdf", type: "pdf", size: "567 KB", modified: "2023-06-01" },
]

export default function FilesPage() {
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
          <h1 className="text-3xl font-bold">Files</h1>
        </div>
        <Button>
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-left py-3 px-4">Modified</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {file.type === "image" ? (
                          <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
                        ) : file.type === "pdf" ? (
                          <FileTextIcon className="mr-2 h-5 w-5 text-red-500" />
                        ) : (
                          <FileIcon className="mr-2 h-5 w-5 text-gray-500" />
                        )}
                        {file.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{file.size}</td>
                    <td className="py-3 px-4">{file.modified}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Download
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
