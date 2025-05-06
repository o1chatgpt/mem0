import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Search, Tag, History, Share2, FileText, Upload, FolderPlus, Sparkles } from "lucide-react"

export function FeatureHighlights() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-primary" />
          Smart File Manager Features
        </h2>
        <p className="text-muted-foreground">
          Discover how our intelligent file management system can help you work more efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI-Powered Organization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our system uses AI to automatically organize your files based on content, usage patterns, and your
              preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Smart Search</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find what you need quickly with natural language search that understands the content of your files.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Getting Started</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg shadow-sm">
            <FolderPlus className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium mb-1">Create Folders</h4>
            <p className="text-xs text-muted-foreground">Organize your files with custom folders and subfolders</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg shadow-sm">
            <Upload className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium mb-1">Upload Files</h4>
            <p className="text-xs text-muted-foreground">Drag and drop files or use the upload button</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg shadow-sm">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium mb-1">Create Documents</h4>
            <p className="text-xs text-muted-foreground">Create new text files, notes, and documents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Smart Tagging</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically generate tags based on file content and organize your files with custom tags.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Usage History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your file usage patterns and get insights into your workflow with detailed history.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Collaboration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Share files securely and collaborate with team members in real-time with version control.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
