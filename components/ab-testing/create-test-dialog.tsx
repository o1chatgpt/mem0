"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlaskConical, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define a schema for a single variation
const variationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Variation name is required" }),
  description: z.string().optional(),
  template: z.string().min(10, { message: "Template content must be at least 10 characters" }),
})

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Test name must be at least 3 characters" }),
  description: z.string().optional(),
  templateName: z.string({ required_error: "Please select a template" }),
  variations: z.array(variationSchema).min(2, { message: "At least 2 variations are required" }),
  duration: z.number().min(1).max(30),
})

interface CreateTestDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateTest: (test: any) => void
}

export function CreateTestDialog({ isOpen, onClose, onCreateTest }: CreateTestDialogProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [activeVariationId, setActiveVariationId] = useState<string>("var-A")

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      templateName: "",
      variations: [
        {
          id: "var-A",
          name: "Original",
          description: "",
          template: "",
        },
        {
          id: "var-B",
          name: "Variation B",
          description: "",
          template: "",
        },
      ],
      duration: 14, // Default to 14 days
    },
  })

  // Get variations from form
  const variations = form.watch("variations")

  // Fetch available templates
  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const mockTemplates = [
      {
        name: "Research Assistant",
        description: "Template for research-related queries",
        content:
          "You are a research assistant helping with academic research. Your goal is to provide accurate information and help with research methodologies.",
      },
      {
        name: "Creative Writing Coach",
        description: "Template for creative writing assistance",
        content:
          "You are a creative writing coach. Your goal is to inspire creativity and help improve writing skills through constructive feedback and suggestions.",
      },
      {
        name: "File Organizer",
        description: "Template for file organization assistance",
        content:
          "You are a file organization expert. Your goal is to help users organize their digital files efficiently with best practices and systematic approaches.",
      },
      {
        name: "Technical Advisor",
        description: "Template for technical assistance",
        content:
          "You are a technical advisor with expertise in software and technology. Your goal is to provide clear explanations and solutions to technical problems.",
      },
    ]

    setTemplates(mockTemplates)
  }, [])

  // Update form when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      // Update all variations with the template content
      const updatedVariations = variations.map((variation) => ({
        ...variation,
        template: selectedTemplate.content,
      }))
      form.setValue("variations", updatedVariations)
    }
  }, [selectedTemplate, form])

  // Handle template selection
  const handleTemplateChange = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName)
    if (template) {
      setSelectedTemplate(template)
      form.setValue("templateName", templateName)
    }
  }

  // Add a new variation
  const addVariation = () => {
    const currentVariations = form.getValues("variations")
    const nextLetter = String.fromCharCode("A".charCodeAt(0) + currentVariations.length)

    const newVariation = {
      id: `var-${nextLetter}`,
      name: `Variation ${nextLetter}`,
      description: "",
      template: selectedTemplate ? selectedTemplate.content : "",
    }

    form.setValue("variations", [...currentVariations, newVariation])
    setActiveVariationId(newVariation.id)
  }

  // Remove a variation
  const removeVariation = (id: string) => {
    const currentVariations = form.getValues("variations")

    // Don't allow removing if only 2 variations remain
    if (currentVariations.length <= 2) {
      return
    }

    const updatedVariations = currentVariations.filter((v) => v.id !== id)
    form.setValue("variations", updatedVariations)

    // If the active variation is being removed, switch to the first one
    if (activeVariationId === id) {
      setActiveVariationId(updatedVariations[0].id)
    }
  }

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert array of variations to object with keys A, B, C, etc.
    const variationsObject: Record<string, any> = {}
    values.variations.forEach((variation, index) => {
      const key = String.fromCharCode(65 + index) // A, B, C, etc.
      variationsObject[key] = {
        name: variation.name,
        description: variation.description,
        template: variation.template,
      }
    })

    const newTest = {
      name: values.name,
      description: values.description,
      templateName: values.templateName,
      duration: values.duration,
      variations: variationsObject,
    }

    onCreateTest(newTest)
    onClose()
    form.reset()
    setActiveVariationId("var-A")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5" />
            Create Multivariate Test
          </DialogTitle>
          <DialogDescription>
            Create a test to compare multiple variations of a template and see which performs best
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Improved Research Template" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Duration (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>How long to run the test (1-30 days)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what you're testing and why" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template to Test</FormLabel>
                  <Select onValueChange={(value) => handleTemplateChange(value)} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the template you want to create variations for</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Template Variations</h3>
                <Button type="button" variant="outline" size="sm" onClick={addVariation} className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variation
                </Button>
              </div>

              <Tabs value={activeVariationId} onValueChange={setActiveVariationId}>
                <ScrollArea className="max-w-full pb-2">
                  <TabsList className="mb-4 inline-flex w-auto">
                    {variations.map((variation, index) => (
                      <TabsTrigger key={variation.id} value={variation.id} className="relative">
                        {String.fromCharCode(65 + index)}: {variation.name}
                        {variations.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 absolute -top-2 -right-2 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeVariation(variation.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Remove variation</span>
                          </Button>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>

                {variations.map((variation, index) => (
                  <TabsContent key={variation.id} value={variation.id} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Variation {String.fromCharCode(65 + index)}</Badge>
                      {index === 0 && <Badge variant="secondary">Original</Badge>}
                    </div>

                    <FormField
                      control={form.control}
                      name={`variations.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variation Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variations.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variation Description</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                index === 0 ? "e.g., Original template" : `e.g., Modified version ${index + 1}`
                              }
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variations.${index}.template`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Content</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[200px] font-mono text-sm"
                              placeholder="Enter the template content..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {index === 0
                              ? "This is the original template content"
                              : "Modify this content to create your test variation"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                ))}
              </Tabs>

              <FormField control={form.control} name="variations" render={() => <FormMessage />} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Test</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
