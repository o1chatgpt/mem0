"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
  currentDemoRole: string | null
  setDemoRole: (role: string | null) => void
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  toggleDemoMode: () => {},
  currentDemoRole: null,
  setDemoRole: () => {},
})

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [currentDemoRole, setCurrentDemoRole] = useState<string | null>(null)

  // Initialize from localStorage and environment variable
  useEffect(() => {
    const storedDemoMode = localStorage.getItem("demo-mode")
    const enableDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true"

    if (storedDemoMode === "true" && enableDemoMode) {
      setIsDemoMode(true)
      const storedRole = localStorage.getItem("demo-role")
      if (storedRole) {
        setCurrentDemoRole(storedRole)
      }
    }
  }, [])

  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode
    setIsDemoMode(newDemoMode)
    localStorage.setItem("demo-mode", newDemoMode.toString())

    if (!newDemoMode) {
      setCurrentDemoRole(null)
      localStorage.removeItem("demo-role")
    }
  }

  const setDemoRole = (role: string | null) => {
    setCurrentDemoRole(role)
    if (role) {
      localStorage.setItem("demo-role", role)
    } else {
      localStorage.removeItem("demo-role")
    }
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, currentDemoRole, setDemoRole }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export const useDemoMode = () => useContext(DemoModeContext)
