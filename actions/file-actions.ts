"use server"

import { createServerClient } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { triggerWebhook } from "@/lib/webhook-service"
import { memoryService } from "@/lib/memory-service"

export async function getFileContent(fileId: number) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("fm_files").select("*").eq("id", fileId).single()

  if (error) {
    console.error("Error fetching file:", error)
    throw new Error("Failed to fetch file")
  }

  return data
}

export async function updateFileContent(fileId: number, content: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("fm_files")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", fileId)
    .select()

  if (error) {
    console.error("Error updating file:", error)
    throw new Error("Failed to update file")
  }

  revalidatePath(`/file-editor/${fileId}`)

  if (data && data[0]) {
    await triggerWebhook("file.updated", {
      id: data[0].id,
      name: data[0].name,
      path: data[0].path,
      size: data[0].size,
      mime_type: data[0].mime_type,
      folder_id: data[0].folder_id,
      updated_at: data[0].updated_at,
    })
  }

  return data[0]
}

export async function getFileLanguage(mimeType: string, fileName: string) {
  // Determine language based on mime type and file extension
  if (mimeType.includes("html")) return "html"
  if (mimeType.includes("css")) return "css"
  if (mimeType.includes("javascript")) return "javascript"
  if (mimeType.includes("markdown") || fileName.endsWith(".md")) return "markdown"

  // Check file extension if mime type is not specific
  const extension = fileName.split(".").pop()?.toLowerCase()
  if (extension === "html" || extension === "htm") return "html"
  if (extension === "css") return "css"
  if (extension === "js") return "javascript"
  if (extension === "md" || extension === "markdown") return "markdown"

  return "text"
}

interface UploadFileParams {
  file: File
  userId: number
  folderId: number | null
}

export async function uploadFile({ file, userId, folderId }: UploadFileParams) {
  try {
    // Generate a safe filename to avoid issues with special characters
    const safeFileName = generateSafeFileName(file.name)
    const uniqueFileName = `${Date.now()}-${safeFileName}`
    const blobPath = `files/${userId}/${uniqueFileName}`

    // Upload file to Vercel Blob with timeout and retry logic
    const blob = await uploadToBlob(file, blobPath)

    // Get file content for editable files
    let content = null
    const isTextFile = isEditableFileType(file.name, file.type)

    if (isTextFile) {
      content = await file.text()
    }

    // Store file metadata in database
    const supabase = createServerClient()
    const filePath = folderId ? await getFolderPath(folderId) : `/${file.name}`

    // Ensure we have the correct MIME type
    const mimeType = file.type || getMimeTypeFromFileName(file.name)

    const { data, error } = await supabase
      .from("fm_files")
      .insert({
        name: file.name,
        path: filePath,
        size: file.size,
        mime_type: mimeType,
        user_id: userId,
        folder_id: folderId,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        blob_url: blob.url,
      })
      .select()

    if (error) {
      console.error("Error storing file metadata:", error)
      throw new Error(`Failed to store file metadata: ${error.message}`)
    }

    // Record this operation in memory
    await memoryService.recordFileOperation(
      "create",
      {
        id: data[0].id,
        name: file.name,
        path: filePath,
        size: file.size,
        mime_type: mimeType,
      },
      userId,
    )

    revalidatePath("/")

    if (data && data[0]) {
      await triggerWebhook("file.created", {
        id: data[0].id,
        name: data[0].name,
        path: data[0].path,
        size: data[0].size,
        mime_type: data[0].mime_type,
        folder_id: data[0].folder_id,
        created_at: data[0].created_at,
      })
    }

    return data[0]
  } catch (error) {
    console.error(`Error uploading ${file.name}:`, error)
    throw error
  }
}

