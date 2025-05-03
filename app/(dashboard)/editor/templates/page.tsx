import { fileTemplates } from "@/lib/file-templates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Code Templates</h1>
        <p className="text-muted-foreground">Browse available templates for different file types</p>
      </div>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="mb-4">
          {fileTemplates.map((category) => (
            <TabsTrigger key={category.language} value={category.language}>
              {category.language.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {fileTemplates.map((category) => (
          <TabsContent key={category.language} value={category.language} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.templates.map((template) => (
                <Card key={template.name}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <pre className="p-4 text-sm">
                        <code>{template.content}</code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
