import { supabase } from "./supabase"

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Try a simple query to check if the database is accessible
    const { data, error } = await supabase
      .from("_dummy_query")
      .select("*")
      .limit(1)
      .catch(() => ({
        data: null,
        error: new Error("Database connection failed"),
      }))

    // If there's no error, the database is accessible
    if (!error) {
      return true
    }

    // If the error is about the relation not existing, the database is accessible
    // but the table doesn't exist (which is fine for this check)
    if (
      error.message.includes(`relation "_dummy_query" does not exist`) ||
      error.message.includes(`relation "public._dummy_query" does not exist`)
    ) {
      return true
    }

    console.error("Database connection check failed:", error)
    return false
  } catch (error) {
    console.error("Error checking database connection:", error)
    return false
  }
}
