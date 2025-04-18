/**
 * Environment Variable Presets
 *
 * This module defines predefined sets of environment variables for different deployment scenarios.
 * It provides utilities to apply these presets and generate appropriate .env files.
 */

import { requiredEnvVars } from "./env-validator"

// Define the structure for environment variable presets
export interface EnvPreset {
  id: string
  name: string
  description: string
  variables: Record<string, string | null>
  tags: string[]
  recommended: boolean
  compatibleWith?: string[] // IDs of other presets this can be combined with
  incompatibleWith?: string[] // IDs of other presets this cannot be combined with
  requiredFeatures?: string[] // Features that must be enabled for this preset
}

// Define the structure for a preset category
export interface PresetCategory {
  id: string
  name: string
  description: string
  presets: EnvPreset[]
}

// Define predefined environment variable presets
export const environmentPresets: PresetCategory[] = [
  {
    id: "deployment",
    name: "Deployment Environments",
    description: "Presets for different deployment environments (development, staging, production)",
    presets: [
      {
        id: "development",
        name: "Development Environment",
        description: "Local development environment with debugging enabled and relaxed security",
        tags: ["development", "local", "debug"],
        recommended: true,
        variables: {
          // Database configuration
          NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
          SUPABASE_URL: "http://localhost:54321",
          SUPABASE_SERVICE_ROLE_KEY:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",

          // Application configuration
          NEXT_PUBLIC_APP_URL: "http://localhost:3000",
          NEXT_PUBLIC_APP_NAME: "File Manager (Dev)",

          // Feature flags
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "true",
          NEXT_PUBLIC_ENABLE_DEMO_MODE: "false",

          // Debug settings
          NODE_ENV: "development",
          DEBUG: "app:*",

          // Mem0 API (using mock in development)
          MEM0_API_URL: "http://localhost:3001/api/mem0-mock",
          MEM0_API_KEY: "dev_mem0_key_for_testing",
        },
      },
      {
        id: "staging",
        name: "Staging Environment",
        description: "Testing environment that mirrors production but with additional debugging",
        tags: ["staging", "testing", "pre-production"],
        recommended: false,
        variables: {
          // Database configuration (using staging instance)
          NEXT_PUBLIC_SUPABASE_URL: "https://staging-instance.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: null, // Requires actual key
          SUPABASE_URL: "https://staging-instance.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: null, // Requires actual key

          // Application configuration
          NEXT_PUBLIC_APP_URL: "https://staging.filemanager.example.com",
          NEXT_PUBLIC_APP_NAME: "File Manager (Staging)",

          // Feature flags
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "true",
          NEXT_PUBLIC_ENABLE_DEMO_MODE: "false",

          // Debug settings
          NODE_ENV: "production", // Use production mode but with debugging
          DEBUG: "app:error,app:warning",

          // Mem0 API (using staging instance)
          MEM0_API_URL: "https://staging-api.mem0.ai",
          MEM0_API_KEY: null, // Requires actual key
        },
      },
      {
        id: "production",
        name: "Production Environment",
        description: "Live production environment with optimized performance and security",
        tags: ["production", "live", "secure"],
        recommended: false,
        variables: {
          // Database configuration (using production instance)
          NEXT_PUBLIC_SUPABASE_URL: null, // Requires actual URL
          NEXT_PUBLIC_SUPABASE_ANON_KEY: null, // Requires actual key
          SUPABASE_URL: null, // Requires actual URL
          SUPABASE_SERVICE_ROLE_KEY: null, // Requires actual key

          // Application configuration
          NEXT_PUBLIC_APP_URL: null, // Requires actual URL
          NEXT_PUBLIC_APP_NAME: "File Manager",

          // Feature flags
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "true",
          NEXT_PUBLIC_ENABLE_DEMO_MODE: "false",

          // Production settings
          NODE_ENV: "production",

          // Mem0 API (using production instance)
          MEM0_API_URL: "https://api.mem0.ai",
          MEM0_API_KEY: null, // Requires actual key
        },
      },
    ],
  },
  {
    id: "features",
    name: "Feature Sets",
    description: "Presets for enabling specific feature sets",
    presets: [
      {
        id: "minimal",
        name: "Minimal Setup",
        description: "Basic setup with only essential features enabled",
        tags: ["minimal", "essential", "lightweight"],
        recommended: false,
        variables: {
          // Feature flags
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "false",
          NEXT_PUBLIC_ENABLE_DEMO_MODE: "false",

          // Minimal configuration
          NEXT_PUBLIC_MAX_UPLOAD_SIZE: "1048576", // 1MB
        },
      },
      {
        id: "file-operations",
        name: "File Operations",
        description: "Setup with file operations enabled (FTP, uploads, etc.)",
        tags: ["files", "ftp", "uploads"],
        recommended: false,
        variables: {
          // Feature flags
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "true",

          // FTP configuration
          FTP_HOST: null, // Requires actual host
          FTP_USER: null, // Requires actual user
          FTP_PASSWORD: null, // Requires actual password
          FTP_PORT: "21",
          FTP_ROOT_DIR: "/",

          // Upload configuration
          NEXT_PUBLIC_MAX_UPLOAD_SIZE: "10485760", // 10MB
        },
      },
      {
        id: "demo-mode",
        name: "Demo Mode",
        description: "Setup with demo mode enabled for showcasing the application",
        tags: ["demo", "showcase", "presentation"],
        recommended: false,
        variables: {
          // Feature flags
          NEXT_PUBLIC_ENABLE_DEMO_MODE: "true",
          NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: "true",

          // Demo configuration
          NEXT_PUBLIC_APP_NAME: "File Manager Demo",

          // Demo data
          SEED_DEMO_DATA: "true",
        },
      },
      {
        id: "ai-features",
        name: "AI Features",
        description: "Setup with AI and memory features enabled",
        tags: ["ai", "memory", "mem0"],
        recommended: true,
        variables: {
          // Mem0 API configuration
          MEM0_API_URL: null, // Requires actual URL
          MEM0_API_KEY: null, // Requires actual key

          // AI feature flags
          NEXT_PUBLIC_ENABLE_AI_FEATURES: "true",
        },
      },
    ],
  },
  {
    id: "security",
    name: "Security Configurations",
    description: "Presets for different security levels",
    presets: [
      {
        id: "basic-security",
        name: "Basic Security",
        description: "Standard security configuration for general use",
        tags: ["security", "standard", "basic"],
        recommended: true,
        variables: {
          // Security headers
          NEXT_PUBLIC_SECURITY_HEADERS: "true",

          // Rate limiting
          RATE_LIMIT_REQUESTS: "100",
          RATE_LIMIT_WINDOW_MS: "60000",
        },
      },
      {
        id: "enhanced-security",
        name: "Enhanced Security",
        description: "Enhanced security configuration for sensitive applications",
        tags: ["security", "enhanced", "sensitive"],
        recommended: false,
        variables: {
          // Security headers
          NEXT_PUBLIC_SECURITY_HEADERS: "true",

          // Rate limiting
          RATE_LIMIT_REQUESTS: "50",
          RATE_LIMIT_WINDOW_MS: "60000",

          // Enhanced security features
          ENABLE_2FA: "true",
          SESSION_TIMEOUT_MINUTES: "30",
          PASSWORD_POLICY_STRENGTH: "high",
        },
      },
    ],
  },
  {
    id: "integrations",
    name: "Third-Party Integrations",
    description: "Presets for different third-party service integrations",
    presets: [
      {
        id: "analytics",
        name: "Analytics Integration",
        description: "Setup with analytics services enabled",
        tags: ["analytics", "tracking", "metrics"],
        recommended: false,
        variables: {
          // Google Analytics
          NEXT_PUBLIC_GA_MEASUREMENT_ID: null, // Requires actual ID

          // Application Insights
          APPLICATIONINSIGHTS_CONNECTION_STRING: null, // Requires actual connection string

          // Feature flags
          NEXT_PUBLIC_ENABLE_ANALYTICS: "true",
        },
      },
      {
        id: "auth-providers",
        name: "Authentication Providers",
        description: "Setup with various authentication providers",
        tags: ["auth", "oauth", "login"],
        recommended: false,
        variables: {
          // Google OAuth
          GOOGLE_CLIENT_ID: null, // Requires actual ID
          GOOGLE_CLIENT_SECRET: null, // Requires actual secret

          // GitHub OAuth
          GITHUB_CLIENT_ID: null, // Requires actual ID
          GITHUB_CLIENT_SECRET: null, // Requires actual secret

          // Feature flags
          NEXT_PUBLIC_ENABLE_SOCIAL_AUTH: "true",
        },
      },
    ],
  },
]

