<script setup lang="ts">
definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-book-text"
      title="VerseExkurs Editor"
      description="Verwalte den Inhalt des öffentlichen VerseExkurses."
    />
    <USlideover
      variant="ams"
      :ui="{
        header: '!p-0',
        content: 'max-w-3xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
      }"
    >
      <UButton>Öffnen</UButton>
      <template #body>
        <UiFileLibrary :all-types="true" />
      </template>
    </USlideover>
  </div>
</template>
