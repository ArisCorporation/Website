<script setup lang="ts">
import type { USelectMenu } from '#components'
import { z } from 'zod'
import type { CommLink, CommLinkChannel } from '~~/types'

const formData = reactive<Partial<Schema>>({
  name: '',
  channel: '',
  content: '',
})

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

if (data.value) {
  formData.name = data.value.name as string
  formData.channel = data.value.channel as string
  formData.content = data.value.content as string

  console.log(formData)
}

const commLinkSchema = z.object({
  name: z.string().min(1, 'Titel ist erforderlich'),
  channel: z.string().min(1, 'Channel ist erforderlich'),
  content: z.string().min(500, 'Inhalt ist erforderlich'),
})

type Schema = z.output<typeof commLinkSchema>

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
    <UForm :state="formData" :schema="commLinkSchema">
      <div class="flex flex-wrap-reverse">
        <UCard variant="ams" class="w-full lg:hidden px-4 mt-4">
          <template #default>
            <div class="flex justify-between space-x-2">
              <UButton
                @click="useRouter().back()"
                variant="subtle"
                color="error"
                type="button"
                label="Abbrechen"
                class="w-1/2 flex justify-center"
              />
              <UButton
                variant="subtle"
                type="submit"
                label="Speichern"
                class="w-1/2 flex justify-center"
              />
            </div>
          </template>
        </UCard>
        <div class="lg:w-2/3 w-full px-4">
          <UFormField name="content">
            <UiEditor v-model="formData.content" />
          </UFormField>
        </div>
        <div class="w-full lg:w-1/3 px-4 mb-4 lg:mb-0 lg:px-0">
          <UCard variant="ams" :ui="{ body: '!pt-2' }">
            <template #header>
              <div class="prose prose-invert">
                <h3>Details</h3>
              </div>
            </template>
            <template #default>
              <div class="space-y-4">
                <UFormField name="name" label="Titel">
                  <UInput
                    v-model="formData.name"
                    highlight
                    placeholder="z.B. Monthly Report April 2955"
                    class="w-full"
                  />
                </UFormField>
                <UFormField name="channel" label="Channel">
                  <USelectMenu
                    v-model="formData.channel"
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
          <UCard variant="ams" class="hidden lg:block mt-4">
            <template #default>
              <div class="flex justify-between space-x-2">
                <UButton
                  @click="useRouter().back()"
                  variant="subtle"
                  color="error"
                  type="button"
                  label="Abbrechen"
                  class="w-1/2 flex justify-center"
                />
                <UButton
                  variant="subtle"
                  type="submit"
                  label="Speichern"
                  class="w-1/2 flex justify-center"
                />
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </UForm>
  </div>
</template>