// Define user-defined presets storage
export interface UserDefinedPreset extends EnvPreset {
  createdAt: string
  updatedAt: string
}

/**
 * Gets a preset by its ID
 * @param presetId The ID of the preset to retrieve
 * @returns The preset or undefined if not found
 */
export function getPresetById(presetId: string): EnvPreset | undefined {
  for (const category of environmentPresets) {
    const preset = category.presets.find((p) => p.id === presetId)
    if (preset) {
      return preset
    }
  }

  // Check user-defined presets
  const userPresets = getUserDefinedPresets()
  return userPresets.find((p) => p.id === presetId)
}

/**
 * Gets all presets from all categories
 * @returns Array of all presets
 */
export function getAllPresets(): EnvPreset[] {
  const presets: EnvPreset[] = []

  for (const category of environmentPresets) {
    presets.push(...category.presets)
  }

  // Add user-defined presets
  presets.push(...getUserDefinedPresets())

  return presets
}

/**
 * Gets user-defined presets from local storage
 * @returns Array of user-defined presets
 */
export function getUserDefinedPresets(): UserDefinedPreset[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedPresets = localStorage.getItem("user-defined-presets")
    if (!storedPresets) {
      return []
    }

    return JSON.parse(storedPresets)
  } catch (error) {
    console.error("Error loading user-defined presets:", error)
    return []
  }
}

