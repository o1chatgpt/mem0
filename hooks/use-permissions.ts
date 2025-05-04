"use client"

import { useCallback, useEffect, useState } from "react"
import type { Permission, RoleName } from "@/lib/permissions"

interface UsePermissionsProps {
  initialRoles?: RoleName[]
}

export function usePermissions({ initialRoles = [] }: UsePermissionsProps = {}) {
  const [roles, setRoles] = useState<RoleName[]>(initialRoles)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user roles from the server
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/auth/roles")

        if (!response.ok) {
          throw new Error("Failed to fetch user roles")
        }

        const data = await response.json()
        setRoles(data.roles || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        console.error("Error fetching user roles:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  // Check if user has a specific permission
  const hasPermission = useCallback(async (permission: Permission): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/check-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.hasPermission === true
    } catch (err) {
      console.error("Error checking permission:", err)
      return false
    }
  }, [])

  return {
    roles,
    loading,
    error,
    hasPermission,
  }
}
