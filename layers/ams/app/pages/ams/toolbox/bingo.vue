<script lang="ts" setup>
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk'
import { storeToRefs } from 'pinia'
import { useToast } from '#imports'
import type { BingoCollection as DirectusBingoCollection } from '~~/types'
import { useAuthStore } from '~/stores/auth'

type BingoCell = {
  id: string
  label: string
  active: boolean
  isFree?: boolean
}

type NormalizedBingoCollection = {
  id: string
  title: string
  description: string
  free_card: string
  phrases: string[]
}

type BingoBoardSave = {
  id: string
  name: string
  createdAt: string
  board: BingoCell[]
  collectionId: string
}

type BingoBoardPayload = {
  kind: 'current' | 'save'
  collectionId: string
  board: BingoCell[]
  name?: string
  createdAt?: string
  updatedAt?: string
}

type DirectusBingoGameRecord = {
  id: string
  collection?: { id?: string | null } | string | null
  board?: unknown
  date_created?: string | null
  date_updated?: string | null
  status?: string | null
}

const boardSize = 5
const centerIndex = Math.floor((boardSize * boardSize) / 2)
const totalCells = boardSize * boardSize
const playableCells = totalCells - 1

function extractCollectionId(
  collection: DirectusBingoGameRecord['collection']
): string | null {
  if (!collection) return null
  if (typeof collection === 'string') return collection
  const candidate = collection.id
  return typeof candidate === 'string' && candidate.trim().length
    ? candidate
    : null
}

function normalizePhrase(entry: unknown): string | null {
  if (typeof entry === 'string') {
    const trimmed = entry.trim()
    return trimmed.length ? trimmed : null
  }
  if (!entry || typeof entry !== 'object') return null
  const candidate =
    (entry as { phrase?: unknown }).phrase ??
    (entry as { label?: unknown }).label ??
    (entry as { value?: unknown }).value ??
    null
  if (typeof candidate === 'string') {
    const trimmed = candidate.trim()
    return trimmed.length ? trimmed : null
  }
  return null
}

function extractPhrases(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source
      .map((item) => normalizePhrase(item))
      .filter((phrase): phrase is string => Boolean(phrase))
  }
  if (typeof source === 'string') {
    return source
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((phrase) => phrase.length > 0)
  }
  return []
}

function mapDirectusCollection(
  item: DirectusBingoCollection
): NormalizedBingoCollection | null {
  let phrases = extractPhrases(item.phrases)
  if (phrases.length < playableCells) {
    const fallback = extractPhrases(item.cards)
    if (fallback.length) {
      phrases = fallback
    }
  }
  if (phrases.length < playableCells) return null

  const idCandidate =
    (typeof item.slug === 'string' && item.slug.trim().length
      ? item.slug.trim()
      : undefined) ?? String(item.id)

  return {
    id: idCandidate,
    title:
      (typeof item.title === 'string' && item.title.trim().length
        ? item.title.trim()
        : undefined) ?? `Kollektion ${idCandidate}`,
    description:
      (typeof item.description === 'string' && item.description.trim().length
        ? item.description.trim()
        : undefined) ?? 'Kollektion ohne Beschreibung.',
    free_card:
      typeof item.free_card === 'string' && item.free_card.trim().length
        ? item.free_card.trim()
        : 'Technische Schwierigkeiten',
    phrases,
  }
}

const { data: directusCollections } = await useAsyncData<
  NormalizedBingoCollection[]
>('bingoCollections', async () => {
  const items = (await useDirectus(
    readItems('bingo_collections', {
      fields: ['id', 'title', 'description', 'free_card', 'cards'],
      limit: -1,
      filter: { status: { _eq: 'published' } },
      sort: ['title'],
    })
  )) as DirectusBingoCollection[] | null

  if (!Array.isArray(items)) return []

  return items
    .map((item) => mapDirectusCollection(item))
    .filter((collection): collection is NormalizedBingoCollection =>
      Boolean(collection)
    )
})

