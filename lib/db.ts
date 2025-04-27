// This is a placeholder file to satisfy imports
// All database operations are now handled in-memory in auth-context.tsx

// Mock SQL function that returns an empty array
export const sql = (...args: any[]) => {
  console.log("Mock SQL called with:", args)
  return Promise.resolve([])
}

// Mock database functions
export async function getUserByEmail(email: string) {
  console.log("Mock getUserByEmail called with:", email)
  return null
}

export async function getUserById(id: string) {
  console.log("Mock getUserById called with:", id)
  return null
}

export async function createUser(data: any) {
  console.log("Mock createUser called with:", data)
  return { id: "mock-id", ...data }
}

export async function updateUser(id: string, data: any) {
  console.log("Mock updateUser called with:", id, data)
  return null
}

export async function getAllUsers() {
  console.log("Mock getAllUsers called")
  return []
}

export async function createApiKey(data: any) {
  console.log("Mock createApiKey called with:", data)
  return { id: "mock-key-id", ...data }
}

export const createApiKeyInDb = async (data: any) => {
  console.log("Mock createApiKeyInDb called with:", data)
  return { id: "mock-key-id", ...data }
}

export async function validateApiKey(key: string) {
  console.log("Mock validateApiKey called with:", key)
  return { valid: false }
}

export async function getUserApiKeys(userId: string) {
  console.log("Mock getUserApiKeys called with:", userId)
  return []
}

export const getUserApiKeysFromDb = async (userId: string) => {
  console.log("Mock getUserApiKeysFromDb called with:", userId)
  return []
}

export async function deleteApiKeyInDb(id: string, userId: string) {
  console.log("Mock deleteApiKeyInDb called with:", id, userId)
  return true
}

export async function getApiKeyById(id: string) {
  console.log("Mock getApiKeyById called with:", id)
  return null
}

export async function updateApiKeyInDb(id: string, data: any) {
  console.log("Mock updateApiKeyInDb called with:", id, data)
  return { id, ...data }
}

export async function hasApiKeyPermission(key: string, permission: string) {
  console.log("Mock hasApiKeyPermission called with:", key, permission)
  return false
}
