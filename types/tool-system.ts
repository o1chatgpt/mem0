export interface Tool {
  id: number
  name: string
  slug: string
  description: string | null
  route: string
  type: "office" | "home" | "creative" | "education" | "other"
  toolkit: ToolkitItem[]
  voice_trigger: string | null
  created_at: string
  updated_at: string
}

export interface ToolkitItem {
  type: "input" | "select" | "toggle" | "slider" | "file" | "config"
  name: string
  label?: string
  description?: string
  required?: boolean
  default?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
}

export interface AIFamilyTool {
  id: number
  ai_family_id: string
  tool_id: number
  permission_level: "use" | "manage" | "admin"
  created_at: string
  updated_at: string
}

export interface AppRoute {
  id: number
  route: string
  component_path: string
  is_active: boolean
  created_at: string
  updated_at: string
}
