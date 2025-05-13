<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

interface gender {
  label: string
  value: string | null
}

const genderOptions = reactive<gender[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

const tabs = ref<TabsItem[]>([
  {
    label: 'Basis Daten',
    slot: 'basics',
  },
  {
    label: 'Physik',
    slot: 'physics',
  },
  {
    label: 'Bürgerstatus',
    slot: 'citizenship',
  },
  {
    label: 'Details',
    slot: 'details',
  },
])

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <UTabs
      :items="tabs"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #basics>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Basis Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Basis Informationen zu der Person
                </p>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField
                  label="Geschlecht"
                  name="gender"
                  size="xs"
                  class="w-full"
                >
                  <URadioGroup
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    default-value="male"
                    :items="genderOptions"
                    class="prose-p:my-0"
                  />
                </UFormField>
                <UFormField
                  label="Geburtsdatum"
                  name="birthdate"
                  size="xs"
                  class="w-full"
                >
                  <div class="grid grid-cols-3 gap-x-4">
                    <UFormField
                      label="Tag"
                      name="birthdate_day"
                      size="xs"
                      class="w-full"
                    >
                      <USelectMenu
                        :items="
                          Array.from({ length: 31 }, (_, index) =>
                            (index + 1).toString().padStart(2, '0')
                          )
                        "
                        variant="ams"
                        size="md"
                        placeholder="1-31"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Monat"
                      name="birthdate_month"
                      size="xs"
                      class="w-full"
                    >
                      <USelectMenu
                        :items="[
                          { label: 'Januar', value: '01' },
                          { label: 'Februar', value: '02' },
                          { label: 'März', value: '03' },
                          { label: 'April', value: '04' },
                          { label: 'Mai', value: '05' },
                          { label: 'Juni', value: '06' },
                          { label: 'Juli', value: '07' },
                          { label: 'August', value: '08' },
                          { label: 'September', value: '09' },
                          { label: 'Oktober', value: '10' },
                          { label: 'November', value: '11' },
                          { label: 'Dezember', value: '12' },
                        ]"
                        variant="ams"
                        size="md"
                        placeholder="Januar"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Jahr"
                      name="birthdate_year"
                      size="xs"
                      class="w-full"
                    >
                      <UInput highlight size="md" class="w-full" />
                    </UFormField>
                  </div>
                </UFormField>
                <UFormField
                  label="Aktueller Wohnort"
                  name="current_residence"
                  class="w-full"
                  size="xs"
                >
                  <USelectMenu
                    indicator="hidden"
                    orientation="horizontal"
                    variant="ams"
                    size="md"
                    :items="[
                      { label: 'Stanton / ArcCorp / Area 18', value: '0' },
                      {
                        label: 'Stanton / MicroTech / New Babbage',
                        value: '1',
                      },
                    ]"
                    class="prose-p:my-0"
                  />
                </UFormField>
                <UFormField
                  label="Geburtsort"
                  name="birth_place"
                  class="w-full"
                  size="xs"
                >
                  <USelectMenu
                    indicator="hidden"
                    orientation="horizontal"
                    variant="ams"
                    size="md"
                    :items="[
                      { label: 'Stanton / ArcCorp / Area 18', value: '0' },
                      {
                        label: 'Stanton / MicroTech / New Babbage',
                        value: '1',
                      },
                    ]"
                    class="prose-p:my-0"
                  />
                </UFormField>
              </div>
            </template>
          </UCard>
        </div>
      </template>
      <template #physics>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Physische Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Informationen zu deiner physik
                </p>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField
                  label="Größe"
                  hint="in CM"
                  name="height"
                  size="xs"
                  class="w-full"
                >
                  <UInput
                    highlight
                    size="md"
                    placeholder="182"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Gewicht"
                  hint="in KG"
                  name="weight"
                  size="xs"
                  class="w-full"
                >
                  <UInput highlight size="md" placeholder="85" class="w-full" />
                </UFormField>
                <UFormField
                  label="Haarfarbe"
                  name="weight"
                  size="xs"
                  class="w-full"
                >
                  <UInput
                    highlight
                    size="md"
                    placeholder="Blond"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Augenfarbe"
                  name="eye_color"
                  size="xs"
                  class="w-full"
                >
                  <UInput
                    highlight
                    size="md"
                    placeholder="Blau/Grau"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </template>
          </UCard>
        </div>
      </template>
      <template #citizenship>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Bürgerstatus</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Hier kannst du dein Bürgerstatus festlegen
                </p>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField
                  label="Besitzt du einen Bürgerstatus"
                  name="citizenship"
                  size="xs"
                  class="w-full"
                >
                  <URadioGroup
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    default-value="male"
                    :items="[
                      { label: 'Ja', value: 'true' },
                      { label: 'Nein', value: 'false' },
                    ]"
                    class="prose-p:my-0"
                  />
                </UFormField>
                <UFormField
                  label="Wie hast du deinen Bürgerstatus erlangt?"
                  name="citizenship_reason"
                  size="xs"
                >
                  <URadioGroup
                    indicator="hidden"
                    variant="table"
                    orientation="horizontal"
                    default-value="male"
                    :items="[
                      { label: 'Militärischer Dienst', value: 'military' },
                      { label: 'Hochschulausbildung', value: 'education' },
                      { label: 'Soziales Engagement', value: 'social' },
                    ]"
                    class="prose-p:my-0"
                  />
                </UFormField>
                <USeparator color="ams" class="col-span-2" />
              </div>
            </template>
          </UCard>
        </div>
      </template>
      <template #details>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Detail Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Details zu deiner Person und deinem Geschmack
                </p>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField
                  label="Hobbies"
                  name="hobbies"
                  size="xs"
                  class="w-full"
                >
                  <ul>
                    <li
                      class="flex !my-0 gap-x-4 justify-between py-2 px-6 bg-(--ui-bg-muted)/50 backdrop-blur-xs border border-transparent border-x-(--ui-primary)/10 first:rounded-t-md first:border-t-(--ui-primary)/10 hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
                    >
                      <span class="w-6">1.</span>
                      <span class="text-left flex-1">Schrauben</span>
                      <span><UIcon name="i-lucide-trash-2" /></span>
                    </li>
                    <li
                      class="flex !my-0 gap-x-4 justify-between py-2 px-6 bg-(--ui-bg-muted)/50 backdrop-blur-xs border border-transparent border-x-(--ui-primary)/10 first:rounded-t-md first:border-t-(--ui-primary)/10 hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
                    >
                      <span class="w-6">2.</span>
                      <span class="text-left flex-1">Fliegen</span>
                      <span><UIcon name="i-lucide-trash-2" /></span>
                    </li>
                    <li
                      class="flex !my-0 gap-x-4 justify-between py-2 px-6 bg-(--ui-bg) border border-(--ui-primary)/10 rounded-b-md hover:border-(--ui-primary)/20 hover:bg-(--ui-primary)/5"
                    >
                      <span class="text-left flex-1">
                        <UInput variant="outline" highlight class="w-full" />
                      </span>
                      <span class="flex"
                        ><UIcon name="i-lucide-plus" class="my-auto"
                      /></span>
                    </li>
                  </ul>
                </UFormField>
                <USeparator color="ams" class="col-span-2" />
              </div>
            </template>
          </UCard>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
