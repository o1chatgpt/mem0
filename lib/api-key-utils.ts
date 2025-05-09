import { createServerClient } from "@/lib/db"

/**
 * Checks if a valid OpenAI API key is configured
 * Tries environment variable first, then database
 */
export async function hasValidOpenAIKey(): Promise<boolean> {
  // Try environment variable first
  const envKey = process.env.OPENAI_API_KEY
  if (envKey && (await isValidOpenAIKey(envKey))) {
    return true
  }

  // Check if Supabase environment variables are available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables are not set. Skipping database check for API key.")
    return false
  }

  // If environment variable is invalid, try to get a key from the database
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from("api_keys")
      .select("key")
      .eq("service", "openai")
      .eq("is_active", true)
      .limit(1)

    if (data && data.length > 0) {
      const dbKey = data[0].key
      return await isValidOpenAIKey(dbKey)
    }
  } catch (error) {
    console.error("Error fetching API key from database:", error)
  }

  return false
}

/**
 * Validates an OpenAI API key by making a test request
 */
async function isValidOpenAIKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false

  try {
    // Make a minimal API call to validate the key
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.status === 200
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return false
  }
}

/**
 * Creates the api_keys table if it doesn't exist
 */
export async function ensureApiKeysTable(): Promise<boolean> {
  // Check if Supabase environment variables are available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables are not set. Cannot ensure api_keys table.")
    return false
  }

  try {
    const supabase = createServerClient()

    // Check if api_keys table exists
    try {
      await supabase.from("api_keys").select("*", { count: "exact", head: true })
      return true
    } catch (error) {
      console.log("Creating api_keys table...")

      // Create the table
      const { error: createError } = await supabase.rpc("create_table", {
        table_name: "api_keys",
        table_definition: `
          id SERIAL PRIMARY KEY,
          service VARCHAR(255) NOT NULL,
          key TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE
        `,
      })

      if (createError) {
        console.error("Error creating api_keys table:", createError)
        return false
      }

      return true
    }
  } catch (error) {
    console.error("Error ensuring api_keys table:", error)
    return false
  }
}

/**
 * Gets a valid OpenAI API key
 */
export async function getOpenAIApiKey(): Promise<string | null> {
  // Try environment variable first
  const envKey = process.env.OPENAI_API_KEY
  if (envKey && (await isValidOpenAIKey(envKey))) {
    return envKey
  }

  // If environment variable is invalid, try to get a key from the database
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from("api_keys")
      .select("key")
      .eq("service", "openai")
      .eq("is_active", true)
      .limit(1)

    if (data && data.length > 0) {
      const dbKey = data[0].key
      if (await isValidOpenAIKey(dbKey)) {
        return dbKey
      }
    }
  } catch (error) {
    console.error("Error fetching API key from database:", error)
  }

  return null
}
