<script setup lang="ts">
import type { USelectMenu } from '#components'
import type { CommLink, CommLinkChannel } from '~~/types'

const { id } = useRoute().params

const { data } = await useAsyncData<CommLink>(
  computed(() => `ams:comm-link-editing-${id}`),
  async () =>
    useDirectus(
      readItem('comm_links', id as string, {
        fields: ['*'],
      })
    )
)

const { data: channels } = await useAsyncData<CommLinkChannel[]>(
  'ams:comm-link-channels',
  async () =>
    await useDirectus(
      readItems('comm_link_channels', {
        fields: ['*'],
        limit: -1,
      })
    )
)

console.log(data)
definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-newspaper"
      title="Comm-Link"
      description="Lese und Verwalte interne Artikel von Mitgliedern der ArisCorp."
    />
    <div class="flex flex-wrap-reverse">
      <div class="w-2/3 px-4 max-h-[calc(100vh_-_150px)]">
        <UiEditor v-model="data.content" class="size-full" />
      </div>
      <div class="w-1/3">
        <UForm>
          <UCard variant="ams" :ui="{ body: '!pt-2' }">
            <template #header>
              <div class="prose prose-invert">
                <h3>Details</h3>
              </div>
            </template>
            <template #default>
              <div class="space-y-4">
                <UFormField label="Titel">
                  <UInput
                    v-model="data.name"
                    highlight
                    placeholder="z.B. Monthly Report April 2955"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Channel">
                  <USelectMenu
                    v-model="data.channel"
                    variant="ams"
                    value-key="id"
                    label-key="name"
                    :items="channels"
                    placeholder="z.B. Monthly Report April 2955"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </template>
          </UCard>
          <UCard variant="ams" class="mt-4">
            <template #default>
              <div class="flex justify-between space-x-2">
                <UButton
                  @click="useRouter().back()"
                  variant="subtle"
                  color="error"
                  label="Abbrechen"
                  class="w-1/2 flex justify-center"
                />
                <UButton
                  variant="subtle"
                  label="Speichern"
                  class="w-1/2 flex justify-center"
                />
              </div>
            </template>
          </UCard>
        </UForm>
      </div>
    </div>
  </div>
</template>
