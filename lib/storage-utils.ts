/**
 * Safely get an item from localStorage with error handling
 * @param key The localStorage key
 * @param defaultValue Default value if key doesn't exist or there's an error
 * @returns The stored value or default value
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue

    // Try to parse as JSON first
    try {
      return JSON.parse(item)
    } catch {
      // If not valid JSON, return as is
      return item as unknown as T
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return defaultValue
  }
}

/**
 * Safely set an item in localStorage with error handling
 * @param key The localStorage key
 * @param value The value to store
 * @returns Boolean indicating success
 */
export function setStorageItem(key: string, value: any): boolean {
  try {
    const valueToStore = typeof value === "object" ? JSON.stringify(value) : String(value)
    localStorage.setItem(key, valueToStore)
    return true
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

/**
 * Check if localStorage is available in the current environment
 * @returns Boolean indicating if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}