// Helper function to upload to Vercel Blob with timeout
async function uploadToBlob(file: File, blobPath: string, timeout = 30000) {
  // Create an AbortController for the timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const blob = await put(blobPath, file, {
      access: "public",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return blob
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Upload timed out after ${timeout / 1000} seconds`)
      }
    }

    throw error
  }
}

// Helper function to generate a safe filename
function generateSafeFileName(fileName: string) {
  // Replace special characters with underscores
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
}

export async function deleteFile(fileId: number) {
  const supabase = createServerClient()

  // Get file details first
  const { data: file, error: fetchError } = await supabase.from("fm_files").select("*").eq("id", fileId).single()

  if (fetchError) {
    console.error("Error fetching file:", fetchError)
    throw new Error("Failed to fetch file")
  }

  // Record this operation in memory before deleting
  await memoryService.recordFileOperation(
    "delete",
    {
      id: file.id,
      name: file.name,
      path: file.path,
    },
    file.user_id,
  )

  // Delete the blob if it exists
  if (file.blob_url) {
    try {
      // Extract the blob path from the URL
      const url = new URL(file.blob_url)
      const pathname = url.pathname
      // Remove the leading slash and any potential prefix like /cdn/
      const blobPath = pathname.replace(/^\/cdn\//, "").replace(/^\//, "")

      await del(blobPath)
    } catch (blobError) {
      console.error("Error deleting blob:", blobError)
      // Continue with database deletion even if blob deletion fails
    }
  }

  // Delete the file from the database
  const { error: deleteError } = await supabase.from("fm_files").delete().eq("id", fileId)

  if (deleteError) {
    console.error("Error deleting file:", deleteError)
    throw new Error("Failed to delete file")
  }

  revalidatePath("/")

  await triggerWebhook("file.deleted", {
    id: fileId,
    deleted_at: new Date().toISOString(),
  })

  return { success: true }
}

export async function renameFile(fileId: number, newName: string) {
  const supabase = createServerClient()

  // Get file details first
  const { data: file, error: fetchError } = await supabase.from("fm_files").select("*").eq("id", fileId).single()

  if (fetchError) {
    console.error("Error fetching file:", fetchError)
    throw new Error("Failed to fetch file")
  }

  // Check if a file with the same name already exists in the same folder
  const { data: existingFiles, error: checkError } = await supabase
    .from("fm_files")
    .select("id")
    .eq("folder_id", file.folder_id)
    .eq("name", newName)
    .neq("id", fileId)

  if (checkError) {
    console.error("Error checking for existing files:", checkError)
    throw new Error("Failed to check for existing files")
  }

  if (existingFiles && existingFiles.length > 0) {
    throw new Error(`A file named "${newName}" already exists in this location`)
  }

  // Update the file path
  const folderPath = file.folder_id ? await getFolderPath(file.folder_id) : ""
  const newPath = folderPath ? `${folderPath}/${newName}` : `/${newName}`

  // Update the file in the database
  const { data, error } = await supabase
    .from("fm_files")
    .update({
      name: newName,
      path: newPath,
      updated_at: new Date().toISOString(),
      // Update mime_type if extension changed
      mime_type: getMimeTypeFromFileName(newName),
    })
    .eq("id", fileId)
    .select()

  if (error) {
    console.error("Error renaming file:", error)
    throw new Error("Failed to rename file")
  }

  // Record this operation in memory
  await memoryService.recordFileOperation(
    "update",
    {
      id: file.id,
      name: `${file.name} to ${newName}`,
      path: newPath,
    },
    file.user_id,
  )

  revalidatePath("/")
  return data[0]
}

// Helper function to get folder path
async function getFolderPath(folderId: number) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("fm_folders").select("path, name").eq("id", folderId).single()

  if (error || !data) {
    console.error("Error getting folder path:", error)
    return "/"
  }

  return `${data.path}/${data.name}`
}

// Helper function to check if file is editable
function isEditableFileType(fileName: string, mimeType: string) {
  const editableExtensions = [".html", ".htm", ".css", ".js", ".md", ".txt", ".json"]
  const editableMimeTypes = ["text/", "application/javascript", "application/json", "text/markdown"]

  const extension = "." + fileName.split(".").pop()?.toLowerCase()

  return (
    editableExtensions.some((ext) => fileName.toLowerCase().endsWith(ext)) ||
    editableMimeTypes.some((type) => mimeType.includes(type))
  )
}

// Helper function to get mime type from file name
function getMimeTypeFromFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    // Text and code files
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    md: "text/markdown",
    txt: "text/plain",

    // Common image formats
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",

    // Modern image formats
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",

    // Document formats
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Archive formats
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",

    // Audio formats
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",

    // Video formats
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",

    // Font formats
    ttf: "font/ttf",
    otf: "font/otf",
    woff: "font/woff",
    woff2: "font/woff2",
  }

  return extension && mimeTypes[extension] ? mimeTypes[extension] : "application/octet-stream"
}
