<script setup lang="ts">
import { mergeAttributes, type Editor } from '@tiptap/core'
import type { DirectusFile, DirectusUser } from '~~/types'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Mention from '@tiptap/extension-mention'
import { VueRenderer, VueNodeViewRenderer } from '@tiptap/vue-3'
import tippy, { type Instance as TippyInstance } from 'tippy.js'

import EditorMentionList from './mention-list.vue'
import EditorMentionChip from './mention-chip.vue'

const model = defineModel<string>()

const props = defineProps<{
  readOnly?: boolean
  simpleMode?: boolean
}>()

interface MentionSuggestionItem {
  id: string
  label: string
  alias?: string
  slug?: string
  department?: string | null
  avatarUrl?: string
  position?: string | null
  headOfDepartment?: boolean | null
  profileUrl: string
  searchTokens: string[]
}

const mentionableUsers = ref<MentionSuggestionItem[]>([])
const mentionSuggestionLimit = 8
const mentionFetchPending = ref(false)

const mentionableUsersById = computed(() => {
  const map = new Map<string, MentionSuggestionItem>()
  for (const user of mentionableUsers.value) {
    map.set(user.id, user)
  }
  return map
})

const mentionableUsersBySlug = computed(() => {
  const map = new Map<string, MentionSuggestionItem>()
  for (const user of mentionableUsers.value) {
    if (user.slug) {
      map.set(user.slug, user)
    }
  }
  return map
})

const mentionableUsersByLabel = computed(() => {
  const map = new Map<string, MentionSuggestionItem>()
  for (const user of mentionableUsers.value) {
    map.set(user.label.toLowerCase(), user)
  }
  return map
})

let mentionHydrationFrame: number | null = null

const findMentionUser = (attrs: Record<string, unknown>): MentionSuggestionItem | undefined => {
  const id = typeof attrs.id === 'string' && attrs.id ? attrs.id : null
  const slugAttr = typeof attrs.slug === 'string' && attrs.slug ? attrs.slug : null
  const labelAttr = typeof attrs.label === 'string' && attrs.label ? attrs.label : null

  if (id) {
    const byId = mentionableUsersById.value.get(id)
    if (byId) {
      return byId
    }
  }

  if (slugAttr) {
    const bySlug = mentionableUsersBySlug.value.get(slugAttr)
    if (bySlug) {
      return bySlug
    }
  }

  if (id) {
    const bySlugFromId = mentionableUsersBySlug.value.get(id)
    if (bySlugFromId) {
      return bySlugFromId
    }
  }

  if (labelAttr) {
    const byLabel = mentionableUsersByLabel.value.get(labelAttr.toLowerCase())
    if (byLabel) {
      return byLabel
    }
  }

  return undefined
}

const hydrateEditorMentions = () => {
  const instance = unref(editor)
  if (!instance || !mentionableUsers.value.length) {
    return
  }

  const { state } = instance
  let tr = state.tr
  let changed = false

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'mention') {
      return
    }

    const attrs = node.attrs ?? {}
    const user = findMentionUser(attrs)
    if (!user) {
      return
    }

    const desiredAttrs = {
      ...attrs,
      id: user.id,
      label: user.label,
      alias: user.alias ?? null,
      slug: user.slug ?? null,
      avatarUrl: user.avatarUrl ?? null,
      department: user.department ?? null,
      position: user.position ?? null,
      headOfDepartment: user.headOfDepartment ?? null,
      profileUrl: user.profileUrl,
    }

    const keys: Array<keyof typeof desiredAttrs> = [
      'id',
      'label',
      'alias',
      'slug',
      'avatarUrl',
      'department',
      'position',
      'headOfDepartment',
      'profileUrl',
    ]

    const needsUpdate = keys.some((key) => {
      const currentVal = attrs[key] ?? null
      const nextVal = desiredAttrs[key] ?? null
      return currentVal !== nextVal
    })

    if (needsUpdate) {
      tr = tr.setNodeMarkup(pos, undefined, desiredAttrs)
      changed = true
    }
  })

  if (changed) {
    instance.view.dispatch(tr)
  }
}

const scheduleMentionHydration = () => {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame === 'undefined') {
    hydrateEditorMentions()
    return
  }

  if (mentionHydrationFrame !== null) {
    window.cancelAnimationFrame(mentionHydrationFrame)
  }

  mentionHydrationFrame = window.requestAnimationFrame(() => {
    mentionHydrationFrame = null
    hydrateEditorMentions()
  })
}

