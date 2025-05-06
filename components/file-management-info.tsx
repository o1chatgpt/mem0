import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HardDrive, Server, Globe, FileText } from "lucide-react"

export function FileManagementInfo() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">File Management Capabilities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-blue-500" />
              Local File Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              The current build includes a simulated local file system for demonstration purposes.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browse files and folders</li>
              <li>View file contents</li>
              <li>Edit text-based files</li>
              <li>Create new text files</li>
              <li>Mark files as favorites</li>
              <li>Track recently accessed files</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-purple-500" />
              Server Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Server management features connect to aaPanel API:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>View server status and resources</li>
              <li>Monitor CPU, memory, and disk usage</li>
              <li>Track network traffic</li>
              <li>View server load metrics</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-500" />
              Website Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Website management features via aaPanel API:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>List, create, and manage websites</li>
              <li>Start/stop website services</li>
              <li>Create website backups</li>
              <li>Manage domains and configurations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              FTP Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">FTP functionality is included but not active in the demo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>FTP connection configuration is present</li>
              <li>Deployment script uses FTP for file uploads</li>
              <li>FTP credentials can be configured in environment variables</li>
              <li>To enable active FTP file management, additional implementation would be needed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
