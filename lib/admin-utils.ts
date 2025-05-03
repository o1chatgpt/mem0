/**
 * Utility functions for admin-related operations
 */

/**
 * Validates an admin password by calling the secure server endpoint
 * @param password The password to validate
 * @returns A promise that resolves to true if the password is valid, false otherwise
 */
export async function validateAdminPassword(password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/admin-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      console.error("Admin validation failed:", response.statusText)
      return false
    }

    const data = await response.json()
    return data.valid === true
  } catch (error) {
    console.error("Error validating admin password:", error)
    return false
  }
}