const MEDIA_ASSET_FOLDER_ID = 'c558dbe9-3f85-4c86-bdac-7b4988cde5c5'

const runtimeConfig = useRuntimeConfig()

const assetsBaseUrl = computed(() => {
  const raw = runtimeConfig.public?.ASSETS_URL ?? ''
  if (!raw) {
    return ''
  }
  return raw.endsWith('/') ? raw : `${raw}/`
})

const apiAssetsBaseUrl = computed(() => {
  const raw = runtimeConfig.public?.API_URL ?? ''
  if (!raw) {
    return ''
  }
  const normalized = raw.endsWith('/') ? raw.slice(0, -1) : raw
  return `${normalized}/assets/`
})

const normalizeAssetIdentifier = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.startsWith('assets/') ? value.slice(7) : value
}

const buildAssetSrc = (value: string): string => {
  if (!value) {
    return ''
  }
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  const assetId = normalizeAssetIdentifier(value)
  if (assetsBaseUrl.value) {
    return `${assetsBaseUrl.value}${assetId}`
  }
  if (apiAssetsBaseUrl.value) {
    return `${apiAssetsBaseUrl.value}${assetId}`
  }
  return `assets/${assetId}`
}

const resolveUserDisplayName = (user: DirectusUser): string => {
  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''
  const name = [first, last].filter(Boolean).join(' ')
  if (name) {
    return name
  }
  if (user.discord_name) {
    return user.discord_name
  }
  if (user.slug) {
    return user.slug
  }
  if (user.email) {
    return user.email
  }
  return 'Unbekanntes Mitglied'
}

const resolveUserDepartment = (user: DirectusUser): string | null => {
  const department = user.primary_department
  if (department && typeof department !== 'string') {
    return department.name ?? null
  }
  return null
}

const resolveUserAvatarId = (user: DirectusUser): string => {
  if (!user.avatar) {
    return ''
  }
  if (typeof user.avatar === 'string') {
    return user.avatar
  }
  return user.avatar.id ?? ''
}

const resolveUserPosition = (user: DirectusUser): string | null => {
  const title = user.title?.trim()
  if (title) {
    return title
  }

  const role = user.role
  if (role && typeof role !== 'string') {
    return role.label ?? role.name ?? null
  }

  return null
}

const buildProfileUrl = (user: DirectusUser): string => `/ams/employees/${user.id}`

const loadMentionableUsers = async () => {
  if (mentionFetchPending.value) {
    return
  }

  mentionFetchPending.value = true
  try {
    const users = (await useDirectus(
      readUsers({
        filter: {
          status: { _eq: 'active' },
          hidden: { _neq: true },
          api_account: { _neq: true },
        },
        fields: [
          'id',
          'first_name',
          'last_name',
          'title',
          'slug',
          'discord_name',
          'email',
          'avatar',
          'head_of_department',
          { primary_department: ['name'] },
          { role: ['name', 'label'] },
        ],
        sort: ['first_name', 'last_name'],
        limit: 250,
      })
    )) as DirectusUser[]

    mentionableUsers.value = users.map((user) => {
      const label = resolveUserDisplayName(user)
      const avatarId = resolveUserAvatarId(user)
      const department = resolveUserDepartment(user)
      const position = resolveUserPosition(user)
      const slug = user.slug?.trim() ?? ''
      const headOfDepartment = Boolean(user.head_of_department)
      const profileUrl = buildProfileUrl(user)
      const aliasValue = user.discord_name?.trim() ?? ''
      const tokens = [
        label,
        aliasValue,
        user.slug ?? '',
        user.email ?? '',
        position ?? '',
        department ?? '',
      ]
        .filter(Boolean)
        .map((token) => String(token).toLowerCase())
      if (headOfDepartment) {
        tokens.push('abteilungsleiter', 'leitung')
      }

      return {
        id: user.id,
        label,
        alias: user.discord_name?.trim() || undefined,
        slug: slug || undefined,
        department,
        avatarUrl: avatarId ? buildAssetSrc(avatarId) : undefined,
        position,
        headOfDepartment,
        profileUrl,
        searchTokens: tokens,
      } satisfies MentionSuggestionItem
    })
    scheduleMentionHydration()
  } catch (error) {
    console.error('Editor mention user fetch failed:', error)
  } finally {
    mentionFetchPending.value = false
  }
}

