import { FileEditor } from "@/components/file-editor"

interface FileEditorPageProps {
  params: {
    fileId: string
  }
}

export default function FileEditorPage({ params }: FileEditorPageProps) {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <FileEditor fileId={params.fileId} />
    </div>
  )
}
