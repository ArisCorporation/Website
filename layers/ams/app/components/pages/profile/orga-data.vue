<script setup lang="ts">
const roleOptions = reactive<string[]>([
  'Rekrutierung',
  'Marketing & Presse',
  'Inhaltsersteller',
])
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <template #header>
      <div class="prose-h4:my-0 prose-p:my-0">
        <h4>Orga Informationen</h4>
        <p class="text-xs pt-1 text-(--ui-text-muted)">
          Organisationsbezogene Daten
        </p>
      </div>
    </template>
    <template #default>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField
          label="Abteilung"
          name="department"
          size="xs"
          class="w-full"
        >
          <USelectMenu
            :items="titleOptions"
            variant="ams"
            size="md"
            placeholder="z.B. Logistik"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Rollen"
          name="roles"
          size="xs"
          class="w-full prose-p:my-0"
        >
          <UCheckboxGroup
            disabled
            orientation="horizontal"
            :items="roleOptions"
            class="translate-y-2"
          />
        </UFormField>
      </div>
    </template>
  </UCard>
</template>