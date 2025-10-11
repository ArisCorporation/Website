<script lang="ts" setup>
/**
 * AMS Toolbox Bingo page
 *
 * Handles loading Directus bingo collections, board generation, realtime sync,
 * persistence and UI state for the toolbox view.
 */
import { createItem, readItems, updateItem } from '@directus/sdk'
import { storeToRefs } from 'pinia'
import { useToast, useNuxtApp } from '#imports'
import type { BingoCollection as DirectusBingoCollection } from '~~/types'
import { useAuthStore } from '~/stores/auth'

/** Bingo cell state for individual board entries. */
type BingoCell = {
  id: string
  label: string
  active: boolean
  isFree?: boolean
}

/** Normalized Directus bingo collection data used throughout the page. */
type NormalizedBingoCollection = {
  id: string
  title: string
  description: string
  free_card: string
  phrases: string[]
}

/** Local representation of a saved bingo board entry. */
type BingoBoardSave = {
  id: string
  name: string
  createdAt: string
  board: BingoCell[]
  collectionId: string
}

/** Payload structure persisted to Directus for current/save board states. */
type BingoBoardPayload = {
  kind: 'current' | 'save'
  collectionId: string
  board: BingoCell[]
  name?: string
  createdAt?: string
  updatedAt?: string
}

/** Raw Directus record describing a bingo game entry. */
type DirectusBingoGameRecord = {
  id: string
  collection?: { id?: string | null } | string | null
  board?: unknown
  date_created?: string | null
  date_updated?: string | null
  status?: string | null
  has_bingo?: boolean | null
  line_count?: number | null
  user_created?:
    | string
    | null
    | {
        id?: string | null
        first_name?: string | null
        last_name?: string | null
      }
}

/** Dimensions and derived indices for the square bingo board. */
const boardSize = 5
const centerIndex = Math.floor((boardSize * boardSize) / 2)
const totalCells = boardSize * boardSize
const playableCells = totalCells - 1

/** Resolve a valid collection id from the varying Directus response formats. */
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

/** Normalize a single phrase entry (string or object) into text. */
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

/** Convert any phrase source value into a cleaned phrase list. */
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

/** Map a Directus bingo collection into the normalized internal shape. */
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

/** Fetch published Directus bingo collections on initial render. */
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

/** Reactive list of available bingo collections. */
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
const nuxtApp = useNuxtApp()
const authStore = useAuthStore()
const { currentUserId } = storeToRefs(authStore)

/** Core reactive state for the currently selected collection and board. */
const selectedCollectionId = ref<string>('')
const savedBoards = ref<BingoBoardSave[]>([])
const currentGameId = ref<string | null>(null)
const isSyncingBoard = ref(false)
const isLoadingRemoteGames = ref(false)
const boardSyncPending = ref(false)
const suppressBoardPersist = ref(false)
const realtimeUnsubscribe = ref<(() => void) | null>(null)
let realtimeAbortController: AbortController | null = null
let currentRealtimeCollectionId: string | null = null
/** Tracks remote bingo notifications to prevent duplicate toasts. */
const realtimeNotifiedIds = new Set<string>()
/** Holds the latest remote bingo alert details for the floating banner. */
const remoteBingoAlert = ref<{
  playerName: string
  collectionName: string
  lineCount: number
} | null>(null)
let remoteBingoAlertTimeout: number | null = null

/** Currently selected collection derived from the chosen id. */
const selectedCollection = computed<NormalizedBingoCollection | null>(
  () => getCollectionById(selectedCollectionId.value) ?? null
)

/** Dropdown options for the collection selector including counts. */
const collectionOptions = computed(() =>
  bingoCollections.value.map(({ id, title, description, phrases }) => ({
    id,
    title,
    description,
    phraseCount: phrases.length,
  }))
)

/** Find a normalized collection by its identifier. */
function getCollectionById(
  id: string | undefined
): NormalizedBingoCollection | null {
  return (
    bingoCollections.value.find((collection) => collection.id === id) ?? null
  )
}

/** Guard against legacy ids by verifying the collection is still available. */
function resolveCollectionId(id: string | undefined | null): string {
  const collection = id ? getCollectionById(id) : null
  return collection ? collection.id : ''
}

/** Build a randomized board with a free center cell for the collection. */
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

/** Clone a board to avoid mutating shared references. */
function cloneBoard(cells: BingoCell[]): BingoCell[] {
  return cells.map((cell) => ({ ...cell }))
}

