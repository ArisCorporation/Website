<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import tippy, { type Instance as TippyInstance } from 'tippy.js'

const props = defineProps(nodeViewProps)

const attrs = computed(() => {
  const raw = props.node.attrs ?? {}
  return {
    id: raw.id as string | undefined,
    label: (raw.label as string | undefined) ?? '',
    alias: raw.alias as string | undefined,
    slug: raw.slug as string | undefined,
    avatarUrl: raw.avatarUrl as string | undefined,
    department: raw.department as string | undefined,
    position: raw.position as string | undefined,
    profileUrl: raw.profileUrl as string | undefined,
    headOfDepartment:
      raw.headOfDepartment == null ? null : Boolean(raw.headOfDepartment),
  }
})

const initials = computed(
  () => attrs.value.label?.trim().charAt(0)?.toUpperCase() || '?'
)

const pillDetails = computed(() =>
  [attrs.value.position, attrs.value.department].filter(Boolean).join(' · ')
)

const tooltipTitle = computed(() =>
  [attrs.value.alias || '', attrs.value.position, attrs.value.department]
    .filter(Boolean)
    .join(' • ')
)

const isHeadOfDepartment = computed(() => Boolean(attrs.value.headOfDepartment))

const mentionEl = ref<HTMLElement | null>(null)
const cardEl = ref<HTMLDivElement | null>(null)
let tooltip: TippyInstance | null = null

const openProfile = (event: MouseEvent) => {
  event.preventDefault()
  const href = attrs.value.profileUrl
  if (href) {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

onMounted(() => {
  const trigger = mentionEl.value
  const card = cardEl.value

  if (!trigger || !card) {
    return
  }

  card.classList.remove('hidden')

  tooltip = tippy(trigger, {
    content: card,
    allowHTML: true,
    interactive: true,
    trigger: 'mouseenter focus',
    appendTo: () => document.body,
    theme: 'mention-card',
    arrow: false,
    placement: 'top',
    offset: [0, 14],
    maxWidth: 320,
    moveTransition: 'transform 0.16s ease',
  })
})

onBeforeUnmount(() => {
  tooltip?.destroy()
  tooltip = null
})
</script>

<template>
  <NodeViewWrapper
    as="span"
    :class="[
      'inline-flex align-middle',
      selected ? 'rounded-full outline outline-2 outline-primary/40' : '',
    ]"
    data-mention-node
    contenteditable="false"
  >
    <a
      ref="mentionEl"
      :class="[
        'mention flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition',
        'hover:border-primary/50 hover:bg-primary/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      ]"
      :href="attrs.profileUrl || undefined"
      target="_blank"
      rel="noopener noreferrer"
      :title="tooltipTitle || undefined"
      @mousedown.prevent
      @click="openProfile"
      @keydown.enter.prevent="openProfile"
      @keydown.space.prevent="openProfile"
      tabindex="0"
    >
      <span
        :class="[
          'flex size-7 items-center justify-center rounded-full border border-primary/40 bg-primary/15 uppercase',
          'text-[0.65rem] font-semibold text-primary',
          !attrs.avatarUrl ? 'text-primary-100' : '',
        ]"
      >
        <img
          v-if="attrs.avatarUrl"
          :src="attrs.avatarUrl"
          :alt="`${attrs.label} Profilbild`"
          loading="lazy"
          draggable="false"
          class="h-full w-full object-cover rounded-full"
        />
        <span v-else>
          {{ initials }}
        </span>
      </span>

      <span class="flex min-w-0 flex-col gap-0.5 text-left">
        <span class="text-xs font-semibold leading-tight text-primary">
          {{ attrs.label }}
        </span>
        <span
          v-if="attrs.alias"
          class="text-[10px] font-medium uppercase tracking-[0.16em] text-primary/70"
        >
          {{ attrs.alias }}
        </span>
        <div class="flex items-center gap-x-0.5">
          <span
            class="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {{ attrs.position }}
          </span>
          <span v-if="pillDetails" class="text-xs font-medium text-primary/70">
            {{ ' · ' }}{{ attrs.department }}
          </span>
        </div>
      </span>
    </a>

    <div
      ref="cardEl"
      class="mention-card hidden w-80 rounded-xl border border-primary/30 bg-[var(--ui-bg-muted)] bg-opacity-90 p-5 text-[var(--ui-foreground)] shadow-2xl backdrop-blur-md"
      role="presentation"
      aria-hidden="true"
    >
      <div class="flex items-center gap-4 border-b border-primary/20 pb-4">
        <div
          :class="[
            'flex size-14 items-center justify-center rounded-full border border-primary/35 bg-primary/15 uppercase',
            'text-xs font-semibold text-primary',
            !attrs.avatarUrl ? 'text-primary-100' : '',
          ]"
        >
          <img
            v-if="attrs.avatarUrl"
            :src="attrs.avatarUrl"
            :alt="`${attrs.label} Profilbild`"
            loading="lazy"
            draggable="false"
            class="h-full w-full object-cover rounded-full"
          />
          <span v-else>
            {{ initials }}
          </span>
        </div>
        <div class="flex min-w-0 flex-col gap-1">
          <span
            class="text-lg font-semibold leading-tight text-[var(--ui-foreground)]"
          >
            {{ attrs.label }}
          </span>
          <span
            v-if="attrs.alias"
            class="text-[11px] font-medium uppercase tracking-[0.2em] text-primary/70"
          >
            {{ attrs.alias }}
          </span>
        </div>
      </div>

      <div
        class="mt-4 flex flex-col gap-3 text-xs text-[var(--ui-muted-foreground)]"
      >
        <div v-if="attrs.position" class="flex gap-3">
          <span
            class="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70"
          >
            Position
          </span>
          <span class="font-medium text-[var(--ui-foreground)]">
            {{ attrs.position }}
          </span>
        </div>
        <div v-if="attrs.department" class="flex gap-3">
          <span
            class="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70"
          >
            Abteilung
          </span>
          <span class="font-medium text-[var(--ui-foreground)]">
            {{ attrs.department
            }}<span v-if="isHeadOfDepartment" class="text-primary">
              (Abteilungsleiter)</span
            >
          </span>
        </div>
        <div v-if="attrs.alias" class="flex gap-3">
          <span
            class="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70"
          >
            Rufzeichen
          </span>
          <span class="font-medium text-[var(--ui-foreground)]">
            {{ attrs.alias }}
          </span>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style scoped>
@reference '@/assets/css/main.css'

:global(.tippy-box[data-theme~='mention-card']) {
  @apply border-0 bg-transparent shadow-none;
}
:global(.tippy-box[data-theme~='mention-card'] > .tippy-content) {
  @apply p-0;
}
:global(.tippy-box[data-theme~='mention-card'] .mention-card) {
  @apply flex flex-col;
}
</style>
