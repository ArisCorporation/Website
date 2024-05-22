<script setup lang="ts">
import { object, string, number, boolean, type InferType } from 'yup';
import type { FormSubmitEvent } from '#ui/types';
const { updateUser } = useDirectusUsers();
const modalStore = useModalStore();

const user = transformUser(await useDirectusAuth().readMe());

const form = ref();
const schema = object({
  contact_email: string().email('Keine gültige Email-Adresse angegeben!').nullable(),
  discord_name: string().nullable(),
});

type Schema = InferType<typeof schema>;

const formdata = reactive({
  contact_email: user.contact_email || '',
  discord_name: user.discord_name || '',
});
const initialFormdata = reactive({ ...formdata });

const discord_id = ref(user.discord_id || '');

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const userId = user.id;
  const updatedUser = {};

  for (const key in formdata) {
    if (formdata[key as keyof typeof formdata] !== initialFormdata[key as keyof typeof initialFormdata]) {
      updatedUser[key as keyof typeof updatedUser] = formdata[key as keyof typeof formdata];
    }
  }

  if (Object.keys(updatedUser).length === 0) {
    return;
  }

  try {
    const new_data = await updateUser(userId, updatedUser, { limit: -1 });

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
          <UButton color="green" type="submit">Speichern</UButton>
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
          label="Discord Benutzername"
          name="discord_name"
          description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du einen Discord Benutzernamen angeben."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <div class="relative">
            <UInput
              v-model="formdata.discord_name"
              size="md"
              autocomplete="off"
              :icon="
                formdata.discord_name || initialFormdata.discord_name
                  ? formdata.discord_name === initialFormdata.discord_name
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="user_name"
            />
            <template v-if="formdata.discord_name || initialFormdata.discord_name">
              <button
                v-if="formdata.discord_name === initialFormdata.discord_name"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.discord_name = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.discord_name = initialFormdata.discord_name"
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
