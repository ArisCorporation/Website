<script setup lang="ts">
import { object, string, type InferType, ref as yup_ref } from 'yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';
import type { FormSubmitEvent } from '#ui/types';

const { directus, readFiles, readUsers } = useCMS();
const error = ref();
const devtools = ref(false);
const router = useRouter();
const route = useRoute();
const { query } = route;
const config = useRuntimeConfig();
const redirectUri = ref(
  route.query.redirect?.toString() ? decodeURIComponent(route.query.redirect.toString()) : '/ams',
);
const submitted = ref(false);
const resetted = ref(false);

YupPassword(yup);

const request_state: { username: string; password: string } = reactive({
  username: '',
});
const reset_state: { username: string; password: string } = reactive({
  password: '',
});

const request_form = ref();
const reset_form = ref();

const request_schema = object({
  username: string().required('Erforderlich!'),
});
const reset_schema = object({
  password: string()
    .min(8, 'Dein Passwort muss mindestens 8 Zeichen lang sein.')
    .minLowercase(1, 'Dein Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .minUppercase(1, 'Dein Passwort muss mindestens einen Großbuchstaben enthalten.')
    .minNumbers(1, 'Dein Passwort muss mindestens eine Zahl enthalten.')
    .minSymbols(1, 'Dein Passwort muss mindestens ein Sonderzeichen enthalten.')
    .required('Erforderlich!'),
  confirm_password: string().oneOf([yup_ref('password'), null], 'Passwörter stimmen nicht überein.'),
});

type RequestSchema = InferType<typeof request_schema>;
type ResetSchema = InferType<typeof reset_schema>;

const { data: wallpaperList } = await useAsyncData(
  'LOGIN_WALLPAPER_LIST',
  () => {
    return directus.request(
      readFiles({
        fields: ['id'],
        filter: {
          folder: { _eq: 'da8e91e5-46b4-424a-875b-69b38ca4bcfb' },
        },
        limit: -1,
      }),
    );
  },
  {
    transform: (data) => data.map((item: any) => item.id),
  },
);

const selectedWallpaper = ref();
const wallpaper = computed(
  () => selectedWallpaper.value || unref(wallpaperList)?.[Math.floor(Math.random() * unref(wallpaperList)?.length)],
);

const onRequestSubmit = async (event: FormSubmitEvent<RequestSchema>) => {
  // TODO: Add complex error handling
  try {
    const { data: users } = await useAsyncData('READ_USERS', () => {
      return directus.request(
        readUsers({
          filter: {
            email: { _eq: event.data.username + '@ariscorp.de' },
            hidden: { _eq: false },
          },
          fields: ['id', 'discord_id', 'contact_email', 'title', 'first_name', 'last_name'],
        }),
      );
    });

    if (unref(users).length !== 1) {
      throw new Error('User not found');
    }

    const user = transformUser(unref(users)[0]);

    const { data: token } = await useFetch(
      'https://studio.ariscorp.de/flows/trigger/abb6a172-6898-4bda-a3fd-15fa15adc599',
      {
        method: 'POST',
        body: {
          user: user.id,
        },
      },
    );

    if (unref(token)?.code) {
      throw new Error(unref(token)?.message);
    }

    if (user.contact_email)
      await useFetch('/api/ams/notifications/email/pw-reset', {
        method: 'POST',
        body: {
          to: user.contact_email,
          token: unref(token).token,
          username: user.full_name,
        },
      });

    const created_date = new Date();
    const expire_date = new Date();
    expire_date.setHours(expire_date.getHours() + 24);

    if (user.discord_id)
      await useFetch('https://studio.ariscorp.de/flows/trigger/1a4fa52f-f1b5-4077-8af3-82aae18e6f41', {
        method: 'POST',
        body: {
          discord_id: user.discord_id,
          token: unref(token).token,
          name: user.full_name,
          created_ts: created_date.toISOString(),
          created_date: created_date.toLocaleDateString('de-DE'),
          created_time: created_date.toLocaleTimeString('de-DE'),
          expire_date: expire_date.toLocaleDateString('de-DE'),
          expire_time: expire_date.toLocaleTimeString('de-DE'),
        },
      });

    submitted.value = true;
  } catch (e) {
    console.error('There was an error:', e);
    request_form.value.setErrors([{ path: 'username', message: 'Ein Fehler ist aufgetreten!' }]);
  }
};

const onResetSubmit = async (event: FormSubmitEvent<ResetSchema>) => {
  // TODO: Add complex error handling
  try {
    const { data: req } = await useFetch('https://studio.ariscorp.de/flows/trigger/2224a8a5-da10-4a7a-9023-8899741fce37', {
      method: 'POST',
      body: {
        token: query.token,
        password: event.data.password,
      },
    });

    if (req.value?.code) {
      throw new Error(req.value?.message);
    }
    submitted.value = true;
  } catch (e) {
    console.error('There was an error:', e);
    reset_form.value.setErrors([
      { path: 'password', message: 'Ein Fehler ist aufgetreten!' },
      { path: 'password_confirm', message: 'Ein Fehler ist aufgetreten!' },
    ]);
  }
};

const inputConfig = {
  strategy: 'override',
  color: {
    white: {
      outline: 'bg-bprimary bg-opacity-60 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary',
    },
  },
  variant: {
    outline: 'bg-bprimary bg-opacity-60 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary',
  },
};

useSeoMeta({
  description:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  ogTitle: 'Astro Research and Industrial Service Corporation',
  ogDescription:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  ogImage: config.public.fileBase + '5021a418-1134-4fbe-ba4f-a243468d2d72',
  twitterDescription:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  twitterImage: config.public.fileBase + '5021a418-1134-4fbe-ba4f-a243468d2d72',
  twitterCard: 'summary_large_image',
});

const img = useImage();
const wallpaperBgStyle = computed(() => {
  const imgUrl = img(wallpaper?.value);
  return { backgroundImage: `url('${imgUrl}')` };
});

useHead({
  // link: [{ rel: 'preload', href: config.public.fileBase + wallpaper?.value }],
  link: [{ rel: 'preload', href: img(wallpaper?.value) }],
  title: 'Password zurücksetzen - A.M.S. - Astro Research and Industrial Service Corporation',
});

definePageMeta({
  layout: false,
  middleware: async function (to, _from) {
    const signedIn = await useCMS().signedIn();

    if (signedIn) {
      return navigateTo(to.query.redirect ? decodeURIComponent(to.query.redirect as string) : '/ams');
    }
  },
});
</script>

<template>
  <div>
    <div class="flex-wrap w-full max-h-screen min-h-screen px-4 mx-auto sm:flex bg-image" :style="wallpaperBgStyle">
      <NuxtImg
        src="3090187e-6348-4290-a878-af1b2b48c114"
        :placeholder="[16, 16, 1, 5]"
        class="flex object-contain w-full mx-auto sm:absolute sm:top-0 h-fit sm:left-6 sm:w-80 sm:m-0"
      />
      <div
        class="relative flex w-full max-w-md px-4 pt-8 pb-10 mx-auto mt-12 sm:my-auto rounded-xl backdrop-blur-sm glass-bg"
      >
        <template v-if="!query.token">
          <UForm
            v-if="!submitted"
            ref="request_form"
            :schema="request_schema"
            :state="request_state"
            class="w-full max-w-[540px] pb-4 mx-auto space-y-8"
            @submit="onRequestSubmit"
          >
            <h2 class="mt-0 text-center">Passwort zurücksetzen</h2>
            <UFormGroup
              :ui="{ error: '-mb-8 pt-1 text-red-500 dark:text-red-400' }"
              required
              label="Passwort"
              name="username"
            >
              <UInput
                v-model="request_state.username"
                icon="i-heroicons-user"
                :trailing="true"
                placeholder="chris.roberts"
                size="xl"
                :ui="inputConfig"
              />
            </UFormGroup>

            <div>
              <ButtonDefault class="w-full mt-8 mb-2"> Passwort zurücksetzen </ButtonDefault>
              <div class="text-secondary">
                Du kennst dein Passwort?
                <NuxtLink to="/ams/login" class="text-primary animate-link"> Einloggen! </NuxtLink>
              </div>
              <div class="text-secondary">
                Noch kein Mitglied?
                <NuxtLink to="/ams/recruitment" class="text-primary animate-link"> Bewerben! </NuxtLink>
              </div>
            </div>
          </UForm>
          <div v-else class="w-full max-w-[540px] pb-4 mx-auto space-y-8">
            <h4 class="text-center text-green-600">
              Falls dieser Benutzer existiert wird er auf Discord und/oder per Email einen Reset-Link erhalten.
            </h4>
          </div>
        </template>
        <template v-else>
          <UForm
            v-if="!submitted"
            ref="form"
            :schema="reset_schema"
            :state="reset_state"
            class="w-full max-w-[540px] pb-4 mx-auto space-y-8"
            @submit="onResetSubmit"
          >
            <h2 class="mt-0 text-center">Passwort zurücksetzen</h2>
            <UFormGroup
              :ui="{ error: '-mb-8 pt-1 text-red-500 dark:text-red-400' }"
              required
              label="Passwort"
              name="password"
            >
              <UInput
                v-model="reset_state.password"
                type="password"
                icon="i-heroicons-user"
                :trailing="true"
                placeholder="********"
                size="xl"
                :ui="inputConfig"
              />
            </UFormGroup>
            <UFormGroup
              :ui="{ error: '-mb-8 pt-1 text-red-500 dark:text-red-400' }"
              required
              label="Passwort bestätigen"
              name="confirm_password"
            >
              <UInput
                v-model="reset_state.confirm_password"
                type="password"
                icon="i-heroicons-user"
                :trailing="true"
                placeholder="********"
                size="xl"
                :ui="inputConfig"
              />
            </UFormGroup>

            <div>
              <ButtonDefault class="w-full mt-8 mb-2"> Passwort zurücksetzen </ButtonDefault>
              <div class="text-secondary">
                Du kennst dein Passwort?
                <NuxtLink to="/ams/login" class="text-primary animate-link"> Einloggen! </NuxtLink>
              </div>
              <div class="text-secondary">
                Noch kein Mitglied?
                <NuxtLink to="/ams/recruitment" class="text-primary animate-link"> Bewerben! </NuxtLink>
              </div>
            </div>
          </UForm>
          <div v-else-if="submitted" class="w-full max-w-[540px] pb-4 mx-auto space-y-8 flex flex-wrap">
            <h4 class="text-center text-green-600">Dein Passwort wurde erfolgreich zurückgesetzt!</h4>
            <NuxtLink to="/ams/login" class="m-auto text-aris-400 animate-link"> Jetzt einloggen! </NuxtLink>
          </div>
        </template>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="postcss">
.glass-bg {
  background: radial-gradient(50% 49.92% at 50% 50.08%, rgba(17, 17, 17, 0.5) 0%, rgba(17, 17, 17, 0.6) 100%);
}
</style>
