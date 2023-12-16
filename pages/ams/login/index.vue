<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types';
import { object, string, type InferType } from 'yup';
const { login } = useDirectusAuth();
const { getFiles } = useDirectusFiles();
const error = ref();
const router = useRouter();
const config = useRuntimeConfig();

const state = reactive({
  username: undefined,
  password: undefined,
});
const form = ref();

const schema = object({
  username: string().required('Erforderlich!'),
  password: string().required('Erforderlich!'),
});

type Schema = InferType<typeof schema>;

const { data: wallpaperList } = await useAsyncData(
  'wallpapers',
  () =>
    getFiles({
      params: {
        fields: ['id'],
        filter: {
          folder: { _eq: '3550a45d-ae4f-49bb-84bd-d4a438b9aaa6' },
        },
        limit: -1,
      },
    }),
  {
    transform: (data) => data.map((obj) => obj.id),
  },
);
const wallpaper = computed(() => wallpaperList.value[Math.floor(Math.random() * wallpaperList.value.length)]);

const onSubmit = async (event: FormSubmitEvent<any>) => {
  form.value.clear();
  error.value = null;
  try {
    console.log({ email: state.username + '@ariscorp.de', password: state.password });
    await login({ email: state.username + '@ariscorp.de', password: state.password });
    router.push('/ams');
  } catch (e) {
    console.error('There was an error:', e.message);
    error.value = e.message.match('\: (.*)')[1];
    if (error.value.startsWith('401') || error.value.startsWith('400')) {
      form.value.setErrors([
        { path: 'username', message: 'Benutzername oder Passwort falsch!' },
        { path: 'password', message: 'Benutzername oder Passwort falsch!' },
      ]);
    } else {
      form.value.setErrors([
        { path: 'username', message: 'Error: ' + e.message },
        { path: 'password', message: 'Error: ' + e.message },
      ]);
    }
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

useHead({
  link: [{ rel: 'preload', href: config.public.fileBase + wallpaper.value }],
});

definePageMeta({
  layout: '',
});
</script>

<template>
  <div>
    <DevOnly>
      <div class="bg-black">
        <code class="block pb-2">Form: {{ form }}</code>
        <code class="block">State: {{ state }}</code>
      </div>
    </DevOnly>
    <div
      class="flex-wrap w-full max-h-screen min-h-screen px-4 mx-auto sm:flex bg-image"
      :style="{ backgroundImage: `url(${$config.public.fileBase + wallpaper})` }"
    >
      <NuxtImg
        class="flex object-contain w-full mx-auto sm:absolute sm:top-0 h-fit sm:left-6 sm:w-80 sm:m-0"
        src="3090187e-6348-4290-a878-af1b2b48c114"
      />
      <div
        class="relative flex w-full max-w-md px-4 py-10 mx-auto mt-12 sm:my-auto rounded-xl backdrop-blur-sm glass-bg"
      >
        <UForm
          ref="form"
          :schema="schema"
          :state="state"
          class="w-full max-w-[540px] py-4 mx-auto space-y-8"
          @submit="onSubmit"
        >
          <UFormGroup label="Benutzername" name="username">
            <UInput
              v-model="state.username"
              icon="i-heroicons-user"
              :trailing="true"
              placeholder="chris.roberts"
              size="xl"
              :ui="inputConfig"
            />
          </UFormGroup>

          <UFormGroup label="Passwort" name="password">
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
            <span class="text-secondary"
              >Noch kein Mitglied? <NuxtLink to="/ams/recruitment" class="text-primary">Bewerben!</NuxtLink></span
            >
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
