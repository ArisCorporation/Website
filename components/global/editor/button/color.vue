<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UPopover>
    <UButton
      size="xs"
      variant="ghost"
      color="white"
      icon="i-mdi-format-color"
      trailing-icon="i-heroicons-chevron-down-20-solid"
      class="relative h-fit w-fit"
    >
      <UIcon
        name="i-mdi-color-helper"
        class="absolute w-4 h-4"
        :class="{
          'text-aris-400': editor.isActive('textStyle', { color: '#00FFE8' }),
          'text-industrial-400': editor.isActive('textStyle', { color: '#E48632' }),
          'text-red-600': editor.isActive('textStyle', { color: '#DC2626' }),
          'text-green-600': editor.isActive('textStyle', { color: '#16A34A' }),
          'text-yellow-500': editor.isActive('textStyle', { color: '#F1C40F' }),
        }"
      />
    </UButton>

    <template #panel>
      <div class="p-2">
        <div class="flex flex-wrap justify-center w-32 h-16 gap-2">
          <button
            class="w-6 h-6 transition border border-tbase hover:scale-125"
            @click="editor.chain().focus().unsetColor().run()"
          >
            <div class="w-full h-0.5 -rotate-45 bg-danger" />
            <span class="sr-only">Remove Color</span>
          </button>
          <button
            class="w-6 h-6 transition bg-aris-400 hover:scale-125"
            @click="editor.chain().focus().setColor('#00FFE8').run()"
          >
            <span class="sr-only">Text Color: Aris</span>
          </button>
          <button
            class="w-6 h-6 transition bg-industrial-400 hover:scale-125"
            @click="editor.chain().focus().setColor('#E48632').run()"
          >
            <span class="sr-only">Text Color: Industrial</span>
          </button>
          <button
            class="w-6 h-6 transition bg-red-600 hover:scale-125"
            @click="editor.chain().focus().setColor('#DC2626').run()"
          >
            <span class="sr-only">Text Color: Danger</span>
          </button>
          <button
            class="w-6 h-6 transition bg-green-600 hover:scale-125"
            @click="editor.chain().focus().setColor('#16A34A').run()"
          >
            <span class="sr-only">Text Color: Success</span>
          </button>
          <button
            class="w-6 h-6 transition bg-yellow-500 hover:scale-125"
            @click="editor.chain().focus().setColor('#F1C40F').run()"
          >
            <span class="sr-only">Text Color: Yellow</span>
          </button>
          <div class="w-6 h-6" />
          <div class="w-6 h-6" />
        </div>
      </div>
    </template>
  </UPopover>
</template>