onMounted(() => {
  void loadMentionableUsers()
})

const editorMediaModalOpen = ref(false)
const editorMediaLibraryOpen = ref(false)
const editorMediaUploading = ref(false)
const editorMediaAssetId = ref('')
const editorMediaName = ref('')
const editorFileInput = ref<DirectusFile | null | undefined>(null)

const editorMediaPreview = computed(() =>
  editorMediaAssetId.value ? getAssetId(editorMediaAssetId.value) : ''
)

const editorMediaSrc = computed(() => buildAssetSrc(editorMediaAssetId.value))

const canInsertMedia = computed(
  () => Boolean(editorMediaSrc.value) && !editorMediaUploading.value
)

const editorHeight = computed(() => (props.simpleMode ? '120px' : '100%'))

const LinkExtended = Link.extend({
  priority: 10,
  parseHTML () {
    return [
      {
        tag: 'a[href]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const isMention =
            el.dataset?.mention === 'user' ||
            el.classList.contains('mention') ||
            el.getAttribute('data-type') === 'mention' ||
            el.hasAttribute('data-mention-id')

          if (isMention) {
            return false
          }

          return null
        },
      },
    ]
  },
})

const MentionWithLink = Mention.extend({
  addOptions () {
    return {
      ...(this.parent?.() ?? {}),
      HTMLAttributes: {
        class:
          'mention inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'data-mention': 'user',
      },
    }
  },
  addAttributes () {
    const parentAttributes = this.parent?.()
    const toDatasetKey = (key: string) =>
      key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())

    const readDataset = (element: Element, key: string): string | null => {
      const attr = element.getAttribute(`data-${key}`)
      if (attr && attr.trim()) {
        return attr
      }
      if ('dataset' in element) {
        const datasetKey = toDatasetKey(key)
        const value = (element as HTMLElement).dataset?.[datasetKey]
        if (value && value.trim()) {
          return value
        }
      }
      return null
    }

    const readMultiple = (element: Element, keys: string[]): string | null => {
      for (const key of keys) {
        const value =
          key.startsWith('data-')
            ? element.getAttribute(key)
            : readDataset(element, key)
        if (value && value.trim()) {
          return value
        }
      }
      return null
    }

    const getIdFromHref = (href: string | null | undefined): string | null => {
      if (!href) {
        return null
      }
      try {
        const url = new URL(href, 'http://dummy.local')
        const segments = url.pathname.split('/').filter(Boolean)
        return segments.at(-1) ?? null
      } catch {
        const parts = href.split('/').filter(Boolean)
        return parts.at(-1) ?? null
      }
    }

    return {
      ...(parentAttributes ?? {}),
      id: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-id',
            'mention_id',
            'data-mention-id',
            'id',
            'data-id',
          ]) ?? getIdFromHref(element.getAttribute('href')),
      },
      label: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-label',
            'mention_label',
            'data-mention-label',
            'label',
            'data-label',
          ]) ?? element.textContent?.trim() ?? null,
      },
      avatarUrl: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-avatar',
            'mention_avatar',
            'data-mention-avatar',
            'avatar',
            'data-avatar',
          ]),
      },
      alias: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-alias',
            'mention_alias',
            'data-mention-alias',
            'alias',
            'data-alias',
          ]),
      },
      slug: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-slug',
            'mention_slug',
            'data-mention-slug',
            'slug',
            'data-slug',
          ]),
      },
      department: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-department',
            'mention_department',
            'data-mention-department',
            'department',
            'data-department',
          ]),
      },
      position: {
        default: null,
        parseHTML: (element) =>
          readMultiple(element, [
            'mention-position',
            'mention_position',
            'data-mention-position',
            'position',
            'data-position',
          ]),
      },
      headOfDepartment: {
        default: null,
        parseHTML: (element) => {
          const raw = readMultiple(element, [
            'mention-head-of-department',
            'mention_head_of_department',
            'data-mention-head-of-department',
            'head-of-department',
            'data-head-of-department',
          ])
          if (raw === null) {
            return null
          }
          return raw === 'true' || raw === '1'
        },
      },
      profileUrl: {
        default: null,
        parseHTML: (element) => element.getAttribute('href'),
      },
    }
  },
  parseHTML () {
    const parentConfig = this.parent?.()
    return [
      ...(parentConfig ?? []),
      { tag: `a[data-type="${this.name}"]` },
      { tag: 'a[data-mention-id]' },
      { tag: 'a[data-mention="user"]' },
      { tag: 'a.mention[data-id]' },
      { tag: 'a.mention[data-label]' },
      { tag: 'a.mention' },
    ]
  },
  renderHTML ({ node }) {
    const id = node.attrs.id
    const rawLabel = node.attrs.label ?? node.attrs.id ?? ''
    const label = String(rawLabel)
    const avatarUrl = node.attrs.avatarUrl ?? ''
    const alias = node.attrs.alias ?? ''
    const department = node.attrs.department ?? ''
    const position = node.attrs.position ?? ''
    const profileUrl = node.attrs.profileUrl ?? `/ams/employees/${id}`

    const attrs = mergeAttributes(this.options.HTMLAttributes, {
      'data-type': this.name,
      'data-mention': 'user',
      'data-id': id,
      'data-label': label || undefined,
      'data-alias': alias || undefined,
      'data-avatar': avatarUrl || undefined,
      'data-department': department || undefined,
      'data-position': position || undefined,
      'data-head-of-department': node.attrs.headOfDepartment ? 'true' : undefined,
      'data-mention-id': id || undefined,
      'data-mention-label': label || undefined,
      'data-mention-alias': alias || undefined,
      'data-mention-slug': node.attrs.slug || undefined,
      'data-mention-avatar': avatarUrl || undefined,
      'data-mention-department': department || undefined,
      'data-mention-position': position || undefined,
      'data-mention-head-of-department': node.attrs.headOfDepartment ? 'true' : undefined,
      'data-slug': node.attrs.slug || undefined,
      class: 'mention',
      href: profileUrl,
      'aria-label': label ? `Profil von ${label}` : undefined,
      title: [alias || '', position, department].filter(Boolean).join(' • ') || undefined,
      contenteditable: 'false',
      target: '_blank',
      rel: 'noopener noreferrer',
    })

    return ['a', attrs, label]
  },
  addNodeView () {
    return VueNodeViewRenderer(EditorMentionChip)
  },
})

