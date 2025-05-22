<script setup lang="ts">
const mode = useCookie<'cards' | 'table'>('ams:hangar-view')
mode.value = mode.value || 'cards'
const shortFilterOptions = reactive([
  {
    key: 'all',
    label: 'Alle Schiffe',
  },
  {
    key: 'personal',
    label: 'Persöhnliche Schiffe',
  },
  {
    key: 'ariscorp',
    label: 'ArisCorp Schiffe',
  },
])

const viewOptions = reactive([
  {
    key: 'cards',
    label: 'Karten Ansicht',
    icon: 'i-lucide-layout-grid',
  },
  {
    key: 'table',
    label: 'Tabellen Ansicht',
    icon: 'i-lucide-list',
  },
])

const shortFilter = ref<(typeof shortFilterOptions)[number]['key']>('all')

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-fluent-home-garage-24-regular"
      title="Hangar"
      description="Verwalte deine eigenen Schiffe und Fahrzeuge."
    >
      <USlideover
        :ui="{
          content: 'max-w-xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
        }"
      >
        <UButton
          label="Schiffe hinzufügen"
          icon="i-lucide-circle-plus"
          variant="subtle"
        />
        <template #header>
          <h3 class="!my-0">Schiffe hinzufügen</h3>
        </template>
        <template #body>
          <!-- <UInput
            highlight
            variant="outline"
            icon="i-lucide-search"
            placeholder="Hersteller, Modell"
            size="lg"
            class="w-full mb-6"
          />
          <USeparator variant="ams" /> -->
          <div class="space-y-4">
            <UCard variant="ams">
              <div class="space-y-4">
                <p class="text-(--ui-primary)">Schiff 1</p>
                <UFormField label="Modell" required>
                  <USelectMenu
                    variant="ams"
                    value-key="id"
                    label-key="name"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Schiffsname" hint="Optional">
                  <UInput
                    highlight
                    variant="outline"
                    placeholder="Aris ONE"
                    class="w-full"
                  />
                </UFormField>
                <USeparator variant="ams" />
                <UFormField label="Zuordnung" required>
                  <URadioGroup
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    size="sm"
                    default-value="ariscorp"
                    :items="[
                      { label: 'ArisCorp', value: 'ariscorp' },
                      { label: 'Privat', value: 'private' },
                    ]"
                    class="prose-p:my-0"
                    :ui="{ item: 'p-2' }"
                  />
                </UFormField>
                <UFormField label="Sichtbarkeit">
                  <URadioGroup
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    size="sm"
                    default-value="public"
                    :items="[
                      { label: 'Öffentlich', value: 'public' },
                      { label: 'Intern', value: 'internal' },
                      { label: 'Privat', value: 'private' },
                    ]"
                    class="prose-p:my-0"
                    :ui="{ item: 'p-2' }"
                  />
                </UFormField>
                <div
                  class="flex w-full p-3 text-sm rounded-md items-center gap-4 ring ring-(--ui-bg-accented)"
                >
                  <NuxtImg
                    src="https://media.starcitizen.tools/1/1b/RSI_Galaxy_concept_-_front_quarter_-_Cut.jpg?format=webp"
                    class="size-12 object-cover rounded-md"
                  />
                  <div class="flex-1">
                    <strong class="pb-1 block">Galaxy</strong>
                    <p class="!m-0 text-(--ui-text-muted) text-xs">
                      <span>RSI &bull; Modular</span>
                    </p>
                  </div>
                </div>
              </div>
            </UCard>
            <UButton
              highlight
              variant="outlinedashed"
              label="Weiteres Schiff hinzufügen"
              icon="i-lucide-plus"
              size="lg"
              class="w-full justify-center mt-4 !ring-none"
            />
          </div>
        </template>
        <template #footer>
          <div class="ml-auto items-center space-x-4 flex">
            <UButton variant="outline" label="Abbrechen" />
            <UButton
              icon="i-lucide-check"
              trailing
              label="Zum Hangar hinzufügen"
            />
          </div>
        </template>
      </USlideover>
    </AMSPageHeader>
    <UInput
      highlight
      variant="outline"
      icon="i-lucide-search"
      placeholder="Name, Hersteller, Modell"
      size="lg"
      class="w-full mb-6"
    />
    <div class="flex justify-between flex-wrap prose-p:m-0 mb-6">
      <URadioGroup
        v-model="shortFilter"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="shortFilterOptions"
      />
      <URadioGroup
        v-model="mode"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="viewOptions"
      >
        <template #label="{ item }">
          <span class="items-center flex"
            ><UIcon :name="item.icon" class="size-4 mr-1" />
            {{ item.label }}</span
          >
        </template>
      </URadioGroup>
    </div>
    <template v-if="mode === 'table'">
      <AMSPagesHangarShips :hangarItem="mockUser?.hangar_items" />
    </template>
    <template v-else-if="mode === 'cards'">
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AMSUiShipCard
          v-for="ship in mockUser?.hangar_items"
          :hangarItem="ship"
          :key="ship.id"
        />
      </div>
    </template>
  </div>
</template>
