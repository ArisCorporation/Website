import { describe, it, expect } from 'vitest'
import { transformFoldersToTreeItems } from '../../../app/utils/folder-utils'
import type { DirectusFolder } from '~/types'

describe('Utils > folder-utils > transformFoldersToTreeItems', () => {
  it('sollte ein leeres Array zurückgeben, wenn keine Ordner vorhanden sind', () => {
    expect(transformFoldersToTreeItems(null)).toEqual([])
    expect(transformFoldersToTreeItems(undefined)).toEqual([])
    expect(transformFoldersToTreeItems([])).toEqual([])
  })

  it('sollte eine flache Liste von Ordnern korrekt umwandeln und sortieren', () => {
    const folders: DirectusFolder[] = [
      { id: '1', name: 'Folder A', parent: null },
      { id: '2', name: 'Folder C', parent: null },
      { id: '3', name: 'Folder B', parent: null },
    ]
    const tree = transformFoldersToTreeItems(folders)
    expect(tree).toHaveLength(3)
    expect(tree.map(i => i.label)).toEqual(['Folder A', 'Folder B', 'Folder C'])
  })

  it('sollte eine verschachtelte Struktur von Ordnern korrekt umwandeln', () => {
    const folders: DirectusFolder[] = [
      { id: '1', name: 'Root 1', parent: null },
      { id: '2', name: 'Child 1.1', parent: '1' },
      { id: '3', name: 'Root 2', parent: null },
      { id: '4', name: 'Child 2.1', parent: '3' },
      { id: '5', name: 'Grandchild 1.1.1', parent: '2' },
    ]
    const tree = transformFoldersToTreeItems(folders)
    expect(tree).toHaveLength(2)
    expect(tree[0].label).toBe('Root 1')
    expect(tree[0].children).toBeDefined()
    expect(tree[0].children!).toHaveLength(1)
    expect(tree[0].children![0].label).toBe('Child 1.1')
    expect(tree[0].children![0].children).toBeDefined()
    expect(tree[0].children![0].children!).toHaveLength(1)
    expect(tree[0].children![0].children![0].label).toBe('Grandchild 1.1.1')
    expect(tree[1].label).toBe('Root 2')
    expect(tree[1].children).toBeDefined()
    expect(tree[1].children!).toHaveLength(1)
    expect(tree[1].children![0].label).toBe('Child 2.1')
  })

  it('sollte Ordner auf jeder Ebene alphabetisch sortieren', () => {
    const folders: DirectusFolder[] = [
      { id: '1', name: 'Z Root', parent: null },
      { id: '2', name: 'A Root', parent: null },
      { id: '3', name: 'C Child of A', parent: '2' },
      { id: '4', name: 'B Child of A', parent: '2' },
    ]
    const tree = transformFoldersToTreeItems(folders)
    expect(tree).toHaveLength(2)
    expect(tree.map(i => i.label)).toEqual(['A Root', 'Z Root'])
    expect(tree[0].children).toBeDefined()
    expect(tree[0].children!).toHaveLength(2)
    expect(tree[0].children!.map(i => i.label)).toEqual(['B Child of A', 'C Child of A'])
  })
})