const mentionExtension = MentionWithLink.configure({
  renderLabel: ({ node }) => {
    const label = node.attrs.label ?? node.attrs.id ?? ''
    return label ? `${label}` : ''
  },
  suggestion: {
    char: '@',
    startOfLine: false,
    items: ({ query }) => {
      if (!mentionableUsers.value.length && !mentionFetchPending.value) {
        void loadMentionableUsers()
      }

      const normalizedQuery = query.trim().toLowerCase()
      const candidates = mentionableUsers.value

      if (!normalizedQuery) {
        return candidates.slice(0, mentionSuggestionLimit)
      }

      return candidates
        .filter((item) =>
          item.searchTokens.some((token) => token.includes(normalizedQuery))
        )
        .slice(0, mentionSuggestionLimit)
    },
    render: () => {
      let component: VueRenderer | null = null
      let popup: TippyInstance | null = null

      return {
        onStart: (props) => {
          component = new VueRenderer(EditorMentionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect || !component?.element) {
            return
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'mention-suggestion',
            zIndex: 9999,
          })[0]
        },
        onUpdate: (props) => {
          component?.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup?.setProps({
            getReferenceClientRect: props.clientRect,
          })
        },
        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup?.hide()
            return true
          }

          const handler = component?.ref?.onKeyDown
          if (handler) {
            return handler(props)
          }

          return false
        },
        onExit: () => {
          popup?.destroy()
          popup = null
          component?.destroy()
          component = null
        },
      }
    },
  },
})

const editor = useEditor({
  editable: !props.readOnly,
  content: model.value,
  extensions: [
    TiptapStarterKit.configure({
      heading: {
        levels: [2, 3, 4, 5],
      },
      gapcursor: false,
      dropcursor: false,
    }),
    Underline,
    LinkExtended,
    mentionExtension,
    TextAlign,
    CharacterCount,
    Image,
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML()
  },
  onCreate: () => {
    scheduleMentionHydration()
  },
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && mentionHydrationFrame !== null) {
    window.cancelAnimationFrame(mentionHydrationFrame)
    mentionHydrationFrame = null
  }
  unref(editor)?.destroy()
})

const runEditorCommand = (command: (editor: Editor) => void) => {
  const instance = unref(editor)
  if (!instance) {
    return
  }

  command(instance)
}

