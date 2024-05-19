<script setup lang="ts">
import { object, string, type InferType } from 'yup';
import type { FormSubmitEvent } from '#ui/types';
const { login } = useDirectusAuth();
const { readFiles } = useDirectusFiles();
const { readAsyncUsers } = useDirectusUsers();
const error = ref();
const devtools = ref(false);
const router = useRouter();
const route = useRoute();
const { query } = route;
const config = useRuntimeConfig();
const redirectUri = ref(
  route.query.redirect?.toString() ? decodeURIComponent(route.query.redirect.toString()) : '/ams',
);
const submited = ref(false);

const state: { username: string; password: string } = reactive({
  username: '',
});
const form = ref();

const schema = object({
  username: string().required('Erforderlich!'),
});

type Schema = InferType<typeof schema>;

const wallpaperListRes = await readFiles({
  fields: ['id'],
  filter: {
    folder: { _eq: '55452a29-4311-4ac9-ab3f-cc8cc3a28395' },
  },
  limit: -1,
});
const wallpaperList = wallpaperListRes.map((item: any) => item.id);

const selectedWallpaper = ref();
const wallpaper = computed(
  () => selectedWallpaper.value || wallpaperList[Math.floor(Math.random() * wallpaperList.length)],
);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  // TODO: Add complex error handling
  try {
    const { data: users } = await readAsyncUsers({
      query: {
        filter: {
          email: { _eq: event.data.username + '@ariscorp.de' },
        },
        fields: ['id', 'discord_id', 'contact_email', 'title', 'first_name', 'last_name'],
      },
    });

    if (users.value.length !== 1) {
      throw new Error('User not found');
    }

    const user = transformUser(users.value[0]);

    const { data: token } = await useFetch(
      'https://cms.ariscorp.de/flows/trigger/abb6a172-6898-4bda-a3fd-15fa15adc599',
      {
        method: 'POST',
        body: {
          user: user.id,
        },
      },
    );

    if (user.contact_email)
      await useFetch('/api/ams/notifications/email/pw-reset', {
        method: 'POST',
        body: {
          to: user.contact_email,
          token: token.value.token,
          username: user.full_name,
        },
      });

    const created_date = new Date();
    const expire_date = new Date();
    expire_date.setHours(expire_date.getHours() + 24);

    if (user.discord_id)
      await useFetch('https://cms.ariscorp.de/flows/trigger/1a4fa52f-f1b5-4077-8af3-82aae18e6f41', {
        method: 'POST',
        body: {
          discord_id: user.discord_id,
          token: token.value.token,
          name: user.full_name,
          created_ts: created_date.toISOString(),
          created_date: created_date.toLocaleDateString('de-DE'),
          created_time: created_date.toLocaleTimeString('de-DE'),
          expire_date: expire_date.toLocaleDateString('de-DE'),
          expire_time: expire_date.toLocaleTimeString('de-DE'),
        },
      });
  } catch (e) {
    console.error('There was an error:', e);
  } finally {
    submited.value = true;
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

defineShortcuts({
  dead: {
    usingInput: true,
    handler: () => (useCookie('devtools').value = JSON.stringify(!JSON.parse(useCookie('devtools').value ?? 'false'))),
  },
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
    const { user } = await useDirectusAuth();
    if (user.value) {
      return navigateTo(to.query.redirect ? decodeURIComponent(to.query.redirect as string) : '/ams');
    }
  },
});
</script>

<template>
  <div>
    <div v-if="JSON.parse(useCookie('devtools').value ?? 'false')" class="bg-black z-[99] pb-4 px-8 relative">
      <h6>DEV TOOLS:</h6>
      <code class="block pb-1">Form: {{ form }}</code>
      <code class="block">State: {{ state }}</code>
      <code class="block">
        <button
          @click="
            async () => {
              await login('dev@ariscorp.de', 'dev');
              router.push(redirectUri);
            }
          "
        >
          Fast-Login
        </button>
      </code>
      <code class="block">Background: {{ wallpaper }}</code>
      <code class="block">Redirect: {{ decodeURIComponent(String(route.query.redirect)) }}</code>
      <code class="block"
        >Select Background:
        <div class="flex justify-between space-x-6">
          <NuxtImg
            v-for="item in wallpaperList"
            :key="item"
            :src="item"
            :placeholder="[16, 16, 1, 5]"
            class="aspect[16/9] min-w-0 flex-1 cursor-pointer object-cover"
            :class="{ 'border-primary border-2': wallpaper === item }"
            @click="() => (selectedWallpaper = item)"
          />
        </div>
      </code>
    </div>
    <div class="flex-wrap w-full max-h-screen min-h-screen px-4 mx-auto sm:flex bg-image" :style="wallpaperBgStyle">
      <NuxtImg
        src="3090187e-6348-4290-a878-af1b2b48c114"
        :placeholder="[16, 16, 1, 5]"
        class="flex object-contain w-full mx-auto sm:absolute sm:top-0 h-fit sm:left-6 sm:w-80 sm:m-0"
      />
      <div
        class="relative flex w-full max-w-md px-4 pt-8 pb-10 mx-auto mt-12 sm:my-auto rounded-xl backdrop-blur-sm glass-bg"
      >
        <UForm
          v-if="!submited"
          ref="form"
          :schema="schema"
          :state="state"
          class="w-full max-w-[540px] pb-4 mx-auto space-y-8"
          @submit="onSubmit"
        >
          <h2 class="mt-0 text-center">Passwort zurücksetzen</h2>
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

          <div>
            <ButtonDefault class="w-full mt-8 mb-2"> Passwort zurücksetzen </ButtonDefault>
            <div class="text-secondary">
              Du kennst dein Passwort? <NuxtLink to="/ams/login" class="text-primary animate-link">Einloggen!</NuxtLink>
            </div>
            <div class="text-secondary">
              Noch kein Mitglied? <NuxtLink to="/ams/recruitment" class="text-primary animate-link">Bewerben!</NuxtLink>
            </div>
          </div>
        </UForm>
        <div v-else class="w-full max-w-[540px] pb-4 mx-auto space-y-8">
          <h4 class="text-center text-green-600">
            Falls dieser Benutzer existiert wird er auf Discord und/oder per Email einen Reset-Link erhalten.
          </h4>
        </div>
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
