// Map of file extensions to language names
export const fileExtensionToLanguage: Record<string, string> = {
  // JavaScript and TypeScript
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",

  // HTML
  html: "HTML",
  htm: "HTML",

  // CSS
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  less: "Less",

  // JSON
  json: "JSON",

  // Markdown
  md: "Markdown",
  markdown: "Markdown",

  // Python
  py: "Python",
  pyw: "Python",
  pyi: "Python",

  // SQL
  sql: "SQL",

  // XML and SVG
  xml: "XML",
  svg: "SVG",
  xhtml: "XHTML",

  // PHP
  php: "PHP",
  phtml: "PHP",

  // Java
  java: "Java",

  // Rust
  rs: "Rust",

  // C/C++
  c: "C",
  h: "C Header",
  cpp: "C++",
  cc: "C++",
  cxx: "C++",
  hpp: "C++ Header",
  hxx: "C++ Header",

  // YAML
  yml: "YAML",
  yaml: "YAML",

  // Shell/Bash
  sh: "Shell",
  bash: "Bash",
  zsh: "ZSH",

  // Ruby
  rb: "Ruby",
  ruby: "Ruby",

  // Go
  go: "Go",

  // Swift
  swift: "Swift",

  // Kotlin
  kt: "Kotlin",
  kts: "Kotlin Script",

  // Other languages
  dart: "Dart",
  lua: "Lua",
  r: "R",
  pl: "Perl",
  pm: "Perl Module",
  scala: "Scala",
  clj: "Clojure",
  fs: "F#",
  fsx: "F# Script",
  ex: "Elixir",
  exs: "Elixir Script",
  erl: "Erlang",
  hs: "Haskell",
  vue: "Vue",
  svelte: "Svelte",
  tf: "Terraform",
  tfvars: "Terraform Variables",
  graphql: "GraphQL",
  gql: "GraphQL",
  toml: "TOML",
  ini: "INI",
  conf: "Config",
  cfg: "Config",
  dockerfile: "Dockerfile",
  makefile: "Makefile",
  gitignore: "Git Ignore",
  env: "Environment Variables",
}

// Get language name from file extension
export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  return fileExtensionToLanguage[ext] || "Plain Text"
}

// Get file icon based on file extension
export function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""

  // Map extensions to icon names (you can use any icon library)
  const iconMap: Record<string, string> = {
    js: "javascript",
    jsx: "react",
    ts: "typescript",
    tsx: "react",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    py: "python",
    sql: "database",
    xml: "xml",
    svg: "image",
    php: "php",
    java: "java",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    yml: "yaml",
    yaml: "yaml",
    sh: "terminal",
    bash: "terminal",
    rb: "ruby",
    go: "go",
    swift: "swift",
    kt: "kotlin",
    // Add more mappings as needed
  }

  return iconMap[ext] || "file"
}

// Check if a file is binary (non-text)
export function isBinaryFile(fileName: string): boolean {
  const binaryExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "ico",
    "webp",
    "tiff",
    "mp3",
    "mp4",
    "wav",
    "ogg",
    "avi",
    "mov",
    "wmv",
    "flv",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "rar",
    "tar",
    "gz",
    "7z",
    "exe",
    "dll",
    "so",
    "dylib",
    "bin",
    "dat",
  ]

  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  return binaryExtensions.includes(ext)
}

// Get MIME type for a file
export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""

  const mimeMap: Record<string, string> = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    txt: "text/plain",
    md: "text/markdown",
    xml: "application/xml",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    wav: "audio/wav",
    // Add more as needed
  }

  return mimeMap[ext] || "application/octet-stream"
}
