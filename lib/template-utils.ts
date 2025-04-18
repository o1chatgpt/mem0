import type { MemoryCategory } from "@/lib/mem0"

// Template export/import format
export interface TemplateExport {
  name: string
  description: string
  prompt_template: string
  color?: string
  icon?: string
  metadata?: {
    author?: string
    version?: string
    tags?: string[]
    created?: string
    updated?: string
  }
}

// Validate imported template data
export function validateTemplateImport(data: any): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: "Invalid template data" }
  }

  // Check required fields
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, error: "Template name is required" }
  }

  if (!data.prompt_template || typeof data.prompt_template !== "string") {
    return { valid: false, error: "Prompt template is required" }
  }

  // Description is optional but must be a string if present
  if (data.description && typeof data.description !== "string") {
    return { valid: false, error: "Description must be a string" }
  }

  // Validate color format if present (should be a hex color)
  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    return { valid: false, error: "Color must be a valid hex color (e.g., #FF5733)" }
  }

  return { valid: true }
}

// Convert a memory category to exportable template
export function categoryToTemplate(category: MemoryCategory): TemplateExport {
  return {
    name: category.name,
    description: category.description || "",
    prompt_template: category.prompt_template || "",
    color: category.color || undefined,
    icon: category.icon || undefined,
    metadata: {
      created: new Date().toISOString(),
    },
  }
}

// Generate a shareable JSON string from a template
export function templateToShareableString(template: TemplateExport): string {
  return JSON.stringify(template, null, 2)
}

// Parse a shareable string back to a template
export function parseShareableString(str: string): { template?: TemplateExport; error?: string } {
  try {
    const parsed = JSON.parse(str)
    const validation = validateTemplateImport(parsed)

    if (!validation.valid) {
      return { error: validation.error }
    }

    return { template: parsed as TemplateExport }
  } catch (error) {
    return { error: "Invalid JSON format" }
  }
}

// Generate a filename for downloading a template
export function getTemplateFilename(template: TemplateExport): string {
  // Create a slug from the template name
  const slug = template.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens

  return `template-${slug}.json`
}