/** Validate and normalize persisted board payloads coming from Directus. */
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

/** Serialize a board payload before storing it in Directus. */
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

/** Check whether a set of cells represents a fully-formed board. */
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

/** Remove any outdated saves once the collection list changes. */
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

/** Calculate every completed line (rows, columns, diagonals) on the board. */
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

/** Create a quick lookup set for all cells that belong to a completed line. */
function calculateCompletedCellIndices(cells: BingoCell[]): Set<number> {
  return new Set(calculateCompletedLines(cells).flat())
}

/** UI state toggles for board rendering and derived behaviour. */
const board = ref<BingoCell[]>([])
const isExporting = ref(false)
const showCelebration = ref(false)
const suppressCollectionWatcher = ref(false)

/** Load current and saved bingo games for the authenticated user. */
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
          'has_bingo',
          'line_count',
          'user_created.id',
          'user_created.first_name',
          'user_created.last_name',
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

    if (process.client) {
      void subscribeToRealtime(selectedCollectionId.value)
    }
  } catch (error) {
    console.error('Fehler beim Laden der Bingo-Spiele', error)
    toast?.add({
      title: 'Daten konnten nicht geladen werden',
      description:
        'Die gespeicherten Bingo-Spiele konnten nicht geladen werden. Bitte versuche es später erneut.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    isLoadingRemoteGames.value = false
  }
}

/** Remove the active Directus realtime subscription and reset guards. */
function stopRealtimeSubscription() {
  if (realtimeUnsubscribe.value) {
    try {
      realtimeUnsubscribe.value()
    } catch (error) {
      console.error('Realtime-Abo konnte nicht beendet werden', error)
    }
    realtimeUnsubscribe.value = null
  }
  if (realtimeAbortController) {
    realtimeAbortController.abort()
    realtimeAbortController = null
  }
  currentRealtimeCollectionId = null
  realtimeNotifiedIds.clear()
}

/** Subscribe to Directus updates for the active collection to surface bingo wins. */
async function subscribeToRealtime(collectionId: string) {
  if (!process.client) return
  if (!collectionId) {
    stopRealtimeSubscription()
    return
  }
  if (currentRealtimeCollectionId === collectionId) return

  stopRealtimeSubscription()

  const directusClient = nuxtApp.$directus as any

  if (typeof directusClient?.subscribe !== 'function') {
    console.warn('Directus Realtime ist nicht verfügbar.')
    return
  }

  try {
    if (typeof directusClient?.auth?.refresh === 'function') {
      try {
        await directusClient.auth.refresh()
      } catch (error) {
        console.warn('Directus-Token konnte nicht aktualisiert werden.', error)
      }
    }

    const { subscription, unsubscribe } = await directusClient.subscribe(
      'bingo_games',
      {
        event: 'update',
        query: {
          fields: [
            'id',
            'has_bingo',
            'line_count',
            'status',
            'collection',
            'user_created.id',
            'user_created.first_name',
            'user_created.last_name',
          ],
          filter: {
            collection: { _eq: collectionId },
            status: { _eq: 'published' },
          },
        },
      }
    )

    currentRealtimeCollectionId = collectionId
    realtimeAbortController = new AbortController()
    realtimeUnsubscribe.value = () => {
      unsubscribe()
      if (realtimeAbortController) {
        realtimeAbortController.abort()
        realtimeAbortController = null
      }
    }

    ;(async () => {
      try {
        for await (const message of subscription) {
          if (realtimeAbortController?.signal.aborted) break
          if (!message) continue

          if (message.type === 'init') {
            continue
          }

          const isMutationUpdate =
            message.type === 'mutation' && message.event === 'update'
          const isSubscriptionUpdate =
            message.type === 'subscription' && message.event === 'update'

          if (!isMutationUpdate && !isSubscriptionUpdate) {
            continue
          }

          const records = Array.isArray(message.data)
            ? (message.data as DirectusBingoGameRecord[])
            : [message.data as DirectusBingoGameRecord | null | undefined]

          for (const recordLike of records) {
            if (!recordLike) continue

            const record = recordLike as DirectusBingoGameRecord
            if (!record.id) continue

            if (record.status === 'archived') {
              realtimeNotifiedIds.delete(record.id)
              continue
            }

            const recordCollectionId = extractCollectionId(record.collection)
            if (!recordCollectionId || recordCollectionId !== collectionId) {
              continue
            }

            if (!record.has_bingo) {
              realtimeNotifiedIds.delete(record.id)
              continue
            }

            const authorId =
              typeof record.user_created === 'object'
                ? record.user_created?.id ?? null
                : typeof record.user_created === 'string'
                ? record.user_created
                : null

            if (authorId && authorId === currentUserId.value) {
              continue
            }

            if (realtimeNotifiedIds.has(record.id)) continue
            realtimeNotifiedIds.add(record.id)

            const collection = getCollectionById(recordCollectionId)
            const nameParts: string[] = []
            if (
              record.user_created &&
              typeof record.user_created === 'object'
            ) {
              const firstName = record.user_created.first_name?.trim()
              const lastName = record.user_created.last_name?.trim()
              if (firstName) nameParts.push(firstName)
              if (lastName) nameParts.push(lastName)
            }

            const playerName = nameParts.join(' ') || 'Ein Crew-Mitglied'
            const collectionName = collection?.title ?? 'AMS Bingo'
            const lineCount = record.line_count ?? 1

            toast?.add({
              title: 'Bingo!',
              description: `${playerName} hat gerade ein Bingo (${lineCount} ${
                lineCount === 1 ? 'Linie' : 'Linien'
              }) in "${collectionName}" geschafft.`,
              color: 'primary',
              icon: 'i-lucide-party-popper',
              timeout: 6000,
            })

            if (process.client) {
              remoteBingoAlert.value = {
                playerName,
                collectionName,
                lineCount,
              }
              if (remoteBingoAlertTimeout) {
                window.clearTimeout(remoteBingoAlertTimeout)
              }
              remoteBingoAlertTimeout = window.setTimeout(() => {
                remoteBingoAlert.value = null
                remoteBingoAlertTimeout = null
              }, 6000)
            }
          }
        }
      } catch (error) {
        if (!realtimeAbortController?.signal.aborted) {
          console.error('Realtime-Übertragung beendet', error)
        }
      }
    })()
  } catch (error) {
    console.error('Realtime-Abo konnte nicht gestartet werden', error)
    stopRealtimeSubscription()
  }
}

// Keep local state aligned with authentication changes.
// Push every board adjustment to Directus.
watch(
  () => currentUserId.value,
  (id) => {
    if (id) {
      void loadRemoteGames()
    } else {
      stopRealtimeSubscription()
    }
  },
  { immediate: true }
)

// Load games as soon as the component mounts when a user is present.
// Clean up stale saves and push the initial board snapshot after hydration.
onMounted(() => {
  if (currentUserId.value) {
    void loadRemoteGames()
  }
})

// Ensure subscriptions and timeouts are cleared when leaving the page.
onBeforeUnmount(() => {
  stopRealtimeSubscription()
  if (remoteBingoAlertTimeout) {
    window.clearTimeout(remoteBingoAlertTimeout)
    remoteBingoAlertTimeout = null
  }
})

/** Persist the current board to Directus while debouncing rapid updates. */
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
  const lineCount = calculateCompletedLines(board.value).length
  const hasBingoNow = lineCount > 0
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
        has_bingo: hasBingoNow,
        line_count: lineCount,
      })
    : createItem('bingo_games', {
        collection: collection.id,
        board: serializeBoardPayload({
          ...payload,
          createdAt: timestamp,
        }),
        status: 'published',
        has_bingo: hasBingoNow,
        line_count: lineCount,
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
        color: 'red',
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

// Maintain realtime subscription whenever the active combination changes.
watch(
  board,
  () => {
    persistBoardState()
  },
  { deep: true }
)

watch(
  () => [selectedCollectionId.value, currentUserId.value] as const,
  ([collectionId, userId]) => {
    if (!process.client) return
    if (!collectionId || !userId) {
      stopRealtimeSubscription()
      return
    }
    void subscribeToRealtime(collectionId)
  },
  { immediate: true }
)

// Rebuild the board when a different collection is selected.
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

// Ensure saves remain valid once the collection catalogue updates.
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

/** Saved boards ordered by newest first and filtered to valid payloads. */
const sortedSavedBoards = computed(() =>
  [...savedBoards.value]
    .filter((entry) => isValidBoard(entry.board))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
)

/** Lightweight save metadata exposed to the UI components. */
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

/** Create a deterministic default name when the user skips manual naming. */
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

/** Persist the current board as a save entry (create or update). */
async function saveBoard(name?: string) {
  if (!process.client) return

  const collection = selectedCollection.value
  if (!collection) {
    toast?.add({
      title: 'Keine Kollektion ausgewählt',
      description: 'Bitte wähle zuerst eine Bingo-Kollektion aus.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  if (!isValidBoard(board.value)) {
    toast?.add({
      title: 'Bingo unvollständig',
      description:
        'Das aktuelle Bingo kann nicht gespeichert werden, da es unvollständig ist.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  const finalName = (name ?? '').trim() || buildDefaultSaveName()
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
          has_bingo: false,
          line_count: 0,
        })
      )
    } else {
      await useDirectus(
        createItem('bingo_games', {
          collection: collection.id,
          board: serializeBoardPayload(payload),
          status: 'published',
          has_bingo: false,
          line_count: 0,
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

/** Shortcut action that saves the board using a generated name. */
function quickSaveBoard() {
  void saveBoard()
}

/** Load an archived board entry back into the active state. */
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

/** Archive a single saved entry and refresh the local list. */
async function removeSavedBoard(id: string) {
  if (!process.client) return
  const entry = savedBoards.value.find((save) => save.id === id)
  if (!entry) return

  try {
    await useDirectus(
      updateItem('bingo_games', id, {
        status: 'archived',
        has_bingo: false,
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

/** Archive all saved entries after receiving confirmation from the user. */
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
          has_bingo: false,
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

/** Toggle a cell's active state unless it is the permanent free field. */
function toggleCell(index: number) {
  const cell = board.value[index]
  if (!cell || cell.isFree) return

  cell.active = !cell.active
}

/** Generate a fresh randomized board for the current collection. */
function shuffleBoard() {
  const collection = selectedCollection.value
  if (!collection) return
  showCelebration.value = false
  board.value = buildBoard(collection)
}

/** Reset the current board while keeping the free field active. */
function resetBoard() {
  showCelebration.value = false
  board.value = board.value.map((cell) => ({
    ...cell,
    active: Boolean(cell.isFree),
  }))
}

/** Track all currently completed lines for styling and celebration logic. */
const completedLines = computed<number[][]>(() =>
  calculateCompletedLines(board.value)
)

/** Flattened cell index lookup for completed lines. */
const completedCellIndices = computed<Set<number>>(() =>
  calculateCompletedCellIndices(board.value)
)
/** True whenever at least one line is completed. */
const hasBingo = computed(() => completedLines.value.length > 0)

// Trigger the celebration overlay when the board transitions into a bingo.
watch(hasBingo, (value, previousValue) => {
  if (value && !previousValue) {
    showCelebration.value = true
  } else if (!value) {
    showCelebration.value = false
  }
})

/** Hide the celebration overlay without changing board state. */
function closeCelebration() {
  showCelebration.value = false
}

/** Export the board from the celebration view and close it afterwards. */
async function handleCelebrationExport() {
  await exportBoardAsImage()
  closeCelebration()
}

/** Draw a rounded rectangle path on the provided canvas context. */
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

/** Render multi-line text within a fixed width, returning the final y offset. */
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

/** Render the current board into a styled PNG and trigger a download. */
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
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="remoteBingoAlert"
        class="fixed left-1/2 top-6 z-50 w-[90vw] max-w-xl -translate-x-1/2 rounded-2xl border border-(--ui-primary)/40 bg-[rgba(12,18,37,0.96)] px-6 py-4 text-sm text-white shadow-[0_24px_60px_-30px_rgba(15,90,255,0.65)] backdrop-blur"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-(--ui-primary)/90 text-white shadow-[0_10px_30px_rgba(15,90,255,0.45)]"
          >
            <UIcon name="i-lucide-party-popper" class="h-4 w-4" />
          </span>
          <div class="space-y-1 text-left">
            <p class="text-sm font-semibold">
              {{ remoteBingoAlert.playerName }} hat ein Bingo!
            </p>
            <p class="text-xs text-white/70">
              {{ remoteBingoAlert.collectionName }} ·
              {{ remoteBingoAlert.lineCount }}
              {{ remoteBingoAlert.lineCount === 1 ? 'Linie' : 'Linien' }}
            </p>
          </div>
        </div>
      </div>
    </Transition>

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
        class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6"
      >
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
      </div>
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
