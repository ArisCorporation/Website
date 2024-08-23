<script setup lang="ts">
import { object, string, type InferType } from 'yup';
import type { FormSubmitEvent } from '#ui/types';

const { directus, readFiles, readMe, login, logout } = useCMS();
const error = ref();
const router = useRouter();
const route = useRoute();
const { query } = route;
const config = useRuntimeConfig();
const redirectUri = ref(route.query.redirect?.toString() ? route.query.redirect : '/ams');
// console.log(await directus.request(readMe()))
console.log(await directus.getToken());
const state: { username: string; password: string } = reactive({
  username: '',
  password: '',
});
const form = ref();

const schema = object({
  username: string().required('Erforderlich!'),
  password: string().required('Erforderlich!'),
});

type Schema = InferType<typeof schema>;

const { data: wallpaperList } = await useAsyncData(
  'LOGIN_WALLPAPER_LIST',
  () =>
    directus.request(
      readFiles({
        fields: ['id'],
        filter: {
          folder: { _eq: '55452a29-4311-4ac9-ab3f-cc8cc3a28395' },
        },
        limit: -1,
      }),
    ),
  {
    transform: (data) => data.map((item) => item.id),
  },
);

const selectedWallpaper = ref();
const wallpaper = computed(
  () => selectedWallpaper.value || unref(wallpaperList)?.[Math.floor(Math.random() * unref(wallpaperList)?.length)],
);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  // TODO: Add complex error handling
  try {
    await directus.login(event.data.username + '@ariscorp.de', event.data.password);
    router.push(unref(redirectUri.value.toString()));
  } catch (e) {
    console.error('There was an error:', e);

    form.value.setErrors([
      { path: 'username', message: 'Benutzername oder Passwort falsch!' },
      { path: 'password', message: 'Benutzername oder Passwort falsch!' },
    ]);

    event.data.username = '';
    event.data.password = '';
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

if (query) {
  if (query.username) {
    state.username = String(query.username);
  }
  if (query.password) {
    state.password = String(query.password);
  }
}

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
  link: [{ rel: 'preload', href: config.public.fileBase + wallpaper?.value }],
  link: [{ rel: 'preload', href: img(wallpaper?.value) }],
  title: 'Log In - A.M.S. - Astro Research and Industrial Service Corporation',
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
        :placeholder="[16, 7, 1, 5]"
        class="flex object-contain w-full mx-auto sm:absolute sm:top-0 h-fit sm:left-6 sm:w-80 sm:m-0 aspect-[1112/477]"
      />
      <div
        class="relative flex w-full max-w-md px-4 pt-8 pb-10 mx-auto mt-12 sm:my-auto rounded-xl backdrop-blur-sm glass-bg"
      >
        <UForm
          ref="form"
          :schema="schema"
          :state="state"
          class="w-full max-w-[540px] pb-4 mx-auto space-y-8"
          @submit="onSubmit"
        >
          <h2 class="mt-0 text-center">Log In</h2>
          <UFormGroup
            :ui="{ error: '-mb-8 pt-1 text-red-500 dark:text-red-400' }"
            required
            label="Benutzername"
            name="username"
          >
            <UInput
              v-model="state.username"
              icon="i-heroicons-user"
              :trailing="true"
              placeholder="chris.roberts"
              size="xl"
              :ui="inputConfig"
            />
          </UFormGroup>

          <UFormGroup
            :ui="{ error: 'mt-0 -mb-9 text-red-500 dark:text-red-400' }"
            required
            label="Passwort"
            name="password"
          >
            <UInput
              v-model="state.password"
              icon="i-heroicons-lock-closed"
              :trailing="true"
              placeholder="**********"
              size="xl"
              type="password"
              :ui="inputConfig"
            />
          </UFormGroup>

          <div>
            <ButtonDefault class="w-full mt-8 mb-2"> Log In </ButtonDefault>
            <div class="text-secondary">
              Passwort vergessen?
              <NuxtLink to="/ams/login/pw-reset" class="text-primary animate-link"> Zurücksetzen! </NuxtLink>
            </div>
            <div class="text-secondary">
              Noch kein Mitglied?
              <NuxtLink to="/ams/recruitment" class="text-primary animate-link"> Bewerben! </NuxtLink>
            </div>
          </div>
        </UForm>
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