const tableMenuItems = computed(() => {
  const instance = unref(editor)
  const canModifyTable = instance?.isActive('table') ?? false

  return [
    [
      {
        label: 'Tabelle (3×3) einfügen',
        icon: 'i-lucide-table',
        disabled: !instance,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          ),
      },
    ],
    [
      {
        label: 'Zeile oben einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addRowBefore().run()),
      },
      {
        label: 'Zeile unten einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addRowAfter().run()),
      },
      {
        label: 'Spalte links einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx.chain().focus().addColumnBefore().run()
          ),
      },
      {
        label: 'Spalte rechts einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addColumnAfter().run()),
      },
    ],
    [
      {
        label: 'Zeile entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteRow().run()),
      },
      {
        label: 'Spalte entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteColumn().run()),
      },
      {
        label: 'Tabelle entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteTable().run()),
      },
    ],
    [
      {
        label: 'Kopfzeile umschalten',
        icon: 'i-lucide-pilcrow',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx.chain().focus().toggleHeaderRow().run()
          ),
      },
    ],
  ]
})

function resetEditorMediaState() {
  editorMediaLibraryOpen.value = false
  editorMediaUploading.value = false
  editorMediaAssetId.value = ''
  editorMediaName.value = ''

  const inputEl = editorFileInput.value?.inputRef as
    | HTMLInputElement
    | undefined
  if (inputEl) {
    inputEl.value = ''
  }
}

function handleEditorMediaModalUpdate(value: boolean) {
  if (!value) {
    resetEditorMediaState()
  }
}

function handleEditorLibrarySelect(file: DirectusFile) {
  editorMediaAssetId.value = normalizeAssetIdentifier(file?.id)
  editorMediaName.value =
    file?.filename_download ?? file?.title ?? file?.filename_disk ?? ''
  editorMediaLibraryOpen.value = false
}

function insertEditorMedia() {
  const instance = unref(editor)
  const src = editorMediaSrc.value

  if (!instance || !src) {
    return
  }

  instance
    .chain()
    .focus()
    .setImage({
      src,
      ...(editorMediaName.value ? { alt: editorMediaName.value } : {}),
    })
    .run()

  editorMediaModalOpen.value = false
}

defineExpose({
  editor,
})

watch(
  () => editorFileInput.value,
  (file) => {
    handleEditorLibrarySelect(file as DirectusFile)
  }
)

watch(
  mentionableUsers,
  (users) => {
    if (users.length) {
      scheduleMentionHydration()
    }
  },
  { immediate: true }
)

watch(
  () => unref(editor),
  (instance) => {
    if (instance) {
      scheduleMentionHydration()
    }
  },
  { immediate: true }
)

// TiptapUnderline,
// TiptapLink.configure({
//   openOnClick: false,
// }),
// TiptapImgAlign.configure({
//   inline: true,
// }),
// TiptapTableAlign.configure({
//   resizable: true,
// }),
// TiptapTableRow,
// TiptapTableHeader,
// TiptapTableCell,
// TiptapTextAlign.configure({
//   defaultAlignment: 'left',
//   types: ['heading', 'paragraph', 'image', 'img', 'table  '],
//   alignments: ['left', 'center', 'right', 'justify'],
// }),
// TiptapSubscript,
// TiptapSuperscript,
// TiptapCharacterCount,
// TiptapTextStyle,
// TiptapColor.configure({
//   types: ['textStyle'],
// }),
// TiptapArisCorpPanel,
// TiptapArisCorpPanelWithBg,
// TiptapVideo,
// TODO: USER MENTIONS
// TODO: AI
</script>