const bingoCollections = computed<NormalizedBingoCollection[]>(
  () => directusCollections.value ?? []
)

definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 1,
})

useSeoMeta({
  title: 'AMS Toolbox | Bingo',
  description:
    'Das AMS Bingo für deine Toolbox – markiere Highlights aus dem Aris Management Alltag und teile dein Ergebnis mit der Crew.',
})

const toast = useToast()
const authStore = useAuthStore()
const { currentUserId } = storeToRefs(authStore)

const selectedCollectionId = ref<string>('')
const savedBoards = ref<BingoBoardSave[]>([])
const currentGameId = ref<string | null>(null)
const isSyncingBoard = ref(false)
const isLoadingRemoteGames = ref(false)
const boardSyncPending = ref(false)
const suppressBoardPersist = ref(false)

const selectedCollection = computed<NormalizedBingoCollection | null>(
  () => getCollectionById(selectedCollectionId.value) ?? null
)

const collectionOptions = computed(() =>
  bingoCollections.value.map(({ id, title, description, phrases }) => ({
    id,
    title,
    description,
    phraseCount: phrases.length,
  }))
)

function getCollectionById(
  id: string | undefined
): NormalizedBingoCollection | null {
  return (
    bingoCollections.value.find((collection) => collection.id === id) ?? null
  )
}

function resolveCollectionId(id: string | undefined | null): string {
  const collection = id ? getCollectionById(id) : null
  return collection ? collection.id : ''
}

