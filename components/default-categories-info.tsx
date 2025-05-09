import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_MEMORY_CATEGORIES } from "@/lib/mem0"
import { Info } from "lucide-react"

export function DefaultCategoriesInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="mr-2 h-5 w-5" />
          Default Memory Categories
        </CardTitle>
        <CardDescription>
          The system provides these default categories to help you organize your memories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Default categories are automatically created when you first use the memory system. You can customize these
            categories or create your own.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEFAULT_MEMORY_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="flex items-center p-2 rounded-md"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                <div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
