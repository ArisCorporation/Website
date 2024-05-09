<script setup lang="ts">
import * as yup from 'yup';
import YupPassword from 'yup-password';
import type { FormSubmitEvent } from '#ui/types';
const config = useRuntimeConfig();
const SidebarStore = useSidebarStore();
const { user, logout, refresh: refreshUser, readMe } = useDirectusAuth();
const router = useRouter();
const modalStore = useModalStore();
const { updateUser } = useDirectusUsers();

YupPassword(yup);

const handleLogout = async () => {
  await logout();
  router.push('/');
};

const sidebarItems = [
  {
    name: 'Home',
    icon: 'heroicons:home-solid',
    link: '',
    level: 0,
  },
  {
    name: 'Flotte',
    icon: 'IconsNavigationFleet',
    link: '/fleet',
    level: 0,
  },
  {
    name: 'Mitarbeiter',
    icon: 'IconsNavigationMembers',
    link: '/employees',
    level: 0,
  },
  {
    name: 'Administration',
    icon: 'ri:admin-line',
    link: '/administration',
    level: 4,
  },
  {
    name: 'Toolbox',
    link: '/toolbox',
    level: 0,
  },
];

const sidebarUserItems = [
  {
    name: 'Mein Hangar',
    icon: 'IconsNavigationHangar',
    link: '/hangar',
  },
  {
    name: 'Mein Profil',
    icon: 'heroicons:user-20-solid',
    link: '/profile',
  },
  {
    name: 'Logout',
    icon: 'material-symbols:logout',
    action: handleLogout,
  },
];

const pw_schema = yup.object({
  password: yup
    .string()
    .required('Bitte gib dein Passwort ein.')
    .min(8, 'Dein Passwort muss mindestens 8 Zeichen lang sein.')
    .minLowercase(1, 'Dein Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .minUppercase(1, 'Dein Passwort muss mindestens einen Großbuchstaben enthalten.')
    .minNumbers(1, 'Dein Passwort muss mindestens eine Zahl enthalten.')
    .minSymbols(1, 'Dein Passwort muss mindestens ein Sonderzeichen enthalten.'),
  confirm_pw: yup
    .string()
    .required('Bitte bestätige dein Passwort.')
    .oneOf([yup.ref('password'), null], 'Passwörter stimmen nicht überein.'),
});

type pw_Schema = yup.InferType<typeof pw_schema>;

const pw_formdata = reactive({
  password: '',
  confirm_pw: '',
});

const onPwSubmit = async (event: FormSubmitEvent<pw_Schema>) => {
  try {
    await updateUser(user.value.id, { password: pw_formdata.password, temporary_password: false }, {});
    await refreshUser();
    if (!user.value.temporary_password) modalStore.unlockModal();
    modalStore.closeModal();
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  if (user.value?.temporary_password) {
    modalStore.openModal('Temoräres Password', {
      type: 'temporary-pw',
      hideCloseButton: true,
      locked: true,
    });
  }
});

defineShortcuts({
  dead: {
    usingInput: true,
    handler: () => (useCookie('devtools').value = JSON.stringify(!JSON.parse(useCookie('devtools').value ?? 'false'))),
  },
});

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

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - A.M.S. - Astro Research and Industrial Service Corporation`
      : 'A.M.S. - Astro Research and Industrial Service Corporation';
  },
});
</script>

<template>
  <div class="lg:grid lg:grid-cols-[16rem,_1fr]">
    <TheModal :locked="user?.temporary_password ? false : false">
      <template #content>
        <slot name="modalContent" />
        <template v-if="user?.temporary_password">
          <h4>Achtung! Du hast ein Standart-Passwort und musst es ändern bevor du das AMS nutzen kannst.</h4>
          <UForm :schema="pw_schema" :state="pw_formdata" validate-on="submit" @submit="onPwSubmit">
            <UFormGroup
              label="Passwort"
              name="password"
              description="Hier kannst du dein Passwort ganz einfach ändern."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <UInput
                  v-model="pw_formdata.password"
                  size="md"
                  autocomplete="off"
                  :icon="pw_formdata.password !== '' && 'i-heroicons-x-mark-16-solid'"
                  placeholder="******"
                  type="password"
                />
                <button
                  v-if="pw_formdata.password !== ''"
                  type="button"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="pw_formdata.password = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </div>
            </UFormGroup>
            <UFormGroup
              label="Passwort bestätigen"
              name="confirm_pw"
              description="Hier kannst du dein Passwort ganz einfach ändern."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <UInput
                  v-model="pw_formdata.confirm_pw"
                  size="md"
                  autocomplete="off"
                  :icon="pw_formdata.confirm_pw !== '' && 'i-heroicons-x-mark-16-solid'"
                  placeholder="******"
                  type="password"
                />
                <button
                  v-if="pw_formdata.confirm_pw !== ''"
                  type="button"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="pw_formdata.confirm_pw = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </div>
            </UFormGroup>
            <ButtonDefault type="submit"><p class="px-6 py-0">Speichern</p></ButtonDefault>
          </UForm>
        </template>
      </template>
    </TheModal>
    <USlideover v-model="modalStore.isSlideOpen">
      <!-- <div class="flex-1 p-4 scrollbar-gray-thin"> -->
      <slot name="slideCard">
        <div class="flex-1 overflow-y-scroll">
          <UCard
            class="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-gray-thin"
            :ui="{
              body: { base: 'flex-1' },
              background: 'bg-bprimary',
              ring: '',
              divide: 'divide-y divide-btertiary',
            }"
          >
            <template #header>
              <slot name="slideHeader" />
            </template>
            <slot name="slideContent" />
            <template #footer>
              <slot name="slideFooter" />
            </template>
          </UCard>
        </div>
      </slot>
    </USlideover>
    <div
      v-if="!modalStore.isModalOpen && user.temporary_password"
      class="w-full h-full absolute top-0 left-0 z-[9999] bg-black opacity-50"
    />
    <Sidebar
      banner="IconsLogosAmsBanner"
      base-url="/ams"
      :sidebar-items="sidebarItems"
      :user-sidebar-items="sidebarUserItems"
    />
    <div id="sidebar-space" class="hidden lg:block" />
    <!-- lg:max-w-[calc(100vw-16rem)]  lg:ml-64 -->
    <div class="flex flex-col justify-between flex-1 w-full max-w-full min-h-screen">
      <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.toggleMobileSidebar" />

      <div v-if="JSON.parse(useCookie('devtools').value)" class="bg-black z-[99] pb-4 px-8">
        <h6>DEV TOOLS:</h6>
        <code class="block pb-2">User: {{ user }}</code>
      </div>
      <DevOnly>
        <ButtonDefault
          class="w-fit"
          @click="useCookie('devtools').value = JSON.stringify(!JSON.parse(useCookie('devtools').value))"
        >
          <Icon
            name="mdi-light:console"
            class="w-6 h-6"
            :class="{ 'text-primary': JSON.parse(useCookie('devtools').value) }"
          />
        </ButtonDefault>
      </DevOnly>
      <div class="flex flex-wrap w-full px-4 mt-4">
        <Icon name="IconsLogosAmsBanner" class="w-1/4 aspect-[33/11] -mb-2 h-auto" />
        <div class="relative mt-auto ml-auto group">
          <div class="absolute right-0 justify-center hidden mt-2 text-center w-14 group-hover:flex">Hilfe</div>
        </div>
      </div>
      <hr class="my-2" />
      <div class="container min-h-screen px-4 mx-auto">
        <div class="mt-4">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>