function buildBoard(collection: NormalizedBingoCollection): BingoCell[] {
  const pool = [...collection.phrases]
  if (pool.length < playableCells) {
    throw new Error(
      `Kollektion "${collection.title}" enthält nicht genug Einträge für das AMS Bingo.`
    )
  }

  const cells: BingoCell[] = []

  for (let index = 0; index < totalCells; index++) {
    if (index === centerIndex) {
      cells.push({
        id: `free-field-${collection.id}`,
        label: collection.free_card ?? 'Technische Schwierigkeiten',
        active: true,
        isFree: true,
      })
      continue
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    const [label] = pool.splice(randomIndex, 1)

    cells.push({
      id: `${collection.id}-${index}-${label}`,
      label,
      active: false,
    })
  }

  return cells
}

function cloneBoard(cells: BingoCell[]): BingoCell[] {
  return cells.map((cell) => ({ ...cell }))
}

function parseBoardPayload(raw: unknown): BingoBoardPayload | null {
  if (!raw || typeof raw !== 'object') return null

  const payload = raw as Record<string, unknown>
  const kind =
    payload.kind === 'save' || payload.kind === 'current'
      ? (payload.kind as 'save' | 'current')
      : null
  if (!kind) return null

  const collectionId =
    typeof payload.collectionId === 'string' &&
    payload.collectionId.trim().length
      ? payload.collectionId
      : null
  if (!collectionId) return null

  const boardCandidate = (payload.board ?? null) as unknown
  if (!isValidBoard(boardCandidate as BingoCell[])) return null

  const name =
    typeof payload.name === 'string' && payload.name.trim().length
      ? payload.name
      : undefined
  const createdAt =
    typeof payload.createdAt === 'string' && payload.createdAt.trim().length
      ? payload.createdAt
      : undefined
  const updatedAt =
    typeof payload.updatedAt === 'string' && payload.updatedAt.trim().length
      ? payload.updatedAt
      : undefined

  return {
    kind,
    collectionId,
    board: cloneBoard(boardCandidate as BingoCell[]),
    ...(name ? { name } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  }
}

function serializeBoardPayload(payload: BingoBoardPayload) {
  const base: Record<string, unknown> = {
    kind: payload.kind,
    collectionId: payload.collectionId,
    board: cloneBoard(payload.board),
  }

  if (payload.name) base.name = payload.name
  if (payload.createdAt) base.createdAt = payload.createdAt
  if (payload.updatedAt) base.updatedAt = payload.updatedAt

  return base
}

function isValidBoard(
  cells: BingoCell[] | null | undefined
): cells is BingoCell[] {
  return (
    Array.isArray(cells) &&
    cells.length === totalCells &&
    cells.every(
      (cell) =>
        cell &&
        typeof cell.id === 'string' &&
        typeof cell.label === 'string' &&
        typeof cell.active === 'boolean'
    )
  )
}

function sanitizeSavedBoards() {
  if (!savedBoards.value?.length) return
  if (!bingoCollections.value.length) return

  const validEntries: BingoBoardSave[] = []
  for (const entry of savedBoards.value) {
    if (!isValidBoard(entry.board)) continue
    const collectionId = resolveCollectionId(entry.collectionId)
    if (!collectionId) continue
    validEntries.push({
      ...entry,
      collectionId,
      board: cloneBoard(entry.board),
    })
  }

  if (validEntries.length !== savedBoards.value.length) {
    savedBoards.value = validEntries
  }
}

function calculateCompletedLines(cells: BingoCell[]): number[][] {
  const lines: number[][] = []

  const lineIsComplete = (indices: number[]) =>
    indices.every((cellIndex) => cells[cellIndex]?.active)

  for (let row = 0; row < boardSize; row++) {
    const indices = Array.from(
      { length: boardSize },
      (_, column) => row * boardSize + column
    )
    if (lineIsComplete(indices)) lines.push(indices)
  }

  for (let column = 0; column < boardSize; column++) {
    const indices = Array.from(
      { length: boardSize },
      (_, row) => row * boardSize + column
    )
    if (lineIsComplete(indices)) lines.push(indices)
  }

  const diagonalA = Array.from(
    { length: boardSize },
    (_, step) => step * boardSize + step
  )
  if (lineIsComplete(diagonalA)) lines.push(diagonalA)

  const diagonalB = Array.from(
    { length: boardSize },
    (_, step) => (step + 1) * boardSize - (step + 1)
  )
  if (lineIsComplete(diagonalB)) lines.push(diagonalB)

  return lines
}

function calculateCompletedCellIndices(cells: BingoCell[]): Set<number> {
  return new Set(calculateCompletedLines(cells).flat())
}

const board = ref<BingoCell[]>([])
const isExporting = ref(false)
const showCelebration = ref(false)
const suppressCollectionWatcher = ref(false)

async function loadRemoteGames() {
  if (!currentUserId.value) return
  isLoadingRemoteGames.value = true

  try {
    const items = (await useDirectus(
      readItems('bingo_games', {
        fields: [
          'id',
          'board',
          'collection',
          'date_created',
          'date_updated',
          'status',
        ],
        filter: {
          user_created: { _eq: currentUserId.value },
          status: { _neq: 'archived' },
        },
        sort: ['-date_updated', '-date_created'],
      })
    )) as DirectusBingoGameRecord[] | null

    const games = Array.isArray(items) ? items : []
    const collectedSaves: BingoBoardSave[] = []

    let newestCurrent: {
      id: string
      payload: BingoBoardPayload
      dateUpdated: string
    } | null = null

    for (const game of games) {
      const payload = parseBoardPayload(game.board)
      if (!payload) continue

      const collectionId =
        payload.collectionId ?? extractCollectionId(game.collection)
      if (!collectionId) continue

      if (payload.kind === 'current') {
        const updatedAt =
          payload.updatedAt ??
          game.date_updated ??
          game.date_created ??
          new Date().toISOString()
        if (!newestCurrent || updatedAt > newestCurrent.dateUpdated) {
          newestCurrent = {
            id: game.id,
            payload: {
              ...payload,
              collectionId,
              board: cloneBoard(payload.board),
              updatedAt,
            },
            dateUpdated: updatedAt,
          }
        }
        continue
      }

      collectedSaves.push({
        id: game.id,
        name:
          payload.name ??
          `Bingo vom ${new Date(
            payload.createdAt ?? game.date_created ?? Date.now()
          ).toLocaleString('de-DE')}`,
        createdAt:
          payload.createdAt ?? game.date_created ?? new Date().toISOString(),
        collectionId,
        board: cloneBoard(payload.board),
      })
    }

    savedBoards.value = collectedSaves
      .filter((entry) => isValidBoard(entry.board))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

    if (newestCurrent && isValidBoard(newestCurrent.payload.board)) {
      suppressCollectionWatcher.value = true
      suppressBoardPersist.value = true
      selectedCollectionId.value = newestCurrent.payload.collectionId
      board.value = cloneBoard(newestCurrent.payload.board)
      currentGameId.value = String(newestCurrent.id)
      await nextTick()
      suppressBoardPersist.value = false
      suppressCollectionWatcher.value = false
    } else {
      currentGameId.value = null
      board.value = []
    }
  } catch (error) {
    console.error('Fehler beim Laden der Bingo-Spiele', error)
    toast?.add({
      title: 'Daten konnten nicht geladen werden',
      description:
        'Die gespeicherten Bingo-Spiele konnten nicht geladen werden. Bitte versuche es später erneut.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    isLoadingRemoteGames.value = false
  }
}

watch(
  () => currentUserId.value,
  (id) => {
    if (id) {
      void loadRemoteGames()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (currentUserId.value) {
    void loadRemoteGames()
  }
})

function persistBoardState() {
  if (!process.client) return
  if (suppressBoardPersist.value) return
  const collection = selectedCollection.value
  if (!collection || !isValidBoard(board.value)) return

  if (isSyncingBoard.value) {
    boardSyncPending.value = true
    return
  }

  isSyncingBoard.value = true
  boardSyncPending.value = false

  const timestamp = new Date().toISOString()
  const payload: BingoBoardPayload = {
    kind: 'current',
    collectionId: collection.id,
    board: cloneBoard(board.value),
    updatedAt: timestamp,
  }

  const request = currentGameId.value
    ? updateItem('bingo_games', currentGameId.value, {
        collection: collection.id,
        board: serializeBoardPayload(payload),
        status: 'published',
      })
    : createItem('bingo_games', {
        collection: collection.id,
        board: serializeBoardPayload({
          ...payload,
          createdAt: timestamp,
        }),
        status: 'published',
      })

  useDirectus(request)
    .then((result) => {
      if (!currentGameId.value) {
        const createdRecord = result as DirectusBingoGameRecord | null
        if (createdRecord?.id) {
          currentGameId.value = String(createdRecord.id)
        }
      }
    })
    .catch((error) => {
      console.error('Bingo-Spiel konnte nicht gespeichert werden', error)
      toast?.add({
        title: 'Speichern fehlgeschlagen',
        description:
          'Das aktuelle Bingo konnte nicht gespeichert werden. Bitte versuche es erneut.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
    })
    .finally(() => {
      isSyncingBoard.value = false
      if (boardSyncPending.value) {
        boardSyncPending.value = false
        persistBoardState()
      }
    })
}

watch(
  board,
  () => {
    persistBoardState()
  },
  { deep: true }
)

watch(selectedCollectionId, async (newId, previousId) => {
  if (!process.client) return

  const resolvedId = resolveCollectionId(newId)

  if (resolvedId !== newId) {
    suppressCollectionWatcher.value = true
    selectedCollectionId.value = resolvedId
    await nextTick()
    suppressCollectionWatcher.value = false
    return
  }

  if (suppressCollectionWatcher.value) return
  if (resolvedId === previousId) return

  showCelebration.value = false
  const collection = resolvedId ? getCollectionById(resolvedId) : null
  if (collection) {
    board.value = buildBoard(collection)
  } else {
    board.value = []
    currentGameId.value = null
  }
})

watch(
  () => bingoCollections.value,
  async () => {
    if (!process.client) return
    sanitizeSavedBoards()
    const collections = bingoCollections.value
    if (!collections.length) {
      selectedCollectionId.value = ''
      return
    }

    const resolvedId =
      resolveCollectionId(selectedCollectionId.value) || collections[0].id

    if (resolvedId === selectedCollectionId.value) return
    suppressCollectionWatcher.value = true
    selectedCollectionId.value = resolvedId
    await nextTick()
    suppressCollectionWatcher.value = false
  }
)

const sortedSavedBoards = computed(() =>
  [...savedBoards.value]
    .filter((entry) => isValidBoard(entry.board))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
)

const saveSummaries = computed(() =>
  sortedSavedBoards.value.map((entry) => {
    const collection = getCollectionById(entry.collectionId)
    const completedLineCount = calculateCompletedLines(entry.board).length
    const activeCount = entry.board.filter(
      (cell) => cell.active && !cell.isFree
    ).length

    return {
      id: entry.id,
      name: entry.name,
      createdAt: entry.createdAt,
      collectionId: entry.collectionId,
      collectionName: collection?.title ?? 'Unbekannte Kollektion',
      activeCount,
      completedLineCount,
      playableCells,
    }
  })
)

function buildDefaultSaveName(): string {
  const now = new Date()
  const date = now.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Bingo vom ${date} um ${time} Uhr`
}

async function saveBoard(name?: string) {
  if (!process.client) return

  const collection = selectedCollection.value
  if (!collection) {
    toast?.add({
      title: 'Keine Kollektion ausgewählt',
      description: 'Bitte wähle zuerst eine Bingo-Kollektion aus.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  if (!isValidBoard(board.value)) {
    toast?.add({
      title: 'Bingo unvollständig',
      description:
        'Das aktuelle Bingo kann nicht gespeichert werden, da es unvollständig ist.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  const finalName = buildDefaultSaveName()
  const timestamp = new Date().toISOString()

  const existing = savedBoards.value.find(
    (entry) => entry.name.toLowerCase() === finalName.toLowerCase()
  )

  const payload: BingoBoardPayload = {
    kind: 'save',
    name: finalName,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    collectionId: collection.id,
    board: cloneBoard(board.value),
  }

  try {
    if (existing) {
      await useDirectus(
        updateItem('bingo_games', existing.id, {
          collection: collection.id,
          board: serializeBoardPayload(payload),
          status: 'published',
        })
      )
    } else {
      await useDirectus(
        createItem('bingo_games', {
          collection: collection.id,
          board: serializeBoardPayload(payload),
          status: 'published',
        })
      )
    }
    await loadRemoteGames()

    toast?.add({
      title: existing ? 'Spiel aktualisiert' : 'Spiel gespeichert',
      description: `"${finalName}" (${collection.title}) wurde ${
        existing ? 'überschrieben' : 'gesichert'
      }.`,
      color: 'primary',
      icon: 'i-lucide-save',
    })
  } catch (error) {
    console.error('Bingo-Spiel konnte nicht gespeichert werden', error)
    toast?.add({
      title: 'Speichern fehlgeschlagen',
      description:
        'Das Bingo-Spiel konnte nicht gespeichert werden. Bitte versuche es erneut.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

function quickSaveBoard() {
  void saveBoard()
}

async function loadSavedBoard(id: string) {
  const entry = savedBoards.value.find((save) => save.id === id)
  if (!entry) {
    toast?.add({
      title: 'Spiel nicht gefunden',
      description: 'Der ausgewählte Eintrag existiert nicht mehr.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  if (!isValidBoard(entry.board)) {
    await removeSavedBoard(id)
    toast?.add({
      title: 'Spiel beschädigt',
      description: 'Der Eintrag war ungültig und wurde entfernt.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  const resolvedId = resolveCollectionId(entry.collectionId)
  const collection = resolvedId ? getCollectionById(resolvedId) : null

  if (!collection) {
    await removeSavedBoard(id)
    toast?.add({
      title: 'Kollektion nicht verfügbar',
      description:
        'Die zugehörige Kollektion existiert nicht mehr und der Eintrag wurde entfernt.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  suppressCollectionWatcher.value = true
  suppressBoardPersist.value = true
  selectedCollectionId.value = collection.id
  board.value = cloneBoard(entry.board)
  await nextTick()
  suppressBoardPersist.value = false
  suppressCollectionWatcher.value = false
  persistBoardState()
  toast?.add({
    title: 'Spiel geladen',
    description: `"${entry.name}" (${collection.title}) wurde wiederhergestellt.`,
    color: 'primary',
    icon: 'i-lucide-rocket',
  })
}

async function removeSavedBoard(id: string) {
  if (!process.client) return
  const entry = savedBoards.value.find((save) => save.id === id)
  if (!entry) return

  try {
    await useDirectus(
      updateItem('bingo_games', id, {
        status: 'archived',
      })
    )
    await loadRemoteGames()
    toast?.add({
      title: 'Spiel gelöscht',
      description: `"${entry.name}" wurde entfernt.`,
      color: 'primary',
      icon: 'i-lucide-trash-2',
    })
  } catch (error) {
    console.error('Bingo-Spiel konnte nicht gelöscht werden', error)
    toast?.add({
      title: 'Löschen fehlgeschlagen',
      description: `"${entry.name}" konnte nicht gelöscht werden. Bitte versuche es erneut.`,
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

async function clearSavedBoards() {
  if (!process.client || !savedBoards.value.length) return

  const confirmClear = window.confirm(
    'Möchtest du wirklich alle gespeicherten Bingo-Spiele löschen?'
  )
  if (!confirmClear) return

  const ids = savedBoards.value.map((entry) => entry.id)

  const results = await Promise.allSettled(
    ids.map((entryId) =>
      useDirectus(
        updateItem('bingo_games', entryId, {
          status: 'archived',
        })
      )
    )
  )

  const hasRejections = results.some((result) => result.status === 'rejected')

  await loadRemoteGames()

  if (hasRejections) {
    console.error('Einige Bingo-Spiele konnten nicht gelöscht werden', results)
    toast?.add({
      title: 'Löschen teilweise fehlgeschlagen',
      description:
        'Einige Bingo-Spiele konnten nicht gelöscht werden. Bitte versuche es erneut.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  toast?.add({
    title: 'Speicher geleert',
    description: 'Alle gespeicherten Spiele wurden entfernt.',
    color: 'primary',
    icon: 'i-lucide-trash',
  })
}

onMounted(() => {
  sanitizeSavedBoards()
  persistBoardState()
})

function toggleCell(index: number) {
  const cell = board.value[index]
  if (!cell || cell.isFree) return

  cell.active = !cell.active
}

function shuffleBoard() {
  const collection = selectedCollection.value
  if (!collection) return
  showCelebration.value = false
  board.value = buildBoard(collection)
}

function resetBoard() {
  showCelebration.value = false
  board.value = board.value.map((cell) => ({
    ...cell,
    active: Boolean(cell.isFree),
  }))
}

const completedLines = computed<number[][]>(() =>
  calculateCompletedLines(board.value)
)

const completedCellIndices = computed<Set<number>>(() =>
  calculateCompletedCellIndices(board.value)
)
const hasBingo = computed(() => completedLines.value.length > 0)

watch(hasBingo, (value, previousValue) => {
  if (value && !previousValue) {
    showCelebration.value = true
  } else if (!value) {
    showCelebration.value = false
  }
})

function closeCelebration() {
  showCelebration.value = false
}

async function handleCelebrationExport() {
  await exportBoardAsImage()
  closeCelebration()
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const clampedRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + clampedRadius, y)
  ctx.lineTo(x + width - clampedRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius)
  ctx.lineTo(x + width, y + height - clampedRadius)
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - clampedRadius,
    y + height
  )
  ctx.lineTo(x + clampedRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius)
  ctx.lineTo(x, y + clampedRadius)
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y)
  ctx.closePath()
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = startY

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = candidate
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
}

async function exportBoardAsImage() {
  if (typeof window === 'undefined' || isExporting.value) return
  if (!selectedCollection.value) return

  isExporting.value = true

  try {
    const cells = board.value
    const completed = completedCellIndices.value

    const cellWidth = 240
    const cellHeight = 200
    const cellGap = 24
    const padding = 72
    const headerHeight = 150

    const gridWidth = boardSize * cellWidth + (boardSize - 1) * cellGap
    const gridHeight = boardSize * cellHeight + (boardSize - 1) * cellGap

    const canvasWidth = gridWidth + padding * 2
    const canvasHeight = gridHeight + padding * 2 + headerHeight

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Kein Canvas-Kontext verfügbar.')

    ctx.fillStyle = '#020617'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.fillStyle = '#0f172a'
    ctx.shadowColor = '#00ffe8'
    ctx.shadowBlur = 60
    drawRoundedRect(
      ctx,
      padding / 2,
      padding / 2,
      canvasWidth - padding,
      canvasHeight - padding,
      48
    )
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    const titleX = padding
    let titleY = padding + 60

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '600 52px "Inter", "Helvetica Neue", sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillText('AMS Bingo', titleX, titleY)

    ctx.font = '400 20px "Inter", "Helvetica Neue", sans-serif'
    ctx.fillStyle = 'rgba(226,232,240,0.78)'
    titleY += 30
    drawWrappedText(
      ctx,
      'Sammle Momente aus deinem Aris Management Alltag. Markiere deine Felder und teile dein Bingo mit der Crew.',
      titleX,
      titleY + 22,
      gridWidth,
      30
    )

    const boardTop = padding + headerHeight
    const boardLeft = padding

    ctx.font = '600 18px "Inter", "Helvetica Neue", sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'

    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index]
      const row = Math.floor(index / boardSize)
      const column = index % boardSize

      const x = boardLeft + column * (cellWidth + cellGap)
      const y = boardTop + row * (cellHeight + cellGap)

      const isCompleted = completed.has(index)

      drawRoundedRect(ctx, x, y, cellWidth, cellHeight, 28)
      ctx.save()
      if (cell.active) {
        const gradient = ctx.createLinearGradient(
          x,
          y,
          x + cellWidth,
          y + cellHeight
        )
        gradient.addColorStop(0, 'rgba(13,91,255,0.75)')
        gradient.addColorStop(1, 'rgba(13,91,255,0.25)')
        ctx.fillStyle = gradient
        ctx.shadowColor = '#00ffe8'
        ctx.shadowBlur = 36
      } else {
        ctx.fillStyle = 'rgba(15,23,42,0.65)'
      }
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.lineWidth = isCompleted ? 4 : 2
      ctx.strokeStyle = isCompleted
        ? 'rgba(125,179,255,0.9)'
        : cell.active
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(148,163,184,0.25)'
      drawRoundedRect(ctx, x, y, cellWidth, cellHeight, 28)
      ctx.stroke()
      ctx.restore()

      const textX = x + 26
      let textY = y + 52

      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = '600 16px "Inter", "Helvetica Neue", sans-serif'
      ctx.fillStyle = cell.active
        ? 'rgba(241,245,249,0.88)'
        : 'rgba(147,197,253,0.8)'
      ctx.fillText(cell.isFree ? 'FREI' : 'AMS', textX, textY)
      ctx.restore()

      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = '600 22px "Inter", "Helvetica Neue", sans-serif'
      ctx.fillStyle = cell.active ? '#f8fafc' : '#e2e8f0'
      textY += 32
      drawWrappedText(ctx, cell.label, textX, textY, cellWidth - 52, 28)
      ctx.restore()

      if (cell.isFree) {
        ctx.save()
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.font = '600 14px "Inter", "Helvetica Neue", sans-serif'
        ctx.fillStyle = 'rgba(148,197,253,0.7)'
        ctx.fillText('IMMER AKTIV', textX, y + cellHeight - 22)
        ctx.restore()
      }

      if (cell.active && !cell.isFree) {
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '600 20px "Inter", "Helvetica Neue", sans-serif'
        ctx.fillStyle = '#f8fafc'
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        const badgeX = x + cellWidth - 32
        const badgeY = y + 36
        ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0b5cff'
        ctx.globalAlpha = 1
        ctx.fillText('✓', badgeX, badgeY + 1)
        ctx.restore()
      }
    }

    const footerY = boardTop + gridHeight + 52
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '500 16px "Inter", "Helvetica Neue", sans-serif'
    ctx.fillStyle = 'rgba(148,163,184,0.8)'
    ctx.fillText(
      `Stand: ${new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })}`,
      padding,
      footerY
    )
    ctx.restore()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), 'image/png', 1)
    )
    if (!blob) throw new Error('Bild konnte nicht erstellt werden.')

    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `ams-bingo-${new Date()
      .toISOString()
      .slice(0, 10)}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)

    toast?.add({
      title: 'Bingo exportiert',
      description: 'Dein Bingo wurde als PNG heruntergeladen.',
      color: 'primary',
      icon: 'i-lucide-party-popper',
    })
  } catch (error) {
    console.error(error)
    toast?.add({
      title: 'Export fehlgeschlagen',
      description:
        error instanceof Error ? error.message : 'Bitte versuche es erneut.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="space-y-10 text-white">
    <AMSPageHeader
      icon="i-lucide-party-popper"
      title="AMS Bingo"
      description="Sammle Momente aus deinem AMS Alltag und teile dein Bingo mit der Crew."
    />

    <AMSPagesToolboxBingoCollectionSelect
      v-model="selectedCollectionId"
      :collections="collectionOptions"
    />

    <section
      v-if="selectedCollection"
      class="relative rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,14,28,0.92),rgba(2,6,23,0.88))] p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7"
    >
      <div
        class="mb-5 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.28em] text-white/50"
          >
            Aktive Kollektion
          </p>
          <p class="text-base font-semibold text-white">
            {{ selectedCollection.title }}
          </p>
          <p class="text-xs text-white/60">
            {{ selectedCollection.description }}
          </p>
        </div>
        <div
          class="text-xs font-semibold uppercase tracking-[0.28em] text-white/55"
        >
          Freifeld:
          <span class="ml-1 text-white">
            {{ selectedCollection.free_card || 'Technische Schwierigkeiten' }}
          </span>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-[26px] border border-white/12 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <AMSPagesToolboxBingoBoard
          :board="board"
          :completed-cell-indices="completedCellIndices"
          @toggle="toggleCell"
        />
      </div>
      <AMSPagesToolboxBingoSidePanel
        :is-exporting="isExporting"
        @save="quickSaveBoard"
        @export="exportBoardAsImage"
        @shuffle="shuffleBoard"
        @reset="resetBoard"
      />
    </section>
    <section
      v-else
      class="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,14,28,0.92),rgba(2,6,23,0.88))] p-6 text-center text-sm text-white/70 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8"
    >
      <p class="mx-auto max-w-md">
        Bitte wähle eine Bingo-Kollektion aus der Liste oben aus, um ein Board
        zu erstellen.
      </p>
    </section>

    <AMSPagesToolboxBingoMobileActions
      v-if="selectedCollection"
      class="lg:hidden"
      :is-exporting="isExporting"
      @save="quickSaveBoard"
      @export="exportBoardAsImage"
      @shuffle="shuffleBoard"
      @reset="resetBoard"
    />

    <AMSPagesToolboxBingoStatusBanner
      v-if="selectedCollection"
      :show="hasBingo"
      :line-count="completedLines.length"
    />

    <AMSPagesToolboxBingoSaves
      :saves="saveSummaries"
      @save="saveBoard"
      @load="loadSavedBoard"
      @delete="removeSavedBoard"
      @clear="clearSavedBoards"
    />
  </div>

  <AMSPagesToolboxBingoCelebration
    v-if="selectedCollection"
    :show="showCelebration"
    :line-count="completedLines.length"
    :is-exporting="isExporting"
    @close="closeCelebration"
    @export="handleCelebrationExport"
  />
</template>
