import { FileList } from "@/components/file-list"
import { FileUpload } from "@/components/file-upload"
import { AdminOnly } from "@/components/admin-only"

export default function FilesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Files</h1>

      <div className="grid gap-6">
        <AdminOnly
          fallback={
            <div className="mb-6">
              <FileList readOnly />
            </div>
          }
        >
          <div className="mb-6">
            <FileUpload />
          </div>

          <div className="mb-6">
            <FileList />
          </div>
        </AdminOnly>
      </div>
    </div>
  )
}
