<script setup lang="ts">
const model = defineModel<string[]>({ default: () => [] })

const input = ref<string>('')
const addItem = () => {
  if (input.value.trim() !== '') {
    const items = input.value.split(',')
    model.value = [...(model.value || []), ...items.map((i) => i.trim())]
    input.value = ''
  }
}

const removeItem = (index: number) =>
  (model.value = model.value?.filter((_, i) => i !== index))
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in model"
      :key="item"
      class="flex text-sm !my-0 gap-x-4 justify-between py-2 px-6 bg-(--ui-bg-muted)/50 backdrop-blur-xs border last:border-t-(--ui-primary)/10 last:bg-(--ui-bg)/50 last:hover:bg-(--ui-bg)/25 border-transparent border-x-(--ui-primary)/10 first:rounded-t-md first:border-t-(--ui-primary)/10 last:rounded-b-md last:border-b-(--ui-primary)/10 hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
    >
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
        />
      </span>
    </li>
    <li
      class="flex text-sm !my-0 gap-x-4 justify-between py-2 px-6 bg-(--ui-bg-muted)/50 backdrop-blur-xs border last:border-t-(--ui-primary)/10 last:bg-(--ui-bg)/50 last:hover:bg-(--ui-bg)/25 border-transparent border-x-(--ui-primary)/10 first:rounded-t-md first:border-t-(--ui-primary)/10 last:rounded-b-md last:border-b-(--ui-primary)/10 hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
    >
      <span class="text-left flex-1">
        <UInput
          @keyup.enter="addItem"
          v-model="input"
          type="text"
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
        />
      </span>
    </li>
  </ul>
</template>
