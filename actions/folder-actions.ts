"use server"

import { createServerClient } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { deleteFile } from "./file-actions"
import { triggerWebhook } from "@/lib/webhook-service"

interface CreateFolderParams {
  name: string
  userId: number
  parentId: number | null
}

export async function createFolder({ name, userId, parentId }: CreateFolderParams) {
  const supabase = createServerClient()

  // Get the path for the new folder
  let path = ""
  if (parentId) {
    const { data: parentFolder, error: parentError } = await supabase
      .from("fm_folders")
      .select("path, name")
      .eq("id", parentId)
      .single()

    if (parentError) {
      console.error("Error fetching parent folder:", parentError)
      throw new Error("Failed to fetch parent folder")
    }

    path = `${parentFolder.path}/${parentFolder.name}`
  } else {
    path = ""
  }

  // Check if folder with same name already exists in the same location
  const { data: existingFolders, error: checkError } = await supabase
    .from("fm_folders")
    .select("id")
    .eq("user_id", userId)
    .eq("parent_id", parentId)
    .eq("name", name)

  if (checkError) {
    console.error("Error checking for existing folders:", checkError)
    throw new Error("Failed to check for existing folders")
  }

  if (existingFolders && existingFolders.length > 0) {
    throw new Error(`A folder named "${name}" already exists in this location`)
  }

  // Create the new folder
  const { data: folderData, error } = await supabase
    .from("fm_folders")
    .insert({
      name,
      path,
      user_id: userId,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error("Error creating folder:", error)
    throw new Error("Failed to create folder")
  }

  const folder = folderData[0]

  await triggerWebhook("folder.created", {
    id: folder.id,
    name: folder.name,
    path: folder.path,
    parent_id: folder.parent_id,
    created_at: folder.created_at,
  })

  revalidatePath("/")
  return folder
}

export async function deleteFolder(folderId: number) {
  const supabase = createServerClient()

  // Get all subfolders recursively
  const subfolders = await getSubfolders(folderId)

  // Get all files in this folder and subfolders
  const allFolderIds = [folderId, ...subfolders.map((folder) => folder.id)]

  // Delete files in all folders
  for (const currentFolderId of allFolderIds) {
    const { data: files, error: filesError } = await supabase
      .from("fm_files")
      .select("id")
      .eq("folder_id", currentFolderId)

    if (filesError) {
      console.error("Error fetching files:", filesError)
      throw new Error("Failed to fetch files")
    }

    // Delete each file
    for (const file of files || []) {
      await deleteFile(file.id)
    }
  }

  // Delete subfolders from deepest to shallowest
  const sortedFolders = [...subfolders].sort((a, b) => {
    // Count slashes to determine depth
    const depthA = (a.path.match(/\//g) || []).length
    const depthB = (b.path.match(/\//g) || []).length
    return depthB - depthA // Descending order (deepest first)
  })

  for (const folder of sortedFolders) {
    const { error: deleteFolderError } = await supabase.from("fm_folders").delete().eq("id", folder.id)

    if (deleteFolderError) {
      console.error("Error deleting subfolder:", deleteFolderError)
      throw new Error("Failed to delete subfolder")
    }
  }

  // Finally delete the main folder
  const { error: deleteError } = await supabase.from("fm_folders").delete().eq("id", folderId)

  if (deleteError) {
    console.error("Error deleting folder:", deleteError)
    throw new Error("Failed to delete folder")
  }

  await triggerWebhook("folder.deleted", {
    id: folderId,
    deleted_at: new Date().toISOString(),
  })

  revalidatePath("/")
  return { success: true }
}

export async function renameFolder(folderId: number, newName: string) {
  const supabase = createServerClient()

  // Get folder details first
  const { data: folder, error: fetchError } = await supabase.from("fm_folders").select("*").eq("id", folderId).single()

  if (fetchError) {
    console.error("Error fetching folder:", fetchError)
    throw new Error("Failed to fetch folder")
  }

  // Check if a folder with the same name already exists in the same location
  const { data: existingFolders, error: checkError } = await supabase
    .from("fm_folders")
    .select("id")
    .eq("parent_id", folder.parent_id)
    .eq("name", newName)
    .neq("id", folderId)

  if (checkError) {
    console.error("Error checking for existing folders:", checkError)
    throw new Error("Failed to check for existing folders")
  }

  if (existingFolders && existingFolders.length > 0) {
    throw new Error(`A folder named "${newName}" already exists in this location`)
  }

  // Get the old folder path for updating child paths
  const oldPath = `${folder.path}/${folder.name}`

  // Update the folder in the database
  const { data: updatedFolderData, error } = await supabase
    .from("fm_folders")
    .update({
      name: newName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId)
    .select()

  if (error) {
    console.error("Error renaming folder:", error)
    throw new Error("Failed to rename folder")
  }

  const updatedFolder = updatedFolderData[0]

  // Get the new folder path
  const newPath = `${folder.path}/${newName}`

  // Update paths for all subfolders
  const subfolders = await getSubfolders(folderId)
  for (const subfolder of subfolders) {
    // Replace the old path prefix with the new one
    const newSubfolderPath = subfolder.path.replace(oldPath, newPath)

    const { error: updateError } = await supabase
      .from("fm_folders")
      .update({
        path: newSubfolderPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subfolder.id)

    if (updateError) {
      console.error("Error updating subfolder path:", updateError)
      // Continue with other updates even if one fails
    }
  }

  // Update paths for all files in this folder and subfolders
  const allFolderIds = [folderId, ...subfolders.map((subfolder) => subfolder.id)]
  for (const currentFolderId of allFolderIds) {
    const { data: files, error: filesError } = await supabase
      .from("fm_files")
      .select("*")
      .eq("folder_id", currentFolderId)

    if (filesError) {
      console.error("Error fetching files:", filesError)
      continue
    }

    for (const file of files || []) {
      // Replace the old path prefix with the new one
      const newFilePath = file.path.replace(oldPath, newPath)

      const { error: updateError } = await supabase
        .from("fm_files")
        .update({
          path: newFilePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", file.id)

      if (updateError) {
        console.error("Error updating file path:", updateError)
        // Continue with other updates even if one fails
      }
    }
  }

  await triggerWebhook("folder.updated", {
    id: updatedFolder.id,
    name: updatedFolder.name,
    path: updatedFolder.path,
    parent_id: updatedFolder.parent_id,
    updated_at: updatedFolder.updated_at,
  })

  revalidatePath("/")
  return updatedFolder
}

async function getSubfolders(folderId: number) {
  const supabase = createServerClient()
  const allSubfolders = []

  // Get immediate children
  const { data: children, error } = await supabase.from("fm_folders").select("*").eq("parent_id", folderId)

  if (error) {
    console.error("Error fetching subfolders:", error)
    throw new Error("Failed to fetch subfolders")
  }

  if (children && children.length > 0) {
    allSubfolders.push(...children)

    // Recursively get children of children
    for (const child of children) {
      const childSubfolders = await getSubfolders(child.id)
      allSubfolders.push(...childSubfolders)
    }
  }

  return allSubfolders
}

export async function getFolderPath(folderId: number) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("fm_folders").select("path, name").eq("id", folderId).single()

  if (error || !data) {
    console.error("Error getting folder path:", error)
    return "/"
  }

  return `${data.path}/${data.name}`
}

export async function getFolderBreadcrumb(folderId: number | null) {
  if (!folderId) return []

  const supabase = createServerClient()
  const breadcrumb = []
  let currentId = folderId

  while (currentId) {
    const { data, error } = await supabase.from("fm_folders").select("id, name, parent_id").eq("id", currentId).single()

    if (error || !data) {
      console.error("Error fetching folder:", error)
      break
    }

    breadcrumb.unshift({ id: data.id, name: data.name })
    currentId = data.parent_id
  }

  return breadcrumb
}
