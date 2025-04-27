"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ArrowUp, ArrowDown, TerminalIcon, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface TerminalProps {
  isReady: boolean
  onSendCommand: (command: string) => Promise<void>
  output: string
  onClearTerminal: () => void
  isSimulated?: boolean
}

export function Terminal({ isReady, onSendCommand, output, onClearTerminal, isSimulated = false }: TerminalProps) {
  const { user } = useAuth()
  const [command, setCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [output])

  // Focus input when terminal is clicked
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSendCommand = async () => {
    if (!command.trim() || !isReady || isProcessing) return

    setIsProcessing(true)

    try {
      // Add command to history
      setCommandHistory((prev) => [...prev, command])
      setHistoryIndex(-1)

      // Clear input
      setCommand("")

      // Send command to WebContainer
      await onSendCommand(command)
    } catch (error) {
      console.error("Error executing command:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendCommand()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      navigateHistory(-1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      navigateHistory(1)
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      onClearTerminal()
    }
  }

  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return

    const newIndex = historyIndex + direction

    if (newIndex >= -1 && newIndex < commandHistory.length) {
      setHistoryIndex(newIndex)

      if (newIndex === -1) {
        setCommand("")
      } else {
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    }
  }

  return (
    <div
      className="flex flex-col h-full night-terminal rounded-md overflow-hidden border relative"
      onClick={focusInput}
    >
      <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-800">
        <div className="text-sm flex items-center">
          <TerminalIcon className="h-3 w-3 mr-1" />
          <span>Terminal</span>
          {isProcessing && <span className="ml-2 text-xs text-yellow-400">Processing...</span>}
          {isSimulated && (
            <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-sm flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Simulation Mode
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => navigateHistory(-1)}
            disabled={commandHistory.length === 0}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => navigateHistory(1)}
            disabled={historyIndex <= 0}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={onClearTerminal}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-auto bg-transparent night-scrollbar resizable-vertical" ref={scrollAreaRef}>
        <pre className="whitespace-pre-wrap break-all">{output}</pre>
        <div className="resizable-handle"></div>
      </div>

      <div className="flex items-center p-2 border-t border-gray-800 bg-transparent">
        <span className={`mr-2 ${isSimulated ? "text-yellow-400" : "text-green-400"}`}>
          {isSimulated ? "[sim]$" : "$"}
        </span>
        <Input
          ref={inputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-600"
          placeholder={
            isReady
              ? isSimulated
                ? "Enter command (simulation mode)..."
                : "Enter command..."
              : "Terminal not ready..."
          }
          disabled={!isReady || isProcessing}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  )
}
