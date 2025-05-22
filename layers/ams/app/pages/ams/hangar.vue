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

const ships = [
  {
    id: 1,
    name: 'Galaxy',
    manufacturer: {
      name: 'Roberts Space Industries',
    },
    store_image: '4eb55291-231c-4046-af63-5bea3cf4d8b6',
    visibility: 'public',
    allocation: 'ariscorp',
    modules: [],
  },
  {
    id: '2d96efc3-f9ab-4858-a819-13ecb77a6d70',
    name: '400i',
    slug: '400i',
    store_image: 'ace3e927-c38b-406f-a49d-e951ab58149b',
    manufacturer: {
      name: 'Origin Jumpworks',
    },
  },
  {
    id: '62d64800-d858-4334-a09b-2598d6a42131',
    name: 'ROC-DS',
    slug: 'roc-ds',
    store_image: '5274bca4-9fd3-4241-88f6-b9473c643e74',
    manufacturer: {
      name: 'Greycat Industrial',
    },
  },
  {
    id: 'a834e2e4-48b9-40a0-8ce1-ca9ca9dc6a2d',
    name: 'Zeus Mk II ES',
    slug: 'zeus-mk-ii-es',
    store_image: '7c2783d5-5e37-44bd-a085-2494b354792a',
    manufacturer: {
      name: 'Roberts Space Industries',
    },
  },
  {
    id: '30807d95-f873-4fe8-863c-84bd4aff311d',
    name: 'Carrack Expedition',
    slug: 'carrack-expedition',
    store_image: '6ad46231-b499-44a5-8f22-b46e83d2ad22',
    manufacturer: {
      name: 'Anvil Aerospace',
    },
  },
  {
    id: 'e9b15d3f-7b35-4d0d-ba24-17f59f4f458a',
    name: 'Starlancer MAX',
    slug: 'starlancer-max',
    store_image: '9ab90c3b-57e4-44f5-95e2-9b0be81d5ce1',
    manufacturer: {
      name: 'Musashi Industrial and Starflight Concern',
    },
  },
  {
    id: 'ac3ba3be-70d8-40d4-afb8-f3f299d08300',
    name: 'E1 Spirit',
    slug: 'e1-spirit',
    store_image: '5b8f9001-fc0b-4c87-927e-5ec3fd7ec692',
    manufacturer: {
      name: 'Crusader Industries',
    },
  },
  {
    id: 'fed3b17a-af43-4b01-80b3-9f8ac0564faf',
    name: 'Ursa Medivac',
    slug: 'ursa-medivac',
    store_image: '6eda2bff-a3de-44e3-928a-680d73edfcc3',
    manufacturer: {
      name: 'Roberts Space Industries',
    },
  },
  {
    id: '162a343b-0c5c-4488-89a8-0593b45975a5',
    name: 'Liberator',
    slug: 'liberator',
    store_image: '1ae07d56-cfba-41f8-8d3c-db26bce3bf42',
    manufacturer: {
      name: 'Anvil Aerospace',
    },
  },
].sort((a, b) => a.name.localeCompare(b.name))

definePageMeta({
  layout: 'ams',
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
                    src="4eb55291-231c-4046-af63-5bea3cf4d8b6"
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
      <AMSPagesHangarShips :ships="ships" />
    </template>
    <template v-else-if="mode === 'cards'">
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AMSUiShipCard v-for="ship in ships" :ship="ship" :key="ship.id" />
      </div>
    </template>
  </div>
</template>
