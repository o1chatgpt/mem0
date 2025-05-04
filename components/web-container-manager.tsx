"use client"

import { useEffect } from "react"

interface WebContainerManagerProps {
  onReady: (container: any) => void
  onTerminalOutput?: (output: string) => void
}

export function WebContainerManager({ onReady, onTerminalOutput }: WebContainerManagerProps) {
  useEffect(() => {
    const terminalOutput = ""

    // Create a simple simulated container
    const simulatedContainer = {
      isSimulated: true,
      authStatus: "simulation",

      async loadFiles(files: { [key: string]: string }) {
        console.log("Simulated loadFiles:", files)
        return true
      },

      async run(command = "node index.js") {
        const output = `$ ${command}\nSimulated output for ${command}\n`
        if (onTerminalOutput) {
          onTerminalOutput(output)
        }
        return "Command simulated"
      },

      async sendCommand(command: string) {
        const output = `$ ${command}\nSimulated output for ${command}\n`
        if (onTerminalOutput) {
          onTerminalOutput(output)
        }
      },

      clearTerminal() {
        if (onTerminalOutput) {
          onTerminalOutput("Terminal cleared\n$ ")
        }
      },

      async readFile(path: string) {
        return `Content of ${path}`
      },

      async writeFile(path: string, content: string) {
        console.log(`Writing to ${path}:`, content)
        return true
      },

      async listDirectory(path: string) {
        return [
          { name: "index.js", type: "file", path: `${path}/index.js` },
          { name: "package.json", type: "file", path: `${path}/package.json` },
          { name: "src", type: "directory", path: `${path}/src` },
        ]
      },
    }

    // Notify that the simulated container is ready
    setTimeout(() => {
      onReady(simulatedContainer)

      // Send initial terminal output
      if (onTerminalOutput) {
        onTerminalOutput("WebContainer simulation initialized.\n$ ")
      }
    }, 500)

    // No cleanup needed for this simplified version
    return () => {}
  }, [onReady, onTerminalOutput])

  return null
}
