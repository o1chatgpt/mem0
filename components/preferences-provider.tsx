"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getMemoriesFromMem0 } from "@/lib/mem0-integration"

interface Preferences {
  darkMode: boolean
  compactView: boolean
  showHiddenFiles: boolean
  language: string
  defaultView: string
  fontSize: number
  [key: string]: any
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreference: (key: string, value: any) => void
  resetPreferences: () => void
  isLoading: boolean
}

const defaultPreferences: Preferences = {
  darkMode: false,
  compactView: false,
  showHiddenFiles: false,
  language: "en",
  defaultView: "grid",
  fontSize: 16,
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from localStorage and Mem0 on mount
  useEffect(() => {
    // Update the loadPreferences function to be more resilient to Mem0 API failures
    const loadPreferences = async () => {
      setIsLoading(true)
      try {
        // First try to load from localStorage - this is our primary source of truth
        const storedPrefs = localStorage.getItem("userPreferences")
        const loadedPrefs = storedPrefs ? JSON.parse(storedPrefs) : { ...defaultPreferences }

        // Set preferences immediately from localStorage to avoid UI blocking
        setPreferences(loadedPrefs)

        // Complete loading immediately to unblock UI
        setIsLoading(false)

        // Then try to load from Mem0 in a non-blocking way
        try {
          console.log("Attempting to load preferences from Mem0...")

          // Use the updated function that handles API calls on the server
          const memories = await getMemoriesFromMem0("default_user", "file_manager", 50)

          if (memories && Array.isArray(memories) && memories.length > 0) {
            console.log(`Found ${memories.length} memories, looking for preferences...`)

            // Create a new preferences object to collect changes
            const memoryPrefs = { ...loadedPrefs }
            let hasChanges = false

            // Filter for preference memories
            const preferenceMemories = memories.filter(
              (m) => m && m.memory && typeof m.memory === "string" && m.memory.startsWith("User preference:"),
            )

            console.log(`Found ${preferenceMemories.length} preference memories`)

            // Parse preferences from memories
            preferenceMemories.forEach((memory) => {
              try {
                const match = memory.memory.match(/User preference: (\w+) set to (.+)/)
                if (match && match.length === 3) {
                  const [, key, valueStr] = match

                  // Parse the value based on its type
                  let value
                  if (valueStr === "true") value = true
                  else if (valueStr === "false") value = false
                  else if (!isNaN(Number(valueStr))) value = Number(valueStr)
                  else value = valueStr

                  // Update the preference
                  console.log(`Setting preference from memory: ${key}=${value}`)
                  memoryPrefs[key] = value
                  hasChanges = true
                }
              } catch (parseError) {
                console.error("Error parsing memory:", parseError, memory)
              }
            })

            // Only update preferences if we found changes
            if (hasChanges) {
              setPreferences(memoryPrefs)
              localStorage.setItem("userPreferences", JSON.stringify(memoryPrefs))
            }
          } else {
            console.log("No memories found in Mem0, using localStorage preferences only")
          }
        } catch (memoryError) {
          console.error("Error loading preferences from Mem0:", memoryError)
          console.log("Continuing with localStorage preferences only")
          // No need to do anything else - we already set preferences from localStorage
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
        // Fall back to default preferences
        setPreferences(defaultPreferences)
        // Make sure to unblock UI even if there's an error
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Update a single preference
  const updatePreference = async (key: string, value: any) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value }
      // Save to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(updated))
      return updated
    })

    // Try to store in Mem0, but don't block the UI
    try {
      const { trackUserPreference } = await import("@/lib/mem0-integration")
      // Convert value to string for storage
      const valueStr = typeof value === "object" ? JSON.stringify(value) : String(value)

      // Don't await - fire and forget to avoid blocking
      trackUserPreference("default_user", key, valueStr).catch((error) => {
        console.error(`Failed to store preference in Mem0: ${key}=${valueStr}`, error)
      })
    } catch (error) {
      console.error("Error importing trackUserPreference:", error)
    }
  }

  // Reset preferences to defaults
  const resetPreferences = () => {
    setPreferences(defaultPreferences)
    localStorage.setItem("userPreferences", JSON.stringify(defaultPreferences))
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
