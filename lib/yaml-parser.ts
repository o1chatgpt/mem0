import yaml from "js-yaml"
import type { Tool, ToolkitItem } from "@/types/tool-system"
import { slugify } from "@/lib/utils"

export function parseToolYaml(yamlContent: string): Omit<Tool, "id" | "created_at" | "updated_at"> | null {
  try {
    const parsed = yaml.load(yamlContent) as any

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid YAML: Expected an object")
    }

    if (!parsed.name) {
      throw new Error("Tool name is required")
    }

    if (!parsed.route) {
      throw new Error("Tool route is required")
    }

    const slug = parsed.slug || slugify(parsed.name)

    // Parse toolkit items
    const toolkit: ToolkitItem[] = Array.isArray(parsed.toolkit)
      ? parsed.toolkit
          .map((item: any) => {
            if (typeof item === "string") {
              // Simple format: "input: prompt"
              const [type, name] = item.split(":").map((s) => s.trim())
              return { type, name }
            } else if (typeof item === "object") {
              // Complex format with additional properties
              return item
            }
            return null
          })
          .filter(Boolean)
      : []

    return {
      name: parsed.name,
      slug,
      description: parsed.description || null,
      route: parsed.route,
      type: parsed.type || "other",
      toolkit,
      voice_trigger: parsed.voice_trigger || null,
    }
  } catch (error) {
    console.error("Error parsing YAML:", error)
    return null
  }
}

export function generateToolYaml(tool: Partial<Tool>): string {
  try {
    const yamlObj: any = {
      name: tool.name || "Untitled Tool",
      description: tool.description || "",
      route: tool.route || "/app/untitled-tool",
      type: tool.type || "other",
    }

    if (tool.slug) {
      yamlObj.slug = tool.slug
    }

    if (tool.voice_trigger) {
      yamlObj.voice_trigger = tool.voice_trigger
    }

    if (tool.toolkit && tool.toolkit.length > 0) {
      yamlObj.toolkit = tool.toolkit
    }

    return yaml.dump(yamlObj)
  } catch (error) {
    console.error("Error generating YAML:", error)
    return ""
  }
}

export function parseYaml<T>(yamlString: string): T {
  try {
    return yaml.load(yamlString) as T
  } catch (error) {
    console.error("Error parsing YAML:", error)
    throw new Error("Failed to parse YAML data")
  }
}

export function stringifyYaml(data: any): string {
  try {
    return yaml.dump(data)
  } catch (error) {
    console.error("Error stringifying YAML:", error)
    throw new Error("Failed to stringify data to YAML")
  }
}
