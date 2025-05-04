"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

// Import prettier and language parsers
import prettier from "prettier/standalone"
import htmlParser from "prettier/parser-html"
import cssParser from "prettier/parser-postcss"
import markdownParser from "prettier/parser-markdown"
import babelParser from "prettier/parser-babel"

interface CodeFormatterProps {
  code: string
  language: "markdown" | "html" | "css" | "javascript"
  onFormat: (formattedCode: string) => void
  disabled?: boolean
}

export function CodeFormatter({ code, language, onFormat, disabled = false }: CodeFormatterProps) {
  const [isFormatting, setIsFormatting] = useState(false)
  const { toast } = useToast()

  const formatCode = async () => {
    if (disabled || !code.trim()) return

    setIsFormatting(true)

    try {
      // Determine parser based on language
      let parser: string
      let plugins = []

      switch (language) {
        case "html":
          parser = "html"
          plugins = [htmlParser]
          break
        case "css":
          parser = "css"
          plugins = [cssParser]
          break
        case "markdown":
          parser = "markdown"
          plugins = [markdownParser]
          break
        case "javascript":
          parser = "babel"
          plugins = [babelParser]
          break
        default:
          parser = "babel"
          plugins = [babelParser]
      }

      // Format the code
      const formattedCode = await prettier.format(code, {
        parser,
        plugins,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: "es5",
        bracketSpacing: true,
        arrowParens: "always",
      })

      // Apply the formatted code
      onFormat(formattedCode)

      toast({
        title: "Code formatted",
        description: "Your code has been formatted successfully.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Formatting error:", error)
      toast({
        title: "Formatting failed",
        description: error instanceof Error ? error.message : "An error occurred while formatting the code.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsFormatting(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={formatCode}
            disabled={disabled || isFormatting || !code.trim()}
            className={isFormatting ? "opacity-70" : ""}
          >
            <Wand2 className={`h-4 w-4 ${isFormatting ? "animate-pulse" : "mr-1"}`} />
            {!isFormatting && "Format"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Format code using Prettier</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
