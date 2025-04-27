import type { FileSystemItem, FileType } from "@/types/file-system"

// Create a new file or directory
export function createItem(
  items: FileSystemItem[],
  parentPath: string,
  name: string,
  type: FileType,
  content = "",
): FileSystemItem[] {
  // If parent path is root
  if (parentPath === "/") {
    const newItem: FileSystemItem = {
      name,
      type,
      path: `/${name}`,
      ...(type === "file" ? { content } : { children: [] }),
    }
    return [...items, newItem]
  }

  // Clone the items array to avoid mutating the original
  const newItems = [...items]

  // Find the parent directory
  const findAndAddToParent = (items: FileSystemItem[], path: string, newItem: FileSystemItem): FileSystemItem[] => {
    return items.map((item) => {
      if (item.type === "directory" && item.path === path) {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        }
      } else if (item.type === "directory" && item.children) {
        return {
          ...item,
          children: findAndAddToParent(item.children, path, newItem),
        }
      }
      return item
    })
  }

  const newItem: FileSystemItem = {
    name,
    type,
    path: parentPath === "/" ? `/${name}` : `${parentPath}/${name}`,
    ...(type === "file" ? { content } : { children: [] }),
  }

  return findAndAddToParent(newItems, parentPath, newItem)
}

// Delete a file or directory
export function deleteItem(items: FileSystemItem[], path: string): FileSystemItem[] {
  // If the item is at the root level
  if (path.split("/").length === 2) {
    return items.filter((item) => item.path !== path)
  }

  // Clone the items array to avoid mutating the original
  const newItems = [...items]

  // Find the parent directory and remove the item
  const findAndRemoveFromParent = (items: FileSystemItem[], path: string): FileSystemItem[] => {
    const pathParts = path.split("/")
    const parentPath = pathParts.slice(0, -1).join("/")

    return items.map((item) => {
      if (item.type === "directory" && item.path === parentPath && item.children) {
        return {
          ...item,
          children: item.children.filter((child) => child.path !== path),
        }
      } else if (item.type === "directory" && item.children) {
        return {
          ...item,
          children: findAndRemoveFromParent(item.children, path),
        }
      }
      return item
    })
  }

  return findAndRemoveFromParent(newItems, path)
}

// Get a file or directory by path
export function getItemByPath(items: FileSystemItem[], path: string): FileSystemItem | null {
  // Handle root path
  if (path === "/") {
    return {
      name: "/",
      type: "directory",
      path: "/",
      children: items,
    }
  }

  // Check if the item is at the root level
  const rootItem = items.find((item) => item.path === path)
  if (rootItem) return rootItem

  // Search in subdirectories
  const findInChildren = (items: FileSystemItem[], path: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.path === path) return item
      if (item.type === "directory" && item.children) {
        const found = findInChildren(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  return findInChildren(items, path)
}

// Update file content
export function updateFileContent(items: FileSystemItem[], path: string, content: string): FileSystemItem[] {
  // Clone the items array to avoid mutating the original
  const newItems = [...items]

  // Find the file and update its content
  const findAndUpdateContent = (items: FileSystemItem[], path: string, content: string): FileSystemItem[] => {
    return items.map((item) => {
      if (item.path === path && item.type === "file") {
        return {
          ...item,
          content,
        }
      } else if (item.type === "directory" && item.children) {
        return {
          ...item,
          children: findAndUpdateContent(item.children, path, content),
        }
      }
      return item
    })
  }

  return findAndUpdateContent(newItems, path, content)
}

// Get all files as a flat object for WebContainer
export function getFilesForWebContainer(items: FileSystemItem[]): { [path: string]: string } {
  const files: { [path: string]: string } = {}

  const addFilesToObject = (items: FileSystemItem[]) => {
    items.forEach((item) => {
      if (item.type === "file" && item.content !== undefined) {
        // Remove the leading slash for WebContainer paths
        const path = item.path.startsWith("/") ? item.path.substring(1) : item.path
        files[path] = item.content
      } else if (item.type === "directory" && item.children) {
        addFilesToObject(item.children)
      }
    })
  }

  addFilesToObject(items)
  return files
}

// Get parent directory path
export function getParentPath(path: string): string {
  if (path === "/" || !path.includes("/")) return "/"
  const parts = path.split("/")
  return parts.slice(0, -1).join("/") || "/"
}

// Get children of a directory
export function getDirectoryChildren(items: FileSystemItem[], path: string): FileSystemItem[] {
  if (path === "/") return items

  const directory = getItemByPath(items, path)
  if (directory && directory.type === "directory" && directory.children) {
    return directory.children
  }
  return []
}

// Move an item from one path to another
export function moveItem(items: FileSystemItem[], sourcePath: string, targetPath: string): FileSystemItem[] {
  // Don't move an item to itself or its own subdirectory
  if (sourcePath === targetPath || targetPath.startsWith(`${sourcePath}/`)) {
    return items
  }

  // Get the source item
  const sourceItem = getItemByPath(items, sourcePath)
  if (!sourceItem) return items

  // Create a deep copy of the source item to avoid reference issues
  const sourceItemCopy: FileSystemItem = JSON.parse(JSON.stringify(sourceItem))

  // Update the path of the copied item and its children (if it's a directory)
  const updatePaths = (item: FileSystemItem, oldBasePath: string, newBasePath: string): FileSystemItem => {
    const newPath = item.path.replace(oldBasePath, newBasePath)

    if (item.type === "directory" && item.children) {
      return {
        ...item,
        path: newPath,
        children: item.children.map((child) => updatePaths(child, oldBasePath, newBasePath)),
      }
    }

    return {
      ...item,
      path: newPath,
    }
  }

  // Get the target directory
  const targetDir = getItemByPath(items, targetPath)
  if (!targetDir || targetDir.type !== "directory") return items

  // Calculate the new path for the source item
  const sourceItemName = sourceItem.name
  const newSourcePath = targetPath === "/" ? `/${sourceItemName}` : `${targetPath}/${sourceItemName}`

  // Update the paths of the source item and its children
  const updatedSourceItem = updatePaths(sourceItemCopy, sourcePath, newSourcePath)

  // First, remove the source item from its original location
  const itemsWithoutSource = deleteItem(items, sourcePath)

  // Then, add the updated source item to the target directory
  return createItem(
    itemsWithoutSource,
    targetPath,
    updatedSourceItem.name,
    updatedSourceItem.type,
    updatedSourceItem.type === "file" ? updatedSourceItem.content || "" : "",
  )
}

// Check if a path is a subdirectory of another path
export function isSubdirectory(parentPath: string, childPath: string): boolean {
  if (parentPath === "/") return childPath !== "/"
  return childPath.startsWith(`${parentPath}/`) && childPath !== parentPath
}
