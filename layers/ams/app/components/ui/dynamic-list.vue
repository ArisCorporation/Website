<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'

const props = defineProps<{ handle: boolean; placeholder: string }>()

// Defines the model for the list items, defaulting to an empty array.
// This model is two-way bound (v-model) with the parent component.
// defineModel ensures `model.value` is always an array.
const model = defineModel<string[]>({ default: () => [] })

// Template ref for the TransitionGroup element (which renders as a <ul>).
const listEl = ref<HTMLElement | null>(null)

// Ref for the input field value.
const input = ref<string>('')

// Adds item(s) to the list.
const addItem = () => {
  const trimmedInput = input.value.trim()
  if (trimmedInput) {
    // Check if input is not just whitespace
    const itemsToAdd = trimmedInput
      .split(',')
      .map((i) => i.trim()) // Trim whitespace from each item
      .filter((i) => i !== '') // Filter out any empty strings

    if (itemsToAdd.length > 0) {
      // Update model ensuring unique items.
      // `model.value` is guaranteed to be an array by `defineModel`.
      model.value = [...new Set([...model.value, ...itemsToAdd])]
    }
    input.value = '' // Clear the input field
  }
}

// Removes an item from the list at the given index.
const removeItem = (index: number) => {
  // `model.value` is guaranteed to be an array by `defineModel`.
  model.value = model.value.filter((_, i) => i !== index)
}

// Initializes the sortable functionality on the list.
useSortable(listEl, model, {
  animation: 150, // Animation duration in ms for SortableJS dragging.
  handle: props.handle ? '.drag-handle' : undefined, // Optional drag handle selector.
  ghostClass: 'sortable-ghost', // CSS class for the placeholder element.
  dragClass: 'sortable-drag', // CSS class for the element being dragged.
})

// Computed property to check if there are any items in the list.
// `model.value` is guaranteed to be an array by `defineModel`.
const hasItems = computed(() => model.value.length > 0)
</script>

<template>
  <div class="list-component-wrapper pl-5">
    <TransitionGroup
      ref="listEl"
      tag="ul"
      name="list-item-transition"
      class="-space-y-px !mb-0 !pl-0"
    >
      <li
        v-for="(item, index) in model"
        :key="item"
        class="not-prose flex text-sm hover:z-10 relative group gap-x-4 justify-between py-2 pl-2 pr-6 bg-(--ui-bg-muted)/50 backdrop-blur-xs border border-(--ui-primary)/10 hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
        :class="{
          'first:rounded-t-md': index === 0,
        }"
      >
        <span v-if="props.handle" class="flex">
          <UButton
            icon="i-lucide-grip-vertical"
            variant="soft"
            color="neutral"
            size="xs"
            class="m-auto drag-handle hover:!cursor-grab"
            aria-label="Drag to reorder"
          />
        </span>
        <span class="w-6 my-auto">{{ index + 1 }}</span>
        <span class="text-left my-auto flex-1">{{ item }}</span>
        <span class="flex">
          <UButton
            @click="removeItem(index)"
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            size="xs"
            class="m-auto"
            aria-label="Remove item"
          />
        </span>
      </li>
    </TransitionGroup>

    <div
      class="not-prose mb-[15px] pl-2 flex text-sm hover:z-10 relative group gap-x-4 justify-between py-2 pr-6 border border-(--ui-primary)/10 hover:border-(--ui-primary)/20 rounded-b-md"
      :class="{
        'bg-(--ui-bg-muted)/50 backdrop-blur-xs hover:bg-(--ui-primary)/5':
          !hasItems,
        'bg-(--ui-bg)/50 hover:bg-(--ui-bg)/25 backdrop-blur-xs': hasItems,
        'rounded-t-md': !hasItems,
        // Assuming -space-y-px is always on listEl if it has items and is rendered.
        // This simplifies the original condition: hasItems && listEl?.classList?.contains('-space-y-px')
        'mt-[-1px]': hasItems,
      }"
    >
      <span class="text-left flex-1">
        <UInput
          @keyup.enter="addItem"
          v-model="input"
          type="text"
          :placeholder="placeholder"
          variant="outline"
          highlight
          class="w-full"
        />
      </span>
      <span class="flex">
        <UButton
          @click="addItem"
          icon="i-lucide-plus"
          variant="ghost"
          color="success"
          size="xs"
          class="m-auto"
          aria-label="Add item"
        />
      </span>
    </div>
  </div>
</template>

<style>
/* Wrapper for the entire list component. */
.list-component-wrapper {
  position: relative;
}

/*
  ENTER ANIMATION: Applied when items are added or the list initially loads with items.
*/
.list-item-transition-enter-active {
  transition: all 0.35s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-item-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/*
  LEAVE ANIMATION: These are intentionally left blank or minimal
  to disable the leave animation as per user request.
  The element will be removed from the DOM without a CSS transition.
*/
.list-item-transition-leave-active {
  /* position: absolute !important; /* Usually needed for FLIP, but leave is disabled */
  /* width: 100%; */
  /* transition: opacity 0.35s ease; /* Example if only opacity was desired */
}

.list-item-transition-leave-to {
  /* opacity: 0; */
}

/*
  MOVE ANIMATION: Intentionally left blank or minimal
  to disable Vue's move animation as per user request.
  SortableJS's own 'animation: 150' will handle drag animations.
*/
.list-item-transition-move {
  /* transition: transform 0.35s ease; */
}

/* Styles for SortableJS ghost element (placeholder during drag) */
.sortable-ghost {
  opacity: 0.4 !important;
  background-color: var(--ui-primary-100, #e0f2fe) !important;
  border: 1px dashed var(--ui-primary-500, #3b82f6) !important;
  z-index: 10;
}

/* Styles for SortableJS dragged element */
.sortable-drag {
  opacity: 0.85 !important;
  transform: scale(1.02);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 20;
}
</style>
