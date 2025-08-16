import type { DirectusFolder } from '~~/types'
import type { TreeItem } from '@nuxt/ui'

export function transformFoldersToTreeItems(
  folders: DirectusFolder[] | null | undefined
): TreeItem[] {
  if (!folders) {
    return []
  }

  // Create a map for quick lookup by ID
  const folderMap = new Map<string, DirectusFolder>()
  folders.forEach((folder) => folderMap.set(folder.id, folder))

  // Create a map to store children for each parent
  const childrenMap = new Map<string | null, DirectusFolder[]>()
  folders.forEach((folder) => {
    const parentId = folder.parent || null // Use null for root folders
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(folder)
  })

  // Recursive function to build the tree
  function buildTree(parentId: string | null): TreeItem[] {
    const children = childrenMap.get(parentId) || []

    // Sort children alphabetically by name
    children.sort((a, b) => a.name.localeCompare(b.name))

    return children.map((folder) => {
      const treeItem: TreeItem = {
        label: folder.name,
        value: folder.id,
        id: folder.id,
      }

      const grandChildren = buildTree(folder.id)
      if (grandChildren.length > 0) {
        treeItem.children = grandChildren
      }

      return treeItem
    })
  }

  // Build the tree starting from the root (parentId = null)
  return buildTree(null)
}
