<script setup lang="ts">
import type { Ships } from '~~/types'

defineProps<{ ship: Ships }>()

const editSlideover = ref<boolean>(false)
</script>

<template>
  <UCard
    variant="ams"
    class="hover:scale-[1.02] overflow-clip duration-300 translation-all ease-out group"
    :ui="{ header: '!p-0' }"
  >
    <template #header>
      <div class="relative aspect-[21/9] overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-t from-(--ui-bg-muted) to-transparent opacity-40 z-10 group-hover:translate-y-[100%] transition-all duration-300"
        />
        <NuxtImg
          :src="ship.store_image"
          class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute bottom-3 left-3 flex items-center space-x-2 z-20">
          <div
            class="flex items-center rounded-full bg-(--ui-bg-muted)/80 px-2 py-1 text-xs text-green-400 transition-all duration-300 group-hover:bg-(--ui-bg-muted)/90"
          >
            <UIcon name="i-lucide-shield-check" class="mr-1 h-3 w-3" />
            Operational
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <h3
        class="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-(--ui-primary) !my-0"
      >
        {{ ship.name }}
      </h3>
      <p class="text-sm text-(--ui-text-muted) !my-0">Modular</p>
      <div v-if="false" class="mt-4 space-y-3 animate-fadeIn prose-p:my-0">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-(--ui-primary)">Manufacturer</p>
            <p class="text-white">{{ ship.manufacturer }}</p>
          </div>
          <div>
            <p class="text-(--ui-primary)">Crew Size</p>
            <p class="text-white">{{ ship.crew_min }}-{{ ship.crew_max }}</p>
          </div>
        </div>
        <div>
          <p class="text-(--ui-primary) text-sm">Specifications</p>
          <div class="grid grid-cols-3 gap-2 mt-1 text-xs">
            <div class="bg-(--ui-bg-muted)/60 rounded p-1 text-center">
              <p class="text-white">Length</p>
              <p class="text-(--ui-primary) font-mono">{{ ship.length }}m</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <USlideover
        v-model:open="editSlideover"
        :ui="{
          header: '!p-0',
          content: 'ring-(--ui-primary)/10 divide-(--ui-primary)/10',
        }"
      >
        <UButton
          variant="outline"
          icon="i-lucide-suqare-pen"
          label="Edit Ship"
          class="w-full border-(--ui-primary)/20 text-(--ui-primary) justify-center hover:bg-(--ui-primary)/10 hover:text-(--ui-primary)"
        />
        <template #header>
          <div class="relative aspect-[26/9] overflow-hidden">
            <NuxtImg
              :src="ship.store_image"
              class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </template>
        <template #body>
          <UForm>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Schiffsname" class="col-span-2">
                <UInput variant="ghost" highlight class="w-full" />
              </UFormField>
              <UFormField label="Seriennummer">
                <UInput variant="ghost" highlight class="w-full" />
              </UFormField>
              <UFormField label="Paint">
                <UInput variant="ghost" highlight class="w-full" />
              </UFormField>
            </div>
          </UForm>
        </template>
        <template #footer>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <UButton
              @click="() => (editSlideover = false)"
              label="Schließen"
              variant="outline"
              color="error"
              size="lg"
              class="w-full justify-center"
            />
            <UButton
              label="Speichern"
              variant="outline"
              color="success"
              size="lg"
              class="w-full justify-center"
            />
          </div>
        </template>
      </USlideover>
    </template>
  </UCard>
</template>
