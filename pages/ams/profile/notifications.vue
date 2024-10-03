<script setup lang="ts">
import { object, string, number, boolean, type InferType } from 'yup';
import type { FormSubmitEvent } from '#ui/types';

const { directus, readMe, updateMe, updateUser } = useCMS();
const modalStore = useModalStore();
const config = useRuntimeConfig();
const saveLoading = ref(false);
const submitSuccess = ref(false);

const { data: user, refresh: refreshUser } = await useAsyncData('AMS:ME', () => directus.request(readMe()), {
  transform: (data) => transformUser(data),
});

type discordMember = {
  id: string;
  label: string;
  global_name: string | null;
  username: string | null;
  nick: string | null;
  avatar: {
    src: string;
  };
};
const discordMembers: discordMember[] = await useFetch('/api/ams/notifications/discord/getMembers').then(
  (data: { data: { value: discordMember[] } }) => {
    return data.data.value;
  },
);

const form = ref();
const schema = object({
  contact_email: string().email('Keine gültige Email-Adresse angegeben!').nullable(),
  discord_name: string().nullable(),
});

type Schema = InferType<typeof schema>;

const formdata = reactive({
  contact_email: user.value.contact_email || '',
  discord_name: user.value.discord_name || '',
  discord_user: discordMembers.find((e) => e.id === user.value.discord_id) || null,
});
const initialFormdata = reactive({ ...formdata });

const discord_id = ref(user.value.discord_id || '');

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const userId = user.id;
  const updatedUser = {};

  for (const key in formdata) {
    if (formdata[key as keyof typeof formdata] !== initialFormdata[key as keyof typeof initialFormdata]) {
      updatedUser[key as keyof typeof updatedUser] = formdata[key as keyof typeof formdata];
    }
  }

  updatedUser.discord_id = updatedUser.discord_user?.id || '';

  delete updatedUser.discord_user;
  delete updatedUser.discord_name;

  if (Object.keys(updatedUser).length === 0) {
    return;
  }

  try {
    submitSuccess.value = false;
    saveLoading.value = true;
    const new_data = await directus.request(updateMe(updatedUser, { limit: -1 }));
    saveLoading.value = false;
    submitSuccess.value = true;

    for (const key in formdata) {
      if (initialFormdata[key as keyof typeof initialFormdata] !== formdata[key as keyof typeof formdata]) {
        initialFormdata[key as keyof typeof initialFormdata] = formdata[key as keyof typeof formdata];
      }
    }

    discord_id.value = new_data.discord_id;
  } catch (e) {
    console.error(e);
  }
}

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <div>
    <UForm :ref="form" :schema="schema" :state="formdata" validate-on="submit" @submit="onSubmit">
      <div class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-2 mb-6">
        <div class="flex items-center justify-between gap-4 mt-4">
          <div class="flex flex-wrap items-center gap-1.5">
            <div>
              <p class="p-0 font-semibold text-white">Mitteilungen</p>
              <p class="p-0 mt-1 text-sm text-tbase/50">
                Hier kannst du einstellen, wie du wichtige Benachrichtigungen wie Chat-Nachrichten,
                Passwort-Zurücksetzungen und andere Mitteilungen erhalten möchtest.
              </p>
            </div>
          </div>
          <UButton
            :color="form?.errors?.length ? 'red' : 'green'"
            type="submit"
            :loading="saveLoading"
            :icon="submitSuccess ? 'i-heroicons-check-16-solid' : ''"
          >
            Speichern
          </UButton>
        </div>
        <UFormGroup
          label="Kontakt Email"
          name="contact_email"
          description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du eine Kontakt Email angeben."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <div class="relative">
            <UInput
              v-model="formdata.contact_email"
              size="md"
              autocomplete="off"
              :icon="
                formdata.contact_email || initialFormdata.contact_email
                  ? formdata.contact_email === initialFormdata.contact_email
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="contact@email.com"
            />
            <template v-if="formdata.contact_email || initialFormdata.contact_email">
              <button
                v-if="formdata.contact_email === initialFormdata.contact_email"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.contact_email = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.contact_email = initialFormdata.contact_email"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </div>
        </UFormGroup>
        <UFormGroup
          label="Discord Benutzer"
          name="discord_user"
          description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du einen Discord Benutzer angeben."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <div class="relative">
            <USelectMenu
              v-model="formdata.discord_user"
              :options="discordMembers"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['label', 'global_name', 'username', 'nick']"
              size="md"
              :ui="
                formdata.discord_user || initialFormdata.discord_user
                  ? {
                      leading: {
                        padding: {
                          xl: 'ps-10',
                        },
                      },
                    }
                  : { leading: { padding: { xl: 'hidden' } } }
              "
              :icon="
                formdata.discord_user || initialFormdata.discord_user
                  ? formdata.discord_user === initialFormdata.discord_user
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
            >
              <template v-if="formdata.discord_user || initialFormdata.discord_user" #leading />
              <template #label>
                <span v-if="formdata.discord_user">{{ formdata.discord_user.label }}</span>
                <span v-else class="text-[13.9px]">Kein Discord Benutzer ausgewählt</span>
              </template>
              <template #option="{ option }">
                <UAvatar v-if="option" :src="option.avatar.src" size="2xs" />
                <span v-if="option">{{ option.label }}</span>
                <span v-else>Kein Discord Benutzer</span>
              </template>
            </USelectMenu>
            <template v-if="formdata.discord_user || initialFormdata.discord_user">
              <button
                v-if="formdata.discord_user === initialFormdata.discord_user"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.discord_user = null"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.discord_user = initialFormdata.discord_user"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </div>
        </UFormGroup>
        <UFormGroup
          label="Discord ID"
          name="discord_id"
          description="Hier ist deine Discord ID. Diese wird generiert sobald du einen Benutzernamen angibst und speicherst."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <UInput
            size="md"
            disabled
            autocomplete="off"
            trailing
            placeholder="xxxxxxxxxxxxx"
            :model-value="discord_id"
            :ui="{ leading: { padding: { md: 'ps-24' } } }"
          >
            <template #leading>
              <span class="text-sm text-dark-gray">Discord-ID:</span>
            </template>
          </UInput>
        </UFormGroup>
      </div>
    </UForm>
  </div>
</template>
