"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Error fetching user:", error)
      }

      setUser(data.user)
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  return { user, isLoading }
}
