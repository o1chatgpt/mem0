"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Initialize accent color from localStorage when component mounts
  React.useEffect(() => {
    const savedAccentColor = localStorage.getItem("accentColor") || "blue"

    // Map of color names to HSL values
    const accentColors = {
      blue: "221.2 83.2% 53.3%",
      purple: "269.1 79.6% 55.7%",
      green: "142.1 76.2% 36.3%",
      orange: "24.6 95% 53.1%",
      pink: "331.3 74.5% 47.8%",
      teal: "174.7 83.9% 31.6%",
      red: "0 84.2% 60.2%",
      amber: "37.7 92.1% 50.2%",
    }

    // Apply the saved accent color
    const hslValue = accentColors[savedAccentColor as keyof typeof accentColors]
    if (hslValue) {
      document.documentElement.style.setProperty("--primary", hslValue)
      document.documentElement.style.setProperty("--ring", hslValue)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