/**
 * Saves a user-defined preset
 * @param preset The preset to save
 */
export function saveUserDefinedPreset(preset: Omit<UserDefinedPreset, "createdAt" | "updatedAt">): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const userPresets = getUserDefinedPresets()
    const now = new Date().toISOString()

    // Check if preset already exists
    const existingIndex = userPresets.findIndex((p) => p.id === preset.id)

    if (existingIndex >= 0) {
      // Update existing preset
      userPresets[existingIndex] = {
        ...preset,
        createdAt: userPresets[existingIndex].createdAt,
        updatedAt: now,
      }
    } else {
      // Add new preset
      userPresets.push({
        ...preset,
        createdAt: now,
        updatedAt: now,
      })
    }

    localStorage.setItem("user-defined-presets", JSON.stringify(userPresets))
  } catch (error) {
    console.error("Error saving user-defined preset:", error)
  }
}

/**
 * Deletes a user-defined preset
 * @param presetId The ID of the preset to delete
 * @returns True if the preset was deleted, false otherwise
 */
export function deleteUserDefinedPreset(presetId: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const userPresets = getUserDefinedPresets()
    const initialLength = userPresets.length

    const filteredPresets = userPresets.filter((p) => p.id !== presetId)

    if (filteredPresets.length !== initialLength) {
      localStorage.setItem("user-defined-presets", JSON.stringify(filteredPresets))
      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting user-defined preset:", error)
    return false
  }
}

/**
 * Generates environment variables from a preset
 * @param presetId The ID of the preset to apply
 * @param customValues Custom values to override preset values
 * @returns Object with environment variables
 */
export function generateEnvFromPreset(
  presetId: string | string[],
  customValues: Record<string, string> = {},
): Record<string, string> {
  const presetIds = Array.isArray(presetId) ? presetId : [presetId]
  const result: Record<string, string> = {}

  // Apply each preset in order
  for (const id of presetIds) {
    const preset = getPresetById(id)
    if (!preset) {
      console.warn(`Preset with ID "${id}" not found`)
      continue
    }

    // Apply preset variables (skip null values)
    for (const [key, value] of Object.entries(preset.variables)) {
      if (value !== null) {
        result[key] = value
      }
    }
  }

  // Apply custom values
  for (const [key, value] of Object.entries(customValues)) {
    result[key] = value
  }

  return result
}

