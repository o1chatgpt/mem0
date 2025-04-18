"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, Download, Plus, Trash2, AlertTriangle } from "lucide-react"
import {
  environmentPresets,
  type EnvPreset,
  type PresetCategory,
  generateEnvFromPreset,
  downloadEnvFile,
  checkPresetCompatibility,
  getUserDefinedPresets,
  saveUserDefinedPreset,
  deleteUserDefinedPreset,
} from "@/lib/env-presets"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvPresetManager() {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("deployment")
  const [compatibility, setCompatibility] = useState<ReturnType<typeof checkPresetCompatibility>>({
    compatible: true,
    incompatibilities: [],
  })
  const [userPresets, setUserPresets] = useState<ReturnType<typeof getUserDefinedPresets>>([])
  const [newPresetOpen, setNewPresetOpen] = useState(false)

  // Load user presets on mount
  useEffect(() => {
    setUserPresets(getUserDefinedPresets())
  }, [])

  // Check compatibility when selected presets change
  useEffect(() => {
    if (selectedPresets.length > 1) {
      setCompatibility(checkPresetCompatibility(selectedPresets))
    } else {
      setCompatibility({ compatible: true, incompatibilities: [] })
    }
  }, [selectedPresets])

  // Toggle a preset selection
  const togglePreset = (presetId: string) => {
    setSelectedPresets((prev) => (prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]))
  }

  // Handle downloading the .env file
  const handleDownload = () => {
    if (selectedPresets.length === 0) return

    const variables = generateEnvFromPreset(selectedPresets)
    downloadEnvFile(variables)
  }

  // Handle creating a new preset
  const handleCreatePreset = (preset: Omit<EnvPreset, "variables"> & { variables: string }) => {
    try {
      // Parse variables from JSON string
      const variables = JSON.parse(preset.variables)

      // Create the new preset
      const newPreset = {
        ...preset,
        variables,
      }

      // Save the preset
      saveUserDefinedPreset(newPreset)

      // Update the user presets list
      setUserPresets(getUserDefinedPresets())

      // Close the dialog
      setNewPresetOpen(false)
    } catch (error) {
      console.error("Error creating preset:", error)
      alert("Error creating preset. Please check the variables format.")
    }
  }

  // Handle deleting a user preset
  const handleDeletePreset = (presetId: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      // Remove from selected presets if it's selected
      if (selectedPresets.includes(presetId)) {
        setSelectedPresets((prev) => prev.filter((id) => id !== presetId))
      }

      // Delete the preset
      deleteUserDefinedPreset(presetId)

      // Update the user presets list
      setUserPresets(getUserDefinedPresets())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Environment Presets</h2>
          <div className="flex space-x-2">
            <Dialog open={newPresetOpen} onOpenChange={setNewPresetOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Preset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <NewPresetForm onSubmit={handleCreatePreset} onCancel={() => setNewPresetOpen(false)} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleDownload} disabled={selectedPresets.length === 0} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download .env
            </Button>
          </div>
        </div>

        {selectedPresets.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
            <span className="text-sm font-medium text-muted-foreground">Selected:</span>
            {selectedPresets.map((id) => {
              const preset =
                environmentPresets.flatMap((cat) => cat.presets).find((p) => p.id === id) ||
                userPresets.find((p) => p.id === id)

              return preset ? (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {preset.name}
                  <button
                    onClick={() => togglePreset(id)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        )}

        {!compatibility.compatible && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Compatibility Issues</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The selected presets have compatibility issues:</p>
              <ul className="list-disc pl-5 space-y-1">
                {compatibility.incompatibilities.map((issue, i) => (
                  <li key={i} className="text-sm">
                    {issue.reason}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          {environmentPresets.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
          {userPresets.length > 0 && <TabsTrigger value="user">Custom Presets</TabsTrigger>}
        </TabsList>

        {environmentPresets.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <PresetCategoryView category={category} selectedPresets={selectedPresets} onTogglePreset={togglePreset} />
          </TabsContent>
        ))}

        {userPresets.length > 0 && (
          <TabsContent value="user">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedPresets.includes(preset.id)}
                  onToggle={() => togglePreset(preset.id)}
                  onDelete={() => handleDeletePreset(preset.id)}
                  isUserDefined
                />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {selectedPresets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Preview of the environment variables that will be generated</CardDescription>
          </CardHeader>
          <CardContent>
            <PresetPreview presetIds={selectedPresets} />
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download .env
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// Component to display a category of presets
function PresetCategoryView({
  category,
  selectedPresets,
  onTogglePreset,
}: {
  category: PresetCategory
  selectedPresets: string[]
  onTogglePreset: (id: string) => void
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-4">{category.description}</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {category.presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={selectedPresets.includes(preset.id)}
            onToggle={() => onTogglePreset(preset.id)}
          />
        ))}
      </div>
    </div>
  )
}

// Component to display a preset card
function PresetCard({
  preset,
  isSelected,
  onToggle,
  onDelete,
  isUserDefined = false,
}: {
  preset: EnvPreset
  isSelected: boolean
  onToggle: () => void
  onDelete?: () => void
  isUserDefined?: boolean
}) {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{preset.name}</CardTitle>
          {isUserDefined && onDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{preset.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-3">
          {preset.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {preset.recommended && (
            <Badge variant="default" className="text-xs bg-green-600">
              Recommended
            </Badge>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="variables">
            <AccordionTrigger className="text-sm py-2">
              Variables ({Object.keys(preset.variables).length})
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {Object.entries(preset.variables).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-mono font-medium">{key}</span>
                      <span className="text-muted-foreground"> = </span>
                      <span className="font-mono">
                        {value === null ? <span className="text-yellow-500">Required</span> : value}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button variant={isSelected ? "default" : "outline"} onClick={onToggle} className="w-full">
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            "Select"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Component to preview the generated environment variables
function PresetPreview({ presetIds }: { presetIds: string[] }) {
  const variables = generateEnvFromPreset(presetIds)

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="font-mono text-xs">
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="font-medium">{key}</span>
            <span className="text-muted-foreground">=</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// Form for creating a new preset
function NewPresetForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (preset: Omit<EnvPreset, "variables"> & { variables: string }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    tags: "",
    recommended: false,
    variables: '{\n  "EXAMPLE_VAR": "value",\n  "ANOTHER_VAR": null\n}',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert tags string to array
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSubmit({
      ...formData,
      tags,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create Custom Preset</DialogTitle>
        <DialogDescription>
          Create a custom environment variable preset for your specific deployment scenario.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="my-custom-preset"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Custom Preset"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this preset is for"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="custom, specific, etc"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="recommended"
            name="recommended"
            checked={formData.recommended}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="recommended">Recommended preset</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="variables">Variables (JSON format)</Label>
          <Textarea
            id="variables"
            name="variables"
            value={formData.variables}
            onChange={handleChange}
            className="font-mono text-xs h-[200px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            Use <code>null</code> for variables that require user input
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Preset</Button>
      </DialogFooter>
    </form>
  )
}
