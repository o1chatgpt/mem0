import { notFound } from "next/navigation"
import { getToolById } from "@/lib/db/tool-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function DynamicToolPage({ params }: { params: { id: string } }) {
  const toolId = Number.parseInt(params.id, 10)

  if (isNaN(toolId)) {
    notFound()
  }

  const tool = await getToolById(toolId)

  if (!tool) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tool.name}</CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {tool.toolkit.map((item, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={item.name}>{item.label || item.name}</Label>

                {item.type === "input" && (
                  <Input
                    id={item.name}
                    name={item.name}
                    placeholder={`Enter ${item.label || item.name}...`}
                    defaultValue={item.default || ""}
                  />
                )}

                {item.type === "select" && (
                  <Select defaultValue={item.default}>
                    <SelectTrigger id={item.name}>
                      <SelectValue placeholder={`Select ${item.label || item.name}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {item.options?.map((option, optIndex) => (
                        <SelectItem key={optIndex} value={option.value}>
                          {option.label}
                        </SelectItem>
                      )) || <SelectItem value="default">Default Option</SelectItem>}
                    </SelectContent>
                  </Select>
                )}

                {item.type === "config" && (
                  <div className="flex items-center space-x-2">
                    <Label>{item.label || item.name}:</Label>
                    <Input
                      id={item.name}
                      name={item.name}
                      placeholder={`Configure ${item.label || item.name}...`}
                      className="max-w-xs"
                      defaultValue={item.default || ""}
                    />
                  </div>
                )}

                {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
              </div>
            ))}

            <div className="pt-4">
              <Button type="submit">Execute Tool</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
