/**
 * Environment Variable Validation Utility
 *
 * This utility validates that all required environment variables are properly set.
 * It provides detailed error messages and instructions for fixing missing variables.
 */

// Define all required environment variables with descriptions and validation rules
export const requiredEnvVars = {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: {
    description: "The public URL of your Supabase instance",
    required: true,
    example: "https://your-project.supabase.co",
    usedIn: ["Authentication", "Database", "Storage"],
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: "The public anon key for your Supabase instance",
    required: true,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usedIn: ["Authentication", "Database", "Storage"],
  },
  SUPABASE_URL: {
    description: "The URL of your Supabase instance (server-side)",
    required: true,
    example: "https://your-project.supabase.co",
    usedIn: ["Server-side database operations"],
    fallback: "NEXT_PUBLIC_SUPABASE_URL",
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: "The service role key for your Supabase instance",
    required: true,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usedIn: ["Server-side database operations"],
  },

  // Mem0 API Configuration
  MEM0_API_KEY: {
    description: "API key for the Mem0 service",
    required: true,
    example: "mem0_api_key_12345",
    usedIn: ["Memory management", "AI features"],
  },
  MEM0_API_URL: {
    description: "URL for the Mem0 API service",
    required: true,
    example: "https://api.mem0.ai",
    usedIn: ["Memory management", "AI features"],
  },

  // File Operations Configuration
  NEXT_PUBLIC_ENABLE_FILE_OPERATIONS: {
    description: "Flag to enable file operations",
    required: false,
    example: "true",
    usedIn: ["File management features"],
    defaultValue: "false",
  },
  NEXT_PUBLIC_MAX_UPLOAD_SIZE: {
    description: "Maximum file upload size in bytes",
    required: false,
    example: "10485760", // 10MB
    usedIn: ["File upload functionality"],
    defaultValue: "5242880", // 5MB
  },

  // FTP Configuration (if enabled)
  FTP_HOST: {
    description: "FTP server hostname",
    required: false,
    example: "ftp.example.com",
    usedIn: ["FTP file operations"],
    requiredIf: "NEXT_PUBLIC_ENABLE_FILE_OPERATIONS=true",
  },
  FTP_USER: {
    description: "FTP username",
    required: false,
    example: "username",
    usedIn: ["FTP file operations"],
    requiredIf: "NEXT_PUBLIC_ENABLE_FILE_OPERATIONS=true",
  },
  FTP_PASSWORD: {
    description: "FTP password",
    required: false,
    example: "password",
    usedIn: ["FTP file operations"],
    requiredIf: "NEXT_PUBLIC_ENABLE_FILE_OPERATIONS=true",
    sensitive: true,
  },
  FTP_PORT: {
    description: "FTP server port",
    required: false,
    example: "21",
    usedIn: ["FTP file operations"],
    defaultValue: "21",
  },
  FTP_ROOT_DIR: {
    description: "FTP root directory",
    required: false,
    example: "/public_html",
    usedIn: ["FTP file operations"],
    defaultValue: "/",
  },

  // Application Configuration
  NEXT_PUBLIC_APP_NAME: {
    description: "Application name",
    required: false,
    example: "File Manager",
    usedIn: ["UI elements", "Metadata"],
    defaultValue: "File Manager",
  },
  NEXT_PUBLIC_APP_URL: {
    description: "Application URL",
    required: false,
    example: "https://filemanager.example.com",
    usedIn: ["Authentication callbacks", "Sharing features"],
  },

  // Demo Mode Configuration
  NEXT_PUBLIC_ENABLE_DEMO_MODE: {
    description: "Flag to enable demo mode",
    required: false,
    example: "true",
    usedIn: ["Demo features"],
    defaultValue: "false",
  },
}

// Types for validation results
export interface ValidationResult {
  isValid: boolean
  missingVars: MissingEnvVar[]
  warnings: EnvVarWarning[]
}

export interface MissingEnvVar {
  name: string
  description: string
  example: string
  usedIn: string[]
  hasFallback: boolean
}

