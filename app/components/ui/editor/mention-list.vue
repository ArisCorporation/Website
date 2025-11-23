<script setup lang="ts">
interface MentionListItem {
  id: string
  label: string
  alias?: string
  slug?: string | null
  department?: string | null
  avatarUrl?: string
  position?: string | null
  headOfDepartment?: boolean | null
  profileUrl: string
}

type MentionCommandPayload = Pick<
  MentionListItem,
  'id' | 'label' | 'alias' | 'slug' | 'avatarUrl' | 'department' | 'position' | 'profileUrl' | 'headOfDepartment'
>

const props = defineProps<{
  items: MentionListItem[]
  command: (options: MentionCommandPayload) => void
}>()

const selectedIndex = ref(0)

const selectItem = (index: number) => {
  const item = props.items[index]
  if (!item) {
    return
  }

  props.command({
    id: item.id,
    label: item.label,
    alias: item.alias,
    slug: item.slug ?? undefined,
    avatarUrl: item.avatarUrl,
    department: item.department,
    position: item.position,
    profileUrl: item.profileUrl,
    headOfDepartment: item.headOfDepartment ?? undefined,
  })
}

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (!props.items.length) {
    return false
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveSelection(-1)
    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveSelection(1)
    return true
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

const moveSelection = (direction: -1 | 1) => {
  const itemCount = props.items.length
  if (!itemCount) {
    selectedIndex.value = 0
    return
  }

  const nextIndex = (selectedIndex.value + direction + itemCount) % itemCount
  selectedIndex.value = nextIndex
}

watch(
  () => props.items,
  (items) => {
    if (!items.length) {
      selectedIndex.value = 0
      return
    }

    if (selectedIndex.value >= items.length) {
      selectedIndex.value = 0
    }
  },
  { deep: true, immediate: true }
)

defineExpose({
  onKeyDown,
})
</script>

<template>
  <div
    class="mention-suggestion max-h-[18rem] min-w-[18rem] overflow-y-auto rounded-lg border border-(--ui-primary)/20 bg-(--ui-bg-muted) p-1 text-sm shadow-lg backdrop-blur-xs"
  >
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)"
        :class="[
          index === selectedIndex
            ? 'bg-(--ui-primary)/20 text-(--ui-primary)'
            : 'text-(--ui-foreground) hover:bg-(--ui-primary)/10',
        ]"
        @mousedown.prevent
        @click="selectItem(index)"
      >
        <span
          class="flex size-8 items-center justify-center rounded-full bg-(--ui-primary)/15 text-sm font-semibold text-(--ui-primary)"
        >
          <img
            v-if="item.avatarUrl"
            :src="item.avatarUrl"
            :alt="`${item.label} Profilbild`"
            class="size-8 rounded-full object-cover"
          />
          <span v-else>
            {{ item.label.charAt(0)?.toUpperCase() ?? '?' }}
          </span>
        </span>
        <span class="flex flex-col">
          <span class="font-medium">
            {{ item.label }}
          </span>
          <span
            v-if="item.alias"
            class="text-xs text-(--ui-muted-foreground)"
          >
            {{ item.alias }}
          </span>
          <span
            v-if="item.position || item.department"
            class="text-xs text-(--ui-muted-foreground)"
          >
            {{ [item.position, item.department].filter(Boolean).join(' · ') }}
          </span>
          <span
            v-if="item.headOfDepartment"
            class="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            Leitung
          </span>
        </span>
      </button>
    </template>
    <div
      v-else
      class="px-3 py-2 text-(--ui-muted-foreground)"
    >
      Keine Mitglieder gefunden
    </div>
  </div>
</template>
