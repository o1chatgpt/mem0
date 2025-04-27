import {
  validateApiKey,
  createApiKeyInDb,
  deleteApiKeyInDb,
  getUserApiKeysFromDb,
  hasApiKeyPermission,
  getApiKeyById as getApiKeyByIdFromDb,
  updateApiKeyInDb,
} from "./db"

// Generate a random API key
export function generateApiKey(): string {
  return "wc_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Create a new API key
export async function createApiKey(name: string, permissions: string[], ownerId: string) {
  try {
    const apiKey = generateApiKey()

    const newKey = await createApiKeyInDb({
      name,
      apiKey,
      permissions,
      ownerId,
    })

    if (!newKey) {
      throw new Error("Failed to create API key")
    }

    return {
      id: newKey.id,
      name: newKey.name,
      key: newKey.api_key,
      permissions: newKey.permissions,
      ownerId: newKey.owner_id,
      createdAt: newKey.created_at,
      fullKey: apiKey, // This is only returned once
    }
  } catch (error) {
    console.error("Error creating API key:", error)
    throw new Error("Failed to create API key")
  }
}

// Validate an API key
export async function validateKey(key: string) {
  return validateApiKey(key)
}

// Get all API keys for a user
export async function getUserApiKeys(userId: string) {
  return getUserApiKeysFromDb(userId)
}

// Delete an API key
export async function deleteApiKey(id: string, userId: string) {
  return deleteApiKeyInDb(id, userId)
}

// Check if a key has a specific permission
export async function hasPermission(key: string, permission: string) {
  return hasApiKeyPermission(key, permission)
}

// Get API key by ID
export async function getApiKeyById(id: string) {
  return getApiKeyByIdFromDb(id)
}

// Update an API key
export async function updateApiKey(
  id: string,
  data: Partial<{
    name: string
    permissions: string[]
    active: boolean
  }>,
) {
  return updateApiKeyInDb(id, data)
}