<template>
  <UCard
    v-if="!readOnly"
    variant="ams"
    class="min-h-full !shadow-none"
    :ui="{
      header: 'sticky top-0 !py-3 z-10 bg-(--ui-bg-muted)/95',
      footer:
        'sticky bottom-0 z-10 bg-(--ui-bg-muted)/95 border-t border-t-(--ui-primary)/20',
      body: 'flex-1 !py-2 border-b-0 overflow-y-scroll [scrollbar-width:_none] !pr-0',
      root: '!divide-y relative flex flex-col h-[calc(100vh_-_120px)] overflow-clip !divide-(--ui-primary)/20',
    }"
  >
    <template #header>
      <div class="flex flex-wrap items-center gap-1 bg-(--ui-bg-muted)/0 p-2">
        <UButton
          @click="editor?.commands.toggleBold"
          icon="i-lucide-bold"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleItalic"
          icon="i-lucide-italic"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('italic') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor.chain().focus()?.toggleUnderline()?.run()"
          icon="i-lucide-underline"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('underline') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 2 })"
          icon="i-lucide-heading-1"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 3 })"
          icon="i-lucide-heading-2"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 4 })"
          icon="i-lucide-heading-3"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 4 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          @click="editor?.commands.toggleBulletList"
          icon="i-lucide-list"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bulletList') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleOrderedList"
          icon="i-lucide-list-ordered"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('orderedList') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UDropdownMenu
          :items="tableMenuItems"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8,
          }"
          :ui="{
            content: 'min-w-[15rem] bg-(--ui-bg-muted) ring-(--ui-primary)/20',
          }"
        >
          <UButton
            icon="i-lucide-table"
            variant="subtle"
            class="size-8"
            :color="editor?.isActive('table') ? 'primary' : 'neutral'"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />
          <template #mode-label> Tabelle </template>
        </UDropdownMenu>
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-align-left"
          @click="editor?.chain()?.focus()?.setTextAlign('left')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-center"
          @click="editor?.chain()?.focus()?.setTextAlign('center')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-right"
          @click="editor?.chain()?.focus()?.setTextAlign('right')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-quote"
          @click="editor?.chain()?.focus()?.toggleBlockquote()?.run()"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-code"
          @click="editor?.chain()?.focus()?.toggleCode()?.run()"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('code') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        /> -->
        <!-- <UButton
          icon="i-lucide-link"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('link') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        /> -->
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-image-plus"
          variant="subtle"
          class="size-8"
          @click="editorMediaModalOpen = true"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- TODO: ADD COLOR -->
        <!-- <UButton
          icon="i-lucide-palette"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        /> -->
        <span class="ml-auto gap-1 flex">
          <UButton
            icon="i-lucide-undo"
            @click="editor?.chain()?.focus()?.undo().run()"
            :disabled="!editor?.can()?.undo()"
            variant="subtle"
            class="size-8"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />

          <UButton
            icon="i-lucide-redo"
            @click="editor?.chain()?.focus()?.redo().run()"
            :disabled="!editor?.can()?.redo()"
            variant="subtle"
            class="size-8"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />
        </span>
      </div>
    </template>
    <template #default>
      <TiptapEditorContent
        :editor="editor"
        class="size-full overflow-y-clip pr-0 prose prose-invert max-w-none"
      />
    </template>
    <template #footer>
      <div class="flex not-prose w-full divide-x divide-(--ui-primary)/20">
        <p class="ml-auto mr-2 pr-2">
          {{
            editor?.storage.characterCount
              .characters()
              .toString()
              .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
          }}
          Buchstaben
        </p>
        <p>
          {{
            editor?.storage.characterCount
              .words()
              .toString()
              .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
          }}
          Wörter
        </p>
      </div>
    </template>
  </UCard>
  <UModal
    v-if="!readOnly"
    v-model:open="editorMediaModalOpen"
    title="Datei einfügen"
    @update:open="handleEditorMediaModalUpdate"
    :ui="{
      content:
        'bg-(--ui-bg-muted)/50 backdrop-blur-xs divide-(--ui-primary)/20',
    }"
  >
    <template #body>
      <div class="space-y-4 p-4">
        <AMSGlobalFileDrawer v-model="editorFileInput" />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-4">
        <UButton
          variant="subtle"
          color="neutral"
          type="button"
          label="Abbrechen"
          @click="editorMediaModalOpen = false"
        />
        <UButton
          variant="subtle"
          type="button"
          label="Inhalt einfügen"
          :disabled="!canInsertMedia || editorMediaUploading"
          @click="insertEditorMedia"
        />
      </div>
    </template>
  </UModal>
  <TiptapEditorContent
    v-else
    :editor="editor"
    class="size-full overflow-y-clip pr-0 prose prose-invert max-w-none"
  />
</template>

<style>
.tiptap:focus {
  outline: none;
  border: none;
}
.tippy-box[data-theme~='mention-suggestion'] {
  background-color: transparent;
  box-shadow: none;
}
.tippy-box[data-theme~='mention-suggestion'] > .tippy-content {
  padding: 0;
}
.ProseMirror {
  height: v-bind('editorHeight') !important;
  overflow-y: auto;
  padding-right: 16px;
}
</style>
