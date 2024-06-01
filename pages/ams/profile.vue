<script setup lang="ts">
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

const { updateMe } = useDirectusUsers();
const modalStore = useModalStore();
const user = ref(transformUser(await useDirectusAuth().readMe()));
const { uploadFiles, deleteFile } = useDirectusFiles();
const avatarUploadLoading = ref(false);
const { push } = useRouter();

const links = reactive([
  [
    {
      label: 'Profil',
      avatar: {
        src: user.value.avatar_url,
      },
      to: '/ams/profile',
      exact: true,
    },
    {
      label: 'Mitteilungen',
      icon: 'i-heroicons-bell',
      to: '/ams/profile/notifications',
    },
    {
      label: 'Privatsphäre',
      icon: 'i-mdi-account-lock-outline',
      to: '/ams/profile/privacy',
    },
  ],
  [
    {
      label: 'Hilfe',
      icon: 'i-heroicons-book-open',
      to: '/ams/profile/help',
    },
  ],
]);

const cropper = ref();

function setCropperImage(e: any) {
  const file = e.target.files[0];

  if (!file.type.includes('image/')) {
    alert('Please select an valid image file');
    return;
  }

  if (typeof FileReader === 'function') {
    modalStore.openModal('Avatar ändern', { type: 'avatar-cropper', hideCloseButton: true });
    const reader = new FileReader();

    reader.onload = (event: any) => {
      cropper.value.replace(event.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    alert('Sorry, FileReader API not supported');
  }
}

async function saveAvatar() {
  const old_avatar = user.value.avatar;
  await cropper.value.getCroppedCanvas().toBlob(async (blob: Blob) => {
    const formData = new FormData();

    formData.append('title', `${user.value.full_name} - Avatar.png`);
    formData.append('folder', '8658f40d-77d9-44c4-8f0d-af820855a3bc');
    formData.append('file', blob, `${user.value.slug}-avatar.png`);

    try {
      avatarUploadLoading.value = true;
      const new_avatar = await uploadFiles(formData);
      await updateMe({ avatar: new_avatar.id }, { fields: ['id'] });
      avatarUploadLoading.value = false;
      modalStore.closeModal();

      await deleteFile(old_avatar);
    } catch (e) {
      console.error(e);
    } finally {
      user.value = transformUser(await useDirectusAuth().readMe());
      if (links[0][0]?.avatar) {
        links[0][0].avatar.src = user.value.avatar_url;
      }
    }
  });
}

function readAsDataURL(file: any) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = function (event) {
      resolve(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

defineShortcuts({
  h: () => push('/ams/profile/help'),
  '?': () => push('/ams/profile/help'),
});

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <template v-if="modalStore.type === 'avatar-cropper'">
        <div>
          <div class="divide-y-2 divide-btertiary">
            <!-- <UCard> -->
            <div class="pb-4">
              <DefaultPanel class="mx-auto w-fit">
                <!-- <div class="relative"> -->
                <template v-if="avatarUploadLoading">
                  <div class="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit z-[9999]">
                    <LoadingBasic class="w-10 h-10 text-white" />
                  </div>
                  <div
                    class="absolute top-0 bottom-0 left-0 right-0 m-auto w-full h-full z-[9997] bg-black opacity-75"
                  />
                </template>
                <VueCropper
                  ref="cropper"
                  class="overflow-hidden aspect-[270/320] w-[270px] h-[320px]"
                  :aspect-ratio="270 / 320"
                  :toggle-drag-mode-on-dblclick="false"
                  drag-mode="move"
                  :highlight="false"
                  :min-crop-box-width="270"
                  :min-crop-box-height="320"
                  :min-container-width="270"
                  :min-container-height="320"
                  :check-orientation="false"
                  :crop-box-resizable="false"
                >
                </VueCropper>
                <!-- </div> -->
              </DefaultPanel>
            </div>
            <!-- <template #footer> -->
            <div class="flex flex-wrap justify-center w-full pt-4 my-auto gap-x-[5.5rem]">
              <ButtonDefault type="button" class="w-1/3" color="danger" @click="modalStore.closeModal">
                Schließen
              </ButtonDefault>
              <ButtonDefault class="w-1/3" color="success" @click="saveAvatar"> Speichern </ButtonDefault>
            </div>
            <!-- </template> -->
            <!-- </UCard> -->
          </div>
        </div>
      </template>
      <template v-if="modalStore.type === 'cred-change'">
        <div>
          <h3>ACHTUNG!</h3>
          <p>Du hast deine Anmeldedaten geändert!</p>
          <p>Dein Passwort und/oder dein Anmeldename ist nun anders.</p>
          <p v-if="modalStore.data.username">
            Dein neuer Anmeldename ist nun: <code>&apos;{{ modalStore.data.username }}&apos;</code>
          </p>
          <p v-if="modalStore.data.password">
            Dein neues Passwort ist nun: <code>&apos;{{ modalStore.data.password }}&apos;</code>
          </p>
        </div>
      </template>
    </template>
    <div class="flex flex-col w-full divide-y divide-bsecondary">
      <div class="relative flex items-center p-5 mb-5 rounded-lg bg-bsecondary">
        <!-- TODO: ADD LOADING STATE TO AVATAR -->
        <div
          class="flex mr-6 relative overflow-hidden border-4 sm:border-[6px] border-primary rounded-full h-20 w-20 sm:h-36 sm:w-36 focus:outline-none group bg-white/5"
        >
          <NuxtImg :src="user?.avatar" class="z-10 object-cover w-full h-full" />
          <div class="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit">
            <LoadingBasic class="w-10 h-10 text-white" />
          </div>
        </div>
        <div class="flex-1 overflow-hidden outline-none">
          <p class="p-0 text-sm font-bold text-white sm:text-base whitespace-nowrap">
            {{ user?.full_name }}
          </p>
          <p class="flex items-center p-0 space-x-1 text-sm sm:text-base text-btertiary">
            <Icon name="heroicons:at-symbol-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <span class="my-auto">{{ user?.login_email }}</span>
          </p>
          <!-- TODO: -->
          <!-- <p class="flex items-center p-0 space-x-1 text-btertiary">
          <template v-if="user?.current_residencee">
            <Icon name="heroicons:map-pin-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <span class="my-auto">
              <NuxtLink
                :to="'/verseexkurs/starmap/' + user?.currentplace?.planet?.system?.slug"
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.planet?.system?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/verseexkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace.planet?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/verseexkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug +
                  '/' +
                  user?.currentplace?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.name }}
              </NuxtLink>
            </span>
          </template>
        </p> -->
          <p class="text-[#444] items-center flex space-x-1 text-sm sm:text-base absolute bottom-4 p-0">
            <Icon name="ph:address-book-bold" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <NuxtLink
              :to="user?.biography_ams_link"
              class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-primary animate-link"
            >
              Biografie
            </NuxtLink>
          </p>
        </div>
      </div>
      <UHorizontalNavigation
        :links="links"
        class="relative flex flex-wrap items-center justify-between w-full no-list"
      />
      <NuxtPage @cropper-input="setCropperImage" />
    </div>
  </NuxtLayout>
</template>

<style lang="postcss">
.no-list ul {
  @apply list-none pl-0;
}

.no-list li {
  @apply marker:hidden pb-0;
}
</style>