/**
 * Generates a .env file content from environment variables
 * @param variables Environment variables object
 * @returns String content for .env file
 */
export function generateEnvFileContent(variables: Record<string, string>): string {
  let content = "# Generated environment variables\n"
  content += `# Generated at: ${new Date().toISOString()}\n\n`

  for (const [key, value] of Object.entries(variables)) {
    // Add comment with description if available
    if (key in requiredEnvVars) {
      content += `# ${requiredEnvVars[key as keyof typeof requiredEnvVars].description}\n`
    }

    // Add the variable
    content += `${key}=${escapeEnvValue(value)}\n\n`
  }

  return content
}

/**
 * Escapes a value for use in a .env file
 * @param value The value to escape
 * @returns Escaped value
 */
function escapeEnvValue(value: string): string {
  // If value contains spaces, newlines, or special characters, wrap in quotes
  if (/[\s\n\r"'\\]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`
  }
  return value
}

/**
 * Checks if presets are compatible with each other
 * @param presetIds Array of preset IDs to check
 * @returns Object with compatibility information
 */
export function checkPresetCompatibility(presetIds: string[]): {
  compatible: boolean
  incompatibilities: Array<{ preset1: string; preset2: string; reason: string }>
} {
  const incompatibilities: Array<{ preset1: string; preset2: string; reason: string }> = []

  // Check each preset against others
  for (let i = 0; i < presetIds.length; i++) {
    const preset1 = getPresetById(presetIds[i])
    if (!preset1) continue

    // Check against other presets
    for (let j = i + 1; j < presetIds.length; j++) {
      const preset2 = getPresetById(presetIds[j])
      if (!preset2) continue

      // Check explicit incompatibilities
      if (preset1.incompatibleWith?.includes(preset2.id)) {
        incompatibilities.push({
          preset1: preset1.id,
          preset2: preset2.id,
          reason: `${preset1.name} is explicitly incompatible with ${preset2.name}`,
        })
      }

      if (preset2.incompatibleWith?.includes(preset1.id)) {
        incompatibilities.push({
          preset1: preset1.id,
          preset2: preset2.id,
          reason: `${preset2.name} is explicitly incompatible with ${preset1.name}`,
        })
      }

      // Check for conflicting variable values
      for (const [key, value1] of Object.entries(preset1.variables)) {
        const value2 = preset2.variables[key]

        if (value1 !== null && value2 !== null && value1 !== value2) {
          incompatibilities.push({
            preset1: preset1.id,
            preset2: preset2.id,
            reason: `Conflicting values for ${key}: "${value1}" vs "${value2}"`,
          })
        }
      }
    }
  }

  return {
    compatible: incompatibilities.length === 0,
    incompatibilities,
  }
}

/**
 * Detects the current environment based on existing environment variables
 * @returns Array of preset IDs that match the current environment
 */
export function detectCurrentEnvironment(): string[] {
  const matchingPresets: string[] = []

  // Get all presets
  const allPresets = getAllPresets()

  // Check each preset for matches
  for (const preset of allPresets) {
    let matches = true
    let matchCount = 0

    // Check if preset variables match current environment
    for (const [key, value] of Object.entries(preset.variables)) {
      if (value === null) continue // Skip null values

      if (typeof window !== "undefined") {
        // In browser, check localStorage for development values
        const localValue = localStorage.getItem(`env-${key}`)
        if (localValue && localValue === value) {
          matchCount++
        } else if (localValue) {
          matches = false
          break
        }
      } else {
        // In Node.js, check process.env
        if (process.env[key] === value) {
          matchCount++
        } else if (process.env[key]) {
          matches = false
          break
        }
      }
    }

    // Consider it a match if at least 3 variables match and none conflict
    if (matches && matchCount >= 3) {
      matchingPresets.push(preset.id)
    }
  }

  return matchingPresets
}

/**
 * Downloads a .env file with the generated content
 * @param variables Environment variables object
 * @param filename Name of the file to download
 */
export function downloadEnvFile(variables: Record<string, string>, filename = ".env.local"): void {
  if (typeof window === "undefined") {
    return
  }

  const content = generateEnvFileContent(variables)
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
