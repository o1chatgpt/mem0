"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type AdminContextType = {
  isAdmin: boolean
  setAdmin: (value: boolean) => void
  toggleAdmin: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  // Use localStorage to persist admin state (only on client)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check localStorage on mount
    const storedAdminState = localStorage.getItem("isAdmin")
    if (storedAdminState === "true") {
      setIsAdmin(true)
    }
  }, [])

  const setAdmin = (value: boolean) => {
    setIsAdmin(value)
    localStorage.setItem("isAdmin", value.toString())
  }

  const toggleAdmin = () => {
    const newValue = !isAdmin
    setIsAdmin(newValue)
    localStorage.setItem("isAdmin", newValue.toString())
  }

  return <AdminContext.Provider value={{ isAdmin, setAdmin, toggleAdmin }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