export interface EnvVarWarning {
  name: string
  message: string
  severity: "low" | "medium" | "high"
}

/**
 * Validates all required environment variables
 * @param strict If true, treats warnings as errors
 * @returns Validation result with details about missing variables and warnings
 */
export function validateEnvironmentVariables(strict = false): ValidationResult {
  const missingVars: MissingEnvVar[] = []
  const warnings: EnvVarWarning[] = []

  // Check each required environment variable
  Object.entries(requiredEnvVars).forEach(([name, config]) => {
    const value = process.env[name]
    const hasFallback = !!config.fallback && !!process.env[config.fallback]

    // Check if variable is required and missing
    if (config.required && !value && !hasFallback) {
      missingVars.push({
        name,
        description: config.description,
        example: config.example,
        usedIn: config.usedIn,
        hasFallback: !!config.fallback,
      })
    }

    // Check conditional requirements
    if (config.requiredIf) {
      const [condVarName, condVarValue] = config.requiredIf.split("=")
      if (process.env[condVarName] === condVarValue && !value) {
        warnings.push({
          name,
          message: `${name} is required when ${condVarName}=${condVarValue}`,
          severity: "high",
        })
      }
    }

    // Add warnings for sensitive variables that might be exposed
    if (config.sensitive && name.startsWith("NEXT_PUBLIC_")) {
      warnings.push({
        name,
        message: `${name} contains sensitive information but is exposed to the client`,
        severity: "high",
      })
    }
  })

  return {
    isValid: strict ? missingVars.length === 0 && warnings.length === 0 : missingVars.length === 0,
    missingVars,
    warnings,
  }
}

/**
 * Generates a formatted error message for missing environment variables
 * @param validationResult The result from validateEnvironmentVariables
 * @returns A formatted error message with instructions
 */
export function generateEnvErrorMessage(validationResult: ValidationResult): string {
  if (validationResult.isValid) {
    return ""
  }

  let message = "🚨 Environment Variable Configuration Issues:\n\n"

  // Add missing variables to the message
  if (validationResult.missingVars.length > 0) {
    message += "❌ Missing Required Environment Variables:\n"
    validationResult.missingVars.forEach((variable) => {
      message += `\n- ${variable.name}:\n`
      message += `  Description: ${variable.description}\n`
      message += `  Example: ${variable.example}\n`
      message += `  Used in: ${variable.usedIn.join(", ")}\n`

      if (variable.hasFallback) {
        const fallback = requiredEnvVars[variable.name].fallback
        message += `  Fallback: Can use ${fallback} instead\n`
      }
    })
  }

  // Add warnings to the message
  if (validationResult.warnings.length > 0) {
    message += "\n⚠️ Warnings:\n"
    validationResult.warnings.forEach((warning) => {
      const severityIcon = warning.severity === "high" ? "🔴" : warning.severity === "medium" ? "🟠" : "🟡"
      message += `\n- ${severityIcon} ${warning.name}: ${warning.message}\n`
    })
  }

  // Add instructions for fixing
  message += "\n📝 To fix these issues:\n"
  message += "1. Create or update your .env.local file with the missing variables\n"
  message += "2. Restart your development server\n"
  message += "3. If using production, update your environment variables in your hosting platform\n"

  return message
}

/**
 * Validates environment variables and throws an error if validation fails
 * @param strict If true, treats warnings as errors
 * @throws Error with detailed message if validation fails
 */
export function validateEnvOrThrow(strict = false): void {
  const validationResult = validateEnvironmentVariables(strict)

  if (!validationResult.isValid) {
    const errorMessage = generateEnvErrorMessage(validationResult)
    throw new Error(errorMessage)
  }
}

/**
 * Gets a specific environment variable with fallback support
 * @param name The name of the environment variable
 * @param defaultValue Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  const config = requiredEnvVars[name]
  const value = process.env[name]

  if (value) {
    return value
  }

  if (config?.fallback) {
    return process.env[config.fallback]
  }

  if (config?.defaultValue) {
    return config.defaultValue
  }

  return defaultValue
}
