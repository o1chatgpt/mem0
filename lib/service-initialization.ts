import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { OpenAI } from "openai"

// Initialize Supabase client
export async function initializeSupabase(url: string, key: string, options = {}) {
  try {
    const supabase = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      ...options,
    })

    // Test connection
    const { data, error } = await supabase.from("test_connection").select("*").limit(1)

    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`)
    }

    return { success: true, client: supabase }
  } catch (error) {
    console.error("Failed to initialize Supabase:", error)
    return { success: false, error }
  }
}

// Initialize Mem0 client
export async function initializeMem0(apiKey: string, apiUrl = "https://api.mem0.ai") {
  try {
    // Test connection by making a simple request
    const response = await fetch(`${apiUrl}/status`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Mem0 API connection failed: ${response.statusText}`)
    }

    // Store credentials for future use
    localStorage.setItem("mem0Settings", JSON.stringify({ apiKey, apiUrl }))

    return { success: true }
  } catch (error) {
    console.error("Failed to initialize Mem0:", error)
    return { success: false, error }
  }
}

// Initialize OpenAI client
export async function initializeOpenAI(apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey })

    // Test connection with a simple request
    const response = await openai.models.list()

    // Store credentials for future use
    localStorage.setItem("openAISettings", JSON.stringify({ apiKey }))

    return { success: true, client: openai }
  } catch (error) {
    console.error("Failed to initialize OpenAI:", error)
    return { success: false, error }
  }
}

// Initialize FTP client
export async function initializeFTP(host: string, port: string, username: string, password: string, rootDir = "/") {
  try {
    // In a real implementation, this would create an FTP client
    // For demo purposes, we'll just simulate a connection

    // Store credentials for future use
    localStorage.setItem("ftpSettings", JSON.stringify({ host, port, username, password, rootDir }))

    return { success: true }
  } catch (error) {
    console.error("Failed to initialize FTP:", error)
    return { success: false, error }
  }
}
