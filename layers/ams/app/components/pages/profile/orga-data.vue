<script setup lang="ts">
const store = useUserProfileEditStore()

const roleOptions = reactive([
  { label: 'Rekrutierung', value: 'recruitment' },
  { label: 'Marketing & Presse', value: 'marketing_and_press' },
  { label: 'Inhaltsersteller', value: 'content_writer' },
])

const { data: departments } = useLazyAsyncData(
  'global:simple_departments',
  () =>
    useDirectus(
      readItems('departments', {
        limit: -1,
        fields: ['*'],
      })
    )
)
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
            v-model="store.formData.department"
            :items="departments"
            variant="ams"
            size="md"
            value-key="id"
            label-key="name"
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
            v-model="store.formData.roles"
            value-key="value"
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
