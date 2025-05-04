# WebContainer Manager

A powerful web-based application for managing and running WebContainers directly in your browser. This application provides a secure environment with file management, terminal access, and preview capabilities.

## Features

- **File Explorer**: Browse, create, edit, and delete files and directories
- **Code Editor**: Edit files with syntax highlighting
- **Terminal**: Run commands directly in the WebContainer
- **Preview**: View the output of your applications
- **Markdown Support**: Edit and preview Markdown files
- **Authentication**: Secure access with user accounts
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. **Login**: Use the default credentials or create a new account
   - Default email: gogiapandie@gmail.com
   - Default password: !June1872

2. **File Management**: Use the file explorer to create and manage files
   - Click on folders to navigate
   - Click on files to edit them
   - Use the context menu for additional options

3. **Running Code**: Use the terminal to run commands
   - Basic commands like `ls`, `cd`, and `node` are supported
   - Run JavaScript files with `node filename.js`

4. **Preview**: Use the container preview to see your application
   - Navigate to `/container-preview` in the browser footer
   - Click on files to view or edit them
   - Markdown files have both edit and preview modes

## Technical Details

This application uses:

- **Next.js**: For the frontend and API routes
- **WebContainer API**: To run code directly in the browser
- **shadcn/ui**: For the UI components
- **Tailwind CSS**: For styling
- **TypeScript**: For type safety

## Development

To run this application locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

Make sure your server has the required headers for cross-origin isolation:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

## Deployment

This application can be deployed to any platform that supports Next.js applications. Make sure to set the required headers for cross-origin isolation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's update the next.config.js to ensure cross-origin isolation is enabled:

```typescriptreact file="next.config.js"
[v0-no-op-code-block-prefix]/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add headers for cross-origin isolation
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
