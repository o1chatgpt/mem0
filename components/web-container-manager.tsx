"use client"

import { useEffect, useState } from "react"

interface WebContainerManagerProps {
  onReady: (container: any) => void
  onTerminalOutput?: (output: string) => void
}

export function WebContainerManager({ onReady, onTerminalOutput }: WebContainerManagerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let shellInstance: any = null
    let terminalOutput = "Welcome to WebContainer Terminal - Night Mode\n\n"

    const loadWebContainer = async () => {
      try {
        // Debugging information
        console.log("Cross-Origin Isolation Status:", window.crossOriginIsolated)
        console.log(
          "Headers check:",
          document.querySelector('meta[http-equiv="Cross-Origin-Opener-Policy"]')?.getAttribute("content"),
        )

        // Check if the headers are correctly set
        fetch(window.location.href)
          .then((response) => {
            console.log("COOP Header:", response.headers.get("cross-origin-opener-policy"))
            console.log("COEP Header:", response.headers.get("cross-origin-embedder-policy"))
          })
          .catch((err) => console.error("Error checking headers:", err))

        // First, check if cross-origin isolation is enabled
        if (typeof window !== "undefined" && !(window as any).crossOriginIsolated) {
          console.warn("Cross-origin isolation is not enabled. Falling back to simulation mode.")

          // Create a simulated container manager
          const simulatedContainerManager = createSimulatedContainerManager(
            `WebContainer requires cross-origin isolation which is not enabled in this environment.
Running in simulation mode with limited functionality.

For full functionality, the server needs these headers:
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Embedder-Policy: require-corp

Welcome to Night Mode Terminal

$ `,
          )

          // Notify that the simulated container is ready
          if (isMounted) {
            onReady(simulatedContainerManager)
            setIsLoading(false)
          }
          return
        }

        // Try to load WebContainer API and auth
        const { WebContainer, auth } = await import("@webcontainer/api")

        // Initialize authentication
        try {
          await auth.init({
            clientId: "wc_api_o1chatgpt_f442ff6edc4f068a86c4f54db15f3277",
            scope: "",
          })
          console.log("WebContainer auth initialized successfully")
        } catch (authError) {
          console.error("Error initializing WebContainer auth:", authError)
          // If auth fails, we'll still try to boot the WebContainer
          // It might work in some environments without auth
        }

        // Boot the WebContainer
        const webcontainerInstance = await WebContainer.boot()

        if (isMounted) {
          // Start a shell for the terminal
          shellInstance = await webcontainerInstance.spawn("sh", {
            terminal: {
              cols: 80,
              rows: 24,
            },
          })

          // Listen for output events from the shell
          shellInstance.output.pipeTo(
            new WritableStream({
              write(data) {
                terminalOutput += data
                if (onTerminalOutput && isMounted) {
                  onTerminalOutput(terminalOutput)
                }
              },
            }),
          )

          // Create a container manager object with methods to interact with the WebContainer
          const containerManager = {
            instance: webcontainerInstance,
            shell: shellInstance,
            isSimulated: false,
            authStatus: "success", // Add this line to indicate successful authentication

            // Method to load files into the WebContainer
            async loadFiles(files: { [key: string]: string }) {
              const fileEntries: any = {}

              // Convert string content to file entries
              Object.entries(files).forEach(([path, content]) => {
                // Create directory structure if needed
                const pathParts = path.split("/")
                let currentPath = ""
                let currentObj = fileEntries

                // Create nested directory structure
                for (let i = 0; i < pathParts.length - 1; i++) {
                  const part = pathParts[i]
                  if (!part) continue // Skip empty parts (e.g., leading slash)

                  currentPath = currentPath ? `${currentPath}/${part}` : part

                  if (!currentObj[part]) {
                    currentObj[part] = { directory: {} }
                  }

                  currentObj = currentObj[part].directory
                }

                // Add the file at the final path
                const fileName = pathParts[pathParts.length - 1]
                if (currentObj) {
                  currentObj[fileName] = {
                    file: {
                      contents: content,
                    },
                  }
                }
              })

              // Write files to the WebContainer
              await webcontainerInstance.mount(fileEntries)
              return true
            },

            // Method to run commands in the WebContainer
            async run(command = "node index.js") {
              try {
                // Add command to terminal output
                terminalOutput += `$ ${command}\n`
                if (onTerminalOutput) {
                  onTerminalOutput(terminalOutput)
                }

                // Send command to shell
                await shellInstance.input.write(`${command}\n`)

                // Return success
                return "Command sent to WebContainer"
              } catch (error) {
                console.error("Error running command:", error)
                return `Error: ${error instanceof Error ? error.message : String(error)}`
              }
            },

            // Method to send a command to the terminal
            async sendCommand(command: string) {
              try {
                // Add command to terminal output
                terminalOutput += `$ ${command}\n`
                if (onTerminalOutput) {
                  onTerminalOutput(terminalOutput)
                }

                // Send command to shell
                await shellInstance.input.write(`${command}\n`)
              } catch (error) {
                console.error("Error sending command:", error)
                terminalOutput += `Error: ${error instanceof Error ? error.message : String(error)}\n`
                if (onTerminalOutput) {
                  onTerminalOutput(terminalOutput)
                }
              }
            },

            // Method to clear the terminal
            clearTerminal() {
              terminalOutput = ""
              if (onTerminalOutput) {
                onTerminalOutput(terminalOutput)
              }
            },

            // Method to get the file system structure
            async getFileSystem() {
              try {
                const files = await webcontainerInstance.fs.readdir("/", { withFileTypes: true })
                return files.map((file) => ({
                  name: file.name,
                  type: file.isDirectory() ? "directory" : "file",
                }))
              } catch (error) {
                console.error("Error reading file system:", error)
                return []
              }
            },

            // Method to read file content
            async readFile(path: string) {
              try {
                const content = await webcontainerInstance.fs.readFile(path, "utf-8")
                return content
              } catch (error) {
                console.error(`Error reading file ${path}:`, error)
                return null
              }
            },

            // Method to write file content
            async writeFile(path: string, content: string) {
              try {
                await webcontainerInstance.fs.writeFile(path, content)
                return true
              } catch (error) {
                console.error(`Error writing file ${path}:`, error)
                return false
              }
            },

            // Method to list directory contents
            async listDirectory(path: string) {
              try {
                const entries = await webcontainerInstance.fs.readdir(path, { withFileTypes: true })
                return entries.map((entry) => ({
                  name: entry.name,
                  type: entry.isDirectory() ? "directory" : "file",
                  path: path === "/" ? `/${entry.name}` : `${path}/${entry.name}`,
                }))
              } catch (error) {
                console.error(`Error listing directory ${path}:`, error)
                return []
              }
            },
          }

          // Initialize the container with some basic files
          await containerManager.loadFiles({
            "index.js": "console.log('Hello from WebContainer!');\n",
            "package.json": JSON.stringify(
              {
                name: "webcontainer-project",
                version: "1.0.0",
                description: "Project running in WebContainer",
                main: "index.js",
              },
              null,
              2,
            ),
            "README.md":
              "# WebContainer Project\n\nThis is a project running in WebContainer. You can edit this README file to add more information about your project.\n\n## Features\n\n- Edit files directly in the browser\n- Run commands in the terminal\n- Preview Markdown files\n- Navigate the file system\n\n## Getting Started\n\nEdit the files in the editor and run your code using the terminal.",
          })

          // Send initial commands to set up the environment
          await shellInstance.input.write("ls -la\n")

          // Notify that the container is ready
          onReady(containerManager)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error initializing WebContainer:", err)

        if (isMounted) {
          setError((err as Error).message)

          // Create a simulated container manager as fallback
          const simulatedContainerManager = createSimulatedContainerManager(
            `Error initializing WebContainer: ${(err as Error).message}\nFalling back to simulation mode.\n\n$ `,
          )

          // Notify that the simulated container is ready
          onReady(simulatedContainerManager)
          setIsLoading(false)
        }
      }
    }

    // Create a simulated container manager for fallback
    const createSimulatedContainerManager = (initialOutput: string) => {
      terminalOutput = initialOutput
      if (onTerminalOutput) {
        onTerminalOutput(terminalOutput)
      }

      // In-memory file system for simulation
      const simulatedFS: Record<string, string> = {
        "index.js": "console.log('Hello from WebContainer!');",
        "package.json": JSON.stringify(
          {
            name: "webcontainer-project",
            version: "1.0.0",
            description: "Project running in WebContainer",
            main: "index.js",
          },
          null,
          2,
        ),
        "README.md": "# WebContainer Project\n\nThis is a simulated WebContainer project.",
      }

      // Create a directory structure for simulation
      const simulatedDirs: Record<string, string[]> = {
        "/": ["index.js", "package.json", "README.md", "src", "public"],
        "/src": ["app.js", "styles.css"],
        "/public": ["index.html", "favicon.ico"],
      }

      return {
        instance: null,
        shell: null,
        isSimulated: true,
        authStatus: "failed", // Add this line to indicate failed authentication

        async loadFiles(files: { [key: string]: string }) {
          console.log("Simulated loadFiles:", files)
          // Add files to our simulated file system
          Object.entries(files).forEach(([path, content]) => {
            simulatedFS[path] = content

            // Update directory structure
            const dirPath = path.split("/").slice(0, -1).join("/") || "/"
            const fileName = path.split("/").pop() || ""

            if (!simulatedDirs[dirPath]) {
              simulatedDirs[dirPath] = []
            }

            if (!simulatedDirs[dirPath].includes(fileName)) {
              simulatedDirs[dirPath].push(fileName)
            }
          })
          return true
        },

        async run(command = "node index.js") {
          terminalOutput += `$ ${command}\n`

          if (command === "node index.js") {
            const content = simulatedFS["index.js"] || "console.log('Hello from WebContainer!');"
            // Simple execution simulation
            if (content.includes("console.log")) {
              const matches = content.match(/console\.log$$['"](.+)['"]$$/)
              if (matches && matches[1]) {
                terminalOutput += `${matches[1]}\n`
              } else {
                terminalOutput += "Hello from WebContainer!\n"
              }
            } else {
              terminalOutput += "[Simulated output]\n"
            }
          } else if (command.startsWith("ls")) {
            // List files in our simulated file system
            const path = command.includes(" ") ? command.split(" ")[1] : "/"
            const normalizedPath = path === "." ? "/" : path

            if (simulatedDirs[normalizedPath]) {
              terminalOutput += simulatedDirs[normalizedPath].join("\n") + "\n"
            } else {
              terminalOutput += `ls: cannot access '${path}': No such file or directory\n`
            }
          } else if (command.startsWith("cat ")) {
            const fileName = command.substring(4).trim()
            if (simulatedFS[fileName]) {
              terminalOutput += simulatedFS[fileName] + "\n"
            } else {
              terminalOutput += `cat: ${fileName}: No such file or directory\n`
            }
          } else if (command.startsWith("mkdir ")) {
            const dirName = command.substring(6).trim()
            const path = dirName.startsWith("/") ? dirName : `/${dirName}`
            simulatedDirs[path] = []
            terminalOutput += `[Simulated] Directory ${dirName} created\n`
          } else if (command.startsWith("npm ")) {
            terminalOutput += `[Simulated] NPM command executed\n`
          } else {
            terminalOutput += `Command not recognized in simulation mode\n`
          }

          if (onTerminalOutput) {
            onTerminalOutput(terminalOutput)
          }

          return "Command simulated"
        },

        async sendCommand(command: string) {
          terminalOutput += `$ ${command}\n`

          if (command === "node index.js") {
            const content = simulatedFS["index.js"] || "console.log('Hello from WebContainer!');"
            // Simple execution simulation
            if (content.includes("console.log")) {
              const matches = content.match(/console\.log$$['"](.+)['"]$$/)
              if (matches && matches[1]) {
                terminalOutput += `${matches[1]}\n`
              } else {
                terminalOutput += "Hello from WebContainer!\n"
              }
            } else {
              terminalOutput += "[Simulated output]\n"
            }
          } else if (command.startsWith("ls")) {
            // List files in our simulated file system
            const path = command.includes(" ") ? command.split(" ")[1] : "/"
            const normalizedPath = path === "." ? "/" : path

            if (simulatedDirs[normalizedPath]) {
              terminalOutput += simulatedDirs[normalizedPath].join("\n") + "\n"
            } else {
              terminalOutput += `ls: cannot access '${path}': No such file or directory\n`
            }
          } else if (command.startsWith("cat ")) {
            const fileName = command.substring(4).trim()
            if (simulatedFS[fileName]) {
              terminalOutput += simulatedFS[fileName] + "\n"
            } else {
              terminalOutput += `cat: ${fileName}: No such file or directory\n`
            }
          } else if (command.startsWith("mkdir ")) {
            const dirName = command.substring(6).trim()
            const path = dirName.startsWith("/") ? dirName : `/${dirName}`
            simulatedDirs[path] = []
            terminalOutput += `[Simulated] Directory ${dirName} created\n`
          } else if (command.startsWith("npm ")) {
            terminalOutput += `[Simulated] NPM command executed\n`
          } else {
            terminalOutput += `Command not recognized in simulation mode\n`
          }

          if (onTerminalOutput) {
            onTerminalOutput(terminalOutput)
          }
        },

        clearTerminal() {
          terminalOutput = "$ "
          if (onTerminalOutput) {
            onTerminalOutput(terminalOutput)
          }
        },

        async getFileSystem() {
          // Convert our simulated file system to the expected format
          return Object.keys(simulatedFS).map((path) => {
            const name = path.split("/").pop() || path
            return {
              name,
              type: "file",
            }
          })
        },

        async readFile(path: string) {
          if (simulatedFS[path]) {
            return simulatedFS[path]
          }
          return null
        },

        async writeFile(path: string, content: string) {
          simulatedFS[path] = content

          // Update directory structure
          const dirPath = path.split("/").slice(0, -1).join("/") || "/"
          const fileName = path.split("/").pop() || ""

          if (!simulatedDirs[dirPath]) {
            simulatedDirs[dirPath] = []
          }

          if (!simulatedDirs[dirPath].includes(fileName)) {
            simulatedDirs[dirPath].push(fileName)
          }

          return true
        },

        async listDirectory(path: string) {
          if (simulatedDirs[path]) {
            return simulatedDirs[path].map((name) => {
              const isDirectory = Object.keys(simulatedDirs).includes(path === "/" ? `/${name}` : `${path}/${name}`)
              return {
                name,
                type: isDirectory ? "directory" : "file",
                path: path === "/" ? `/${name}` : `${path}/${name}`,
              }
            })
          }
          return []
        },
      }
    }

    loadWebContainer()

    return () => {
      isMounted = false
      // Clean up the shell if needed
      if (shellInstance) {
        shellInstance.kill()
      }
    }
  }, [onReady, onTerminalOutput])

  // This component doesn't render anything visible
  return null
}
